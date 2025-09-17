import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Modal, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import { v4 as uuidv4 } from 'uuid';
import { LinearGradient } from 'expo-linear-gradient';

import { ENHANCED_CONTENT_PACKS } from '../services/offlineContent';
import { sendToLLM } from '../services/enhancedGeminiVoiceAssistant';
import { saveTurnToFirestore, initFirebase, updateStreakAndBadges } from '../services/firebase';
import { useAuth } from '../providers/AuthProvider';
import GradientBackground from '../components/GradientBackground';
import VoiceVisualizer from '../components/VoiceVisualizer';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';
import { COLORS, theme, MOTIVATIONAL_MESSAGES, FESTIVAL_GREETINGS } from '../config/theme';

// Helper function to get initial prompt for pack
function getInitialPromptForPack(packId) {
  const pack = ENHANCED_CONTENT_PACKS.find(p => p.id === packId);
  if (!pack) {
    return {
      opening: 'नमस्ते बहन! मैं दीदी हूं। आज हम कुछ नया सीखेंगे। तैयार हो?',
      system: 'You are Didi, a helpful mentor speaking in simple Hindi. Keep responses short and friendly.'
    };
  }
  
  return {
    opening: pack.opening,
    system: pack.system
  };
}

export default function EnhancedCallScreen({ navigation, route }) {
  const { packId, shouldDownload } = route.params || {};
  const { profile } = useAuth();
  const [sessionId] = useState(uuidv4());
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceIntensity, setVoiceIntensity] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [avatarEmotion, setAvatarEmotion] = useState('neutral');
  const conversationRef = useRef([]);
  const callStartTime = useRef(Date.now());

  // Enhanced pack data
  const selectedPack = useMemo(() => 
    ENHANCED_CONTENT_PACKS.find(p => p.id === packId) || ENHANCED_CONTENT_PACKS[0], 
    [packId]
  );

  useEffect(() => {
    initFirebase();
    startCall();
    
    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [packId, profile]);

  const startCall = async () => {
    try {
      // Get enhanced initial prompt
      const intro = getInitialPromptForPack(packId);
      conversationRef.current.push({ role: 'system', content: intro });
      
      // Personalized opening with cultural greeting
      const hour = new Date().getHours();
      let greeting = 'नमस्ते';
      if (hour < 12) greeting = 'सुप्रभात';
      else if (hour < 17) greeting = 'नमस्ते';
      else greeting = 'शुभ संध्या';

      const personalizedOpening = intro.opening
        .replace('Namaste behen', `${greeting} ${profile?.name || 'बहन'}`)
        .replace('नमस्ते बहन', `${greeting} ${profile?.name || 'बहन'}`);
      
      await speak(personalizedOpening);
      setLog([{ role: 'assistant', content: personalizedOpening, timestamp: Date.now() }]);
    } catch (error) {
      console.error('Error starting call:', error);
      Alert.alert('त्रुटि', 'कॉल शुरू करने में समस्या हुई। कृपया फिर से कोशिश करें।');
    }
  };

  const speak = async (text) => {
    try {
      await Speech.stop();
      setIsListening(true);
      
      // Enhanced speech with better voice settings
      Speech.speak(text, {
        language: profile?.language || 'hi-IN',
        pitch: 1.1, // Slightly higher pitch for female voice
        rate: 0.85, // Slower for better comprehension
        voice: undefined,
        onStart: () => setIsListening(true),
        onDone: () => {
          setIsListening(false);
          setVoiceIntensity(0);
        },
        onStopped: () => {
          setIsListening(false);
          setVoiceIntensity(0);
        },
      });

      // Simulate voice intensity animation
      const intensityInterval = setInterval(() => {
        setVoiceIntensity(Math.random() * 0.8 + 0.2);
      }, 200);

      setTimeout(() => {
        clearInterval(intensityInterval);
        setVoiceIntensity(0);
      }, text.length * 80); // Approximate speaking duration
    } catch (error) {
      console.error('Speech error:', error);
      setIsListening(false);
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'माइक्रोफोन की अनुमति चाहिए',
          'दीदी से बात करने के लिए माइक्रोफोन की अनुमति दें।',
          [{ text: 'ठीक है', onPress: () => setIsRecording(false) }]
        );
        return;
      }

      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: true, 
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await rec.startAsync();
      setRecording(rec);
    } catch (e) {
      console.error('startRecording error', e);
      setIsRecording(false);
      Alert.alert('त्रुटि', 'रिकॉर्डिंग शुरू करने में समस्या हुई।');
    }
  };

  const stopRecording = async () => {
    try {
      setBusy(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        setIsRecording(false);
        await handleUserAudio(uri);
      }
    } catch (e) {
      console.error('stopRecording error', e);
      setIsRecording(false);
      setBusy(false);
      Alert.alert('त्रुटि', 'रिकॉर्डिंग रोकने में समस्या हुई।');
    }
  };

  const handleUserAudio = async (uri) => {
    try {
      // Enhanced STT simulation with more realistic responses
      const contextualResponses = [
        'हां दीदी, मुझे समझ आया',
        'जी हां, बताइए',
        'ठीक है दीदी',
        'और क्या करना चाहिए?',
        'यह बहुत अच्छी जानकारी है',
        'मैं यह करूंगी',
        'धन्यवाद दीदी',
      ];
      
      const fakeTranscript = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
      
      const userMessage = { 
        role: 'user', 
        content: fakeTranscript, 
        timestamp: Date.now(),
        audioUri: uri 
      };
      
      setLog(prev => [...prev, userMessage]);
      conversationRef.current.push({ role: 'user', content: fakeTranscript });

      // Get AI response with enhanced context
      const llmResponse = await sendToLLM(conversationRef.current, packId);
      
      const assistantMessage = {
        role: 'assistant',
        content: llmResponse.text,
        timestamp: Date.now(),
      };
      
      setLog(prev => [...prev, assistantMessage]);
      conversationRef.current.push({ role: 'assistant', content: llmResponse.text });

      // Update avatar emotion based on response content
      updateAvatarEmotion(llmResponse.text);
      
      await speak(llmResponse.text);

      // Save to Firebase with enhanced metadata
      await saveTurnToFirestore({ 
        sessionId, 
        packId, 
        user: fakeTranscript, 
        assistant: llmResponse.text,
        timestamp: Date.now(),
        callDuration,
        packTitle: selectedPack.title,
      });

      // Update user progress
      if (profile?.uid) {
        try { 
          await updateStreakAndBadges(profile.uid);
          
          // Show motivational message occasionally
          if (Math.random() < 0.3) {
            const motivationalMsg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
            setTimeout(() => {
              Alert.alert('🌟', motivationalMsg, [{ text: 'धन्यवाद!' }]);
            }, 2000);
          }
        } catch (error) {
          console.warn('Error updating progress:', error);
        }
      }

      if (llmResponse?.endCall) {
        setTimeout(() => setShowEnd(true), 1000);
      }
    } catch (e) {
      console.error('handleUserAudio', e);
      Alert.alert('त्रुटि', 'आपकी आवाज़ समझने में समस्या हुई। कृपया फिर से कोशिश करें।');
    } finally {
      setBusy(false);
    }
  };

  const endCall = () => {
    Speech.stop();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Show call summary
    const duration = Math.floor(callDuration / 60);
    const summary = `आपने ${duration} मिनट तक दीदी से बात की। बहुत बढ़िया!`;
    
    Alert.alert(
      'कॉल समाप्त',
      summary,
      [
        { text: 'प्रगति देखें', onPress: () => navigation.replace('Progress') },
        { text: 'होम जाएं', onPress: () => navigation.replace('Home') }
      ]
    );
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateAvatarEmotion = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('बधाई') || lowerText.includes('शाबाश') || lowerText.includes('अच्छा')) {
      setAvatarEmotion('proud');
    } else if (lowerText.includes('सोच') || lowerText.includes('विचार') || lowerText.includes('समझ')) {
      setAvatarEmotion('thinking');
    } else if (lowerText.includes('चिंता') || lowerText.includes('समस्या') || lowerText.includes('परेशान')) {
      setAvatarEmotion('concerned');
    } else if (lowerText.includes('खुश') || lowerText.includes('प्रसन्न') || lowerText.includes('मज़ा')) {
      setAvatarEmotion('happy');
    } else if (lowerText.includes('प्रोत्साह') || lowerText.includes('हिम्मत') || lowerText.includes('कोशिश')) {
      setAvatarEmotion('encouraging');
    } else {
      setAvatarEmotion('neutral');
    }
    
    // Reset to neutral after 3 seconds
    setTimeout(() => setAvatarEmotion('neutral'), 3000);
  };

  const assistantSuggestsOptions = useMemo(() => {
    const last = log.slice().reverse().find((m) => m.role === 'assistant');
    if (!last) return false;
    return /option\s*1|option\s*2|option\s*3|1\)|2\)|3\)/i.test(last.content) || 
           /Option\s*1|Option\s*2|Option\s*3/i.test(last.content);
  }, [log]);

  const chooseOption = async (opt) => {
    try {
      const spoken = `option ${opt} दीदी`;
      const userMessage = { role: 'user', content: spoken, timestamp: Date.now() };
      setLog(prev => [...prev, userMessage]);
      conversationRef.current.push({ role: 'user', content: spoken });
      
      setBusy(true);
      const llmResponse = await sendToLLM(conversationRef.current, packId);
      
      const assistantMessage = { role: 'assistant', content: llmResponse.text, timestamp: Date.now() };
      setLog(prev => [...prev, assistantMessage]);
      conversationRef.current.push({ role: 'assistant', content: llmResponse.text });
      
      await speak(llmResponse.text);
      await saveTurnToFirestore({ sessionId, packId, user: spoken, assistant: llmResponse.text });
      
      if (profile?.uid) {
        try { await updateStreakAndBadges(profile.uid); } catch {}
      }
      if (llmResponse?.endCall) setShowEnd(true);
    } catch (e) {
      console.warn('chooseOption', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <GradientBackground colors={selectedPack.color || [COLORS.background.primary, COLORS.background.surface]}>
      <View style={styles.container}>
        {/* Enhanced Header */}
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <View style={styles.callInfo}>
            <Text style={styles.packTitle}>{selectedPack.title}</Text>
            <Text style={styles.callStatus}>
              {isListening ? '🎙️ दीदी बोल रही हैं...' : '📞 कॉल चालू'}
            </Text>
            <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
          </View>
        </Animatable.View>

        {/* Animated Didi Avatar */}
        <Animatable.View animation="zoomIn" delay={300} style={styles.avatarSection}>
          <AnimatedDidiAvatar
            isListening={isRecording}
            isSpeaking={isListening}
            emotion={avatarEmotion}
            size={140}
          />
          <Text style={styles.didiName}>दीदी</Text>
          <VoiceVisualizer isActive={isListening} intensity={voiceIntensity} />
        </Animatable.View>

        {/* Conversation Log */}
        {showTranscript && (
          <Animatable.View animation="fadeInUp" delay={500} style={styles.logContainer}>
            <View style={styles.logHeader}>
              <Text style={styles.logTitle}>बातचीत</Text>
              <Pressable onPress={() => setShowTranscript(!showTranscript)}>
                <Text style={styles.toggleText}>छुपाएं</Text>
              </Pressable>
            </View>
            <View style={styles.logBox}>
              {log.slice(-3).map((item, idx) => (
                <Animatable.View 
                  key={`${item.timestamp}-${idx}`}
                  animation="fadeInUp"
                  delay={idx * 100}
                  style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}
                >
                  <Text style={styles.bubbleText}>{item.content}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleTimeString('hi-IN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </Animatable.View>
              ))}
            </View>
          </Animatable.View>
        )}

        {/* Controls */}
        <Animatable.View animation="fadeInUp" delay={700} style={styles.controls}>
          {!isRecording ? (
            <Pressable 
              style={[styles.button, styles.micBtn, busy && styles.disabledBtn]} 
              onPress={startRecording} 
              disabled={busy || isListening}
            >
              <Text style={styles.btnIcon}>🎤</Text>
              <Text style={styles.btnText}>
                {busy ? 'प्रतीक्षा करें...' : isListening ? 'सुन रहे हैं...' : 'बोलें'}
              </Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.button, styles.stopBtn]} onPress={stopRecording}>
              <Text style={styles.btnIcon}>⏹️</Text>
              <Text style={styles.btnText}>रोकें</Text>
            </Pressable>
          )}
          
          <Pressable style={[styles.button, styles.endBtn]} onPress={endCall}>
            <Text style={styles.btnIcon}>📞</Text>
            <Text style={styles.btnText}>समाप्त</Text>
          </Pressable>
        </Animatable.View>

        {/* Quick Options */}
        {assistantSuggestsOptions && (
          <Animatable.View animation="slideInUp" style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>त्वरित जवाब:</Text>
            <View style={styles.keypadRow}>
              {[1,2,3].map((k) => (
                <Pressable key={k} onPress={() => chooseOption(k)} style={styles.padKey}>
                  <Text style={styles.padKeyText}>{k}</Text>
                </Pressable>
              ))}
            </View>
          </Animatable.View>
        )}

        {/* End Call Modal */}
        <Modal transparent visible={showEnd} animationType="fade">
          <BlurView intensity={80} style={styles.modalWrap}>
            <Animatable.View animation="bounceIn" style={styles.modalCard}>
              <Text style={styles.modalIcon}>🎉</Text>
              <Text style={styles.modalTitle}>
                शाबाश {profile?.name || 'बहन'}!
              </Text>
              <Text style={styles.modalSubtitle}>
                आपने बहुत अच्छा सीखा। कल फिर मिलते हैं! 
              </Text>
              <Text style={styles.modalStats}>
                📞 कॉल अवधि: {formatDuration(callDuration)}
              </Text>
              <Text style={styles.modalStats}>
                💬 बातचीत: {log.length} संदेश
              </Text>
              
              <View style={styles.modalButtons}>
                <Pressable onPress={() => navigation.replace('Progress')} style={styles.modalBtn}>
                  <Text style={styles.modalBtnText}>प्रगति देखें</Text>
                </Pressable>
                <Pressable onPress={endCall} style={[styles.modalBtn, styles.primaryModalBtn]}>
                  <Text style={[styles.modalBtnText, styles.primaryModalBtnText]}>बंद करें</Text>
                </Pressable>
              </View>
            </Animatable.View>
          </BlurView>
        </Modal>

        {/* Loading Overlay */}
        {busy && (
          <View style={styles.busyOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary[400]} />
            <Text style={styles.busyText}>प्रतीक्षा करें...</Text>
          </View>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  callInfo: {
    alignItems: 'center',
  },
  packTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.neutral.white,
    marginBottom: 4,
  },
  callStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  callDuration: {
    fontSize: 16,
    color: COLORS.primary[300],
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  pulseContainer: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
  },
  pulseRing: {
    flex: 1,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: COLORS.primary[400],
    opacity: 0.6,
  },
  didiName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.neutral.white,
    marginBottom: 16,
  },
  logContainer: {
    flex: 1,
    maxHeight: 200,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.primary[400],
  },
  logBox: {
    flex: 1,
    gap: 8,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bubbleText: {
    color: COLORS.neutral.white,
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  micBtn: {
    backgroundColor: COLORS.secondary[500],
  },
  stopBtn: {
    backgroundColor: COLORS.status.error,
  },
  endBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  btnIcon: {
    fontSize: 18,
  },
  btnText: {
    color: COLORS.neutral.white,
    fontWeight: '600',
    fontSize: 14,
  },
  optionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  optionsTitle: {
    fontSize: 14,
    color: COLORS.neutral.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  padKey: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary[400],
  },
  padKeyText: {
    color: COLORS.neutral.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.neutral.gray[800],
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.neutral.gray[600],
    textAlign: 'center',
    marginBottom: 16,
  },
  modalStats: {
    fontSize: 14,
    color: COLORS.neutral.gray[700],
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.neutral.gray[200],
    alignItems: 'center',
  },
  primaryModalBtn: {
    backgroundColor: COLORS.primary[500],
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.gray[700],
  },
  primaryModalBtnText: {
    color: COLORS.neutral.white,
  },
  busyOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  busyText: {
    color: COLORS.neutral.white,
    marginTop: 12,
    fontSize: 16,
  },
});