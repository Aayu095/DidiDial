import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Alert, 
  Dimensions, 
  Modal,
  ActivityIndicator,
  Vibration 
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { geminiVoiceAssistant, VOICE_TOPICS } from '../services/geminiVoiceAssistant';
import { useAuth } from '../providers/AuthProvider';
import GradientBackground from '../components/GradientBackground';
import VoiceVisualizer from '../components/VoiceVisualizer';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';

const { width, height } = Dimensions.get('window');

// Call status constants
const CALL_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  ENDED: 'ended'
};

export default function GeminiVoiceCallScreen({ route, navigation }) {
  const { topic = VOICE_TOPICS.GENERAL_HEALTH } = route.params || {};
  const { profile, updateProfile } = useAuth();
  
  // Call state
  const [callStatus, setCallStatus] = useState(CALL_STATUS.CONNECTING);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceIntensity, setVoiceIntensity] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  
  // Conversation state
  const [conversationLog, setConversationLog] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [avatarEmotion, setAvatarEmotion] = useState('welcoming');
  
  // Refs
  const callStartTime = useRef(Date.now());
  const intensityInterval = useRef(null);

  useEffect(() => {
    initializeCall();
    startCallTimer();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Set user profile in voice assistant
      geminiVoiceAssistant.setUserProfile(profile);
      
      // Start conversation with selected topic
      const initialResponse = await geminiVoiceAssistant.startConversation(topic);
      
      // Add to conversation log
      setConversationLog([{
        role: 'assistant',
        content: initialResponse.text,
        timestamp: Date.now()
      }]);
      
      // Simulate connection delay
      setTimeout(() => {
        setCallStatus(CALL_STATUS.CONNECTED);
        speakMessage(initialResponse.text, 'welcoming');
      }, 2000);
      
    } catch (error) {
      console.error('Error initializing call:', error);
      Alert.alert('कॉल कनेक्ट नहीं हो सका', 'कृपया फिर से कोशिश करें।');
      navigation.goBack();
    }
  };

  const startCallTimer = () => {
    const timer = setInterval(() => {
      if (callStatus !== CALL_STATUS.ENDED) {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  };

  const cleanup = () => {
    if (recording) {
      recording.stopAndUnloadAsync();
    }
    if (intensityInterval.current) {
      clearInterval(intensityInterval.current);
    }
    Speech.stop();
    geminiVoiceAssistant.clearConversation();
  };

  const speakMessage = async (text, emotion = 'neutral') => {
    try {
      setCallStatus(CALL_STATUS.SPEAKING);
      setAvatarEmotion(emotion);
      setCurrentMessage(text);
      
      // Start voice visualization
      startVoiceVisualization();
      
      Speech.speak(text, {
        language: profile?.language || 'hi-IN',
        rate: 0.8,
        pitch: 1.1,
        onStart: () => {
          setCallStatus(CALL_STATUS.SPEAKING);
        },
        onDone: () => {
          setCallStatus(CALL_STATUS.CONNECTED);
          setVoiceIntensity(0);
          setAvatarEmotion('neutral');
          if (intensityInterval.current) {
            clearInterval(intensityInterval.current);
          }
        },
        onError: () => {
          setCallStatus(CALL_STATUS.CONNECTED);
          setVoiceIntensity(0);
        }
      });
    } catch (error) {
      console.error('Speech error:', error);
      setCallStatus(CALL_STATUS.CONNECTED);
    }
  };

  const startVoiceVisualization = () => {
    if (intensityInterval.current) {
      clearInterval(intensityInterval.current);
    }
    
    intensityInterval.current = setInterval(() => {
      setVoiceIntensity(Math.random() * 0.8 + 0.2);
    }, 150);
  };

  const startRecording = async () => {
    try {
      if (callStatus === CALL_STATUS.SPEAKING) {
        // Stop current speech
        Speech.stop();
      }
      
      setIsRecording(true);
      setCallStatus(CALL_STATUS.LISTENING);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Vibration.vibrate(100);
      
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'माइक्रोफोन की अनुमति चाहिए',
          'दीदी से बात करने के लिए माइक्रोफोन की अनुमति दें।'
        );
        setIsRecording(false);
        setCallStatus(CALL_STATUS.CONNECTED);
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
        },
      });

      await rec.startAsync();
      setRecording(rec);
      
      // Start recording visualization
      startVoiceVisualization();
      
    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
      setCallStatus(CALL_STATUS.CONNECTED);
      Alert.alert('रिकॉर्डिंग में समस्या', 'कृपया फिर से कोशिश करें।');
    }
  };

  const stopRecording = async () => {
    try {
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        setIsRecording(false);
        setVoiceIntensity(0);
        
        if (intensityInterval.current) {
          clearInterval(intensityInterval.current);
        }
        
        await processUserAudio(uri);
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      setIsRecording(false);
      setIsProcessing(false);
      setCallStatus(CALL_STATUS.CONNECTED);
    }
  };

  const processUserAudio = async (audioUri) => {
    try {
      // Simulate speech-to-text with contextual responses
      const userMessage = generateContextualUserMessage();
      
      // Add user message to log
      const userLogEntry = {
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
        audioUri
      };
      setConversationLog(prev => [...prev, userLogEntry]);
      
      // Get AI response from Gemini
      const aiResponse = await geminiVoiceAssistant.sendMessage(userMessage);
      
      // Add AI response to log
      const aiLogEntry = {
        role: 'assistant',
        content: aiResponse.text,
        timestamp: Date.now()
      };
      setConversationLog(prev => [...prev, aiLogEntry]);
      
      // Determine emotion from response
      const emotion = determineEmotionFromText(aiResponse.text);
      
      // Speak the response
      await speakMessage(aiResponse.text, emotion);
      
      // Save conversation progress
      await saveConversationProgress(userMessage, aiResponse.text);
      
      // Check if call should end
      if (aiResponse.endCall) {
        setTimeout(() => {
          endCall();
        }, 2000);
      }
      
    } catch (error) {
      console.error('Process audio error:', error);
      const fallbackMessage = '���ुझे समझने में थोड़ी देर लगी। कृपया फिर से कहें।';
      await speakMessage(fallbackMessage, 'concerned');
    } finally {
      setIsProcessing(false);
      setCallStatus(CALL_STATUS.CONNECTED);
    }
  };

  const generateContextualUserMessage = () => {
    const contextualResponses = {
      [VOICE_TOPICS.MENSTRUAL_HEALTH]: [
        'दीदी, महावारी के बारे में बताइए',
        'मुझे दर्द बहुत होता है',
        'क्या यह सामान्य है?',
        'सफाई कैसे रखूं?',
        'पैड कैसे इस्तेमाल करूं?',
        'परिवार को कैसे बताऊं?'
      ],
      [VOICE_TOPICS.PREGNANCY_CARE]: [
        'गर्भावस्था में क्या खाना चाहिए?',
        'डॉक्टर से कब मिलना चाहिए?',
        'मुझे उल्टी आती है',
        'बच्चे की हलचल महसूस नहीं हो रही',
        'क्या व्यायाम कर सकती हूं?',
        'प्रसव की तैयारी कैसे करूं?'
      ],
      [VOICE_TOPICS.DIGITAL_LITERACY]: [
        'फोन कैसे चलाते हैं?',
        'UPI क्या है?',
        'पैसे कैसे भेजते हैं?',
        'WhatsApp कैसे इस्तेमाल करूं?',
        'इंटरनेट में क्या सावधानी रखूं?',
        'QR कोड कैसे स्कैन करूं?'
      ],
      [VOICE_TOPICS.GENERAL_HEALTH]: [
        'सेहत कैसे अच्छी रखूं?',
        'बच्चों का टीकाकरण कब कराएं?',
        'खाने में क्या शामिल करूं?',
        'सफाई कैसे रखूं?',
        'बुखार आए तो क्या करूं?',
        'डॉक्टर से कब मिलूं?'
      ]
    };
    
    const responses = contextualResponses[topic] || contextualResponses[VOICE_TOPICS.GENERAL_HEALTH];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const determineEmotionFromText = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('शाबाश') || lowerText.includes('बहुत अच्छा') || lowerText.includes('बधाई')) {
      return 'proud';
    } else if (lowerText.includes('चिंता') || lowerText.includes('समस्या') || lowerText.includes('डॉक्टर')) {
      return 'concerned';
    } else if (lowerText.includes('खुश') || lowerText.includes('अच्छा लगा')) {
      return 'happy';
    } else if (lowerText.includes('हिम्मत') || lowerText.includes('कोशिश') || lowerText.includes('सीखना')) {
      return 'encouraging';
    }
    return 'neutral';
  };

  const saveConversationProgress = async (userMessage, aiResponse) => {
    try {
      const conversationData = {
        topic,
        userMessage,
        aiResponse,
        timestamp: Date.now(),
        callDuration
      };
      
      // Update user profile with conversation progress
      const updatedProfile = {
        ...profile,
        voiceCallProgress: {
          ...profile?.voiceCallProgress,
          [topic]: {
            ...profile?.voiceCallProgress?.[topic],
            totalCalls: (profile?.voiceCallProgress?.[topic]?.totalCalls || 0) + 1,
            totalDuration: (profile?.voiceCallProgress?.[topic]?.totalDuration || 0) + callDuration,
            lastCall: Date.now(),
            conversations: [
              ...(profile?.voiceCallProgress?.[topic]?.conversations || []).slice(-9), // Keep last 10
              conversationData
            ]
          }
        }
      };
      
      await updateProfile(updatedProfile);
    } catch (error) {
      console.error('Error saving conversation progress:', error);
    }
  };

  const endCall = () => {
    setCallStatus(CALL_STATUS.ENDED);
    Speech.stop();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowEndModal(true);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTopicTitle = () => {
    const titles = {
      [VOICE_TOPICS.MENSTRUAL_HEALTH]: 'महावारी की जानकारी',
      [VOICE_TOPICS.PREGNANCY_CARE]: 'गर्भावस्था की देखभाल',
      [VOICE_TOPICS.DIGITAL_LITERACY]: 'डिजिटल साक्षरता',
      [VOICE_TOPICS.GENERAL_HEALTH]: 'सामान्य स्वास्थ्य'
    };
    return titles[topic] || 'दीदी से बात';
  };

  const renderCallHeader = () => (
    <Animatable.View animation="fadeInDown" style={styles.callHeader}>
      <View style={styles.callInfo}>
        <Text style={styles.topicTitle}>{getTopicTitle()}</Text>
        <Text style={styles.callStatusText}>
          {callStatus === CALL_STATUS.CONNECTING && '📞 कनेक्ट हो रहा है...'}
          {callStatus === CALL_STATUS.CONNECTED && '💬 बातचीत चालू'}
          {callStatus === CALL_STATUS.LISTENING && '🎤 सुन रही हूं...'}
          {callStatus === CALL_STATUS.SPEAKING && '🗣️ दीदी बोल रही हैं...'}
        </Text>
        <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
      </View>
    </Animatable.View>
  );

  const renderDidiAvatar = () => (
    <Animatable.View animation="zoomIn" delay={300} style={styles.avatarSection}>
      <View style={styles.avatarContainer}>
        <AnimatedDidiAvatar
          isListening={isRecording}
          isSpeaking={callStatus === CALL_STATUS.SPEAKING}
          emotion={avatarEmotion}
          size={180}
        />
        
        {/* Voice Visualizer */}
        <View style={styles.voiceVisualizerContainer}>
          <VoiceVisualizer 
            isActive={isRecording || callStatus === CALL_STATUS.SPEAKING} 
            intensity={voiceIntensity}
            color={isRecording ? COLORS.status.error : COLORS.primary[400]}
          />
        </View>
      </View>
      
      <Text style={styles.didiName}>दीदी</Text>
      <Text style={styles.didiStatus}>
        {callStatus === CALL_STATUS.CONNECTING && 'कनेक्ट हो रही हूं...'}
        {callStatus === CALL_STATUS.CONNECTED && 'आपका इंतज़ार कर रही हूं'}
        {callStatus === CALL_STATUS.LISTENING && 'आपकी बात सुन रही हूं...'}
        {callStatus === CALL_STATUS.SPEAKING && 'आपसे बात कर रही हूं...'}
      </Text>
      
      {/* Current Message Display */}
      {currentMessage && callStatus === CALL_STATUS.SPEAKING && (
        <View style={styles.messageContainer}>
          <Text style={styles.currentMessage}>{currentMessage}</Text>
        </View>
      )}
    </Animatable.View>
  );

  const renderCallControls = () => (
    <Animatable.View animation="fadeInUp" delay={500} style={styles.controlsSection}>
      {/* Main Call Button */}
      <View style={styles.mainControlContainer}>
        {!isRecording ? (
          <Pressable 
            style={[
              styles.callButton, 
              styles.micButton,
              (callStatus === CALL_STATUS.CONNECTING || isProcessing) && styles.disabledButton
            ]} 
            onPress={startRecording}
            disabled={callStatus === CALL_STATUS.CONNECTING || isProcessing}
          >
            <LinearGradient
              colors={isProcessing ? ['#ccc', '#999'] : ['#10B981', '#34D399']}
              style={styles.callButtonGradient}
            >
              {isProcessing ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <>
                  <Text style={styles.callButtonIcon}>����</Text>
                  <Text style={styles.callButtonText}>
                    {callStatus === CALL_STATUS.CONNECTING ? 'कनेक्ट हो रहा...' : 'बोलें'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable 
            style={[styles.callButton, styles.stopButton]} 
            onPress={stopRecording}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.callButtonGradient}
            >
              <Text style={styles.callButtonIcon}>⏹️</Text>
              <Text style={styles.callButtonText}>रोकें</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
      
      {/* Secondary Controls */}
      <View style={styles.secondaryControls}>
        <Pressable 
          style={styles.secondaryButton}
          onPress={() => Speech.stop()}
        >
          <Text style={styles.secondaryButtonIcon}>🔇</Text>
          <Text style={styles.secondaryButtonText}>चुप</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.secondaryButton, styles.endCallButton]}
          onPress={endCall}
        >
          <Text style={styles.secondaryButtonIcon}>��</Text>
          <Text style={styles.secondaryButtonText}>समाप्त</Text>
        </Pressable>
      </View>
    </Animatable.View>
  );

  const renderEndCallModal = () => (
    <Modal transparent visible={showEndModal} animationType="fade">
      <BlurView intensity={80} style={styles.modalOverlay}>
        <Animatable.View animation="bounceIn" style={styles.endCallModal}>
          <Text style={styles.modalIcon}>🎉</Text>
          <Text style={styles.modalTitle}>
            बहुत अच्छी बातचीत हुई!
          </Text>
          <Text style={styles.modalSubtitle}>
            आपने दीदी से {formatDuration(callDuration)} तक बात की
          </Text>
          
          <View style={styles.callSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{conversationLog.length}</Text>
              <Text style={styles.summaryLabel}>संदेश</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{getTopicTitle()}</Text>
              <Text style={styles.summaryLabel}>विषय</Text>
            </View>
          </View>
          
          <Text style={styles.modalMessage}>
            आज आपने बहुत कुछ सीखा। कल फिर दीदी से बात करिएगा!
          </Text>
          
          <View style={styles.modalButtons}>
            <Pressable 
              style={styles.modalButton}
              onPress={() => navigation.replace('Progress')}
            >
              <Text style={styles.modalButtonText}>प्रगति देखें</Text>
            </Pressable>
            <Pressable 
              style={[styles.modalButton, styles.primaryModalButton]}
              onPress={() => navigation.replace('Home')}
            >
              <Text style={[styles.modalButtonText, styles.primaryModalButtonText]}>
                होम जाएं
              </Text>
            </Pressable>
          </View>
        </Animatable.View>
      </BlurView>
    </Modal>
  );

  return (
    <GradientBackground colors={['#667eea', '#764ba2']}>
      <View style={styles.container}>
        {renderCallHeader()}
        {renderDidiAvatar()}
        {renderCallControls()}
        {renderEndCallModal()}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  callHeader: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  callInfo: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    minWidth: width * 0.8,
  },
  topicTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  callStatusText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.xs,
  },
  callDuration: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.primary[300],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  avatarSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  voiceVisualizerContainer: {
    position: 'absolute',
    top: -30,
    left: -30,
    right: -30,
    bottom: -30,
  },
  didiName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.sm,
  },
  didiStatus: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    maxWidth: width * 0.8,
    marginTop: SPACING.md,
  },
  currentMessage: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  controlsSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  mainControlContainer: {
    marginBottom: SPACING.lg,
  },
  callButton: {
    borderRadius: BORDER_RADIUS.full,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  callButtonGradient: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    minHeight: 160,
    borderRadius: BORDER_RADIUS.full,
  },
  callButtonIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  callButtonText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  disabledButton: {
    opacity: 0.6,
  },
  secondaryControls: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 80,
  },
  endCallButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  secondaryButtonIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  secondaryButtonText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  endCallModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING['2xl'],
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  modalIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  callSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[600],
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  modalMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.gray[200],
    alignItems: 'center',
  },
  primaryModalButton: {
    backgroundColor: COLORS.primary[500],
  },
  modalButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  primaryModalButtonText: {
    color: COLORS.neutral.white,
  },
});