import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useAuth } from '../providers/AuthProvider';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { COLORS } from '../config/theme';

export default function MyProfileScreen() {
  const { profile, updateName, signOut } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [lang, setLang] = useState(profile?.language || 'hi-IN');
  const [busy, setBusy] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [voiceInputType, setVoiceInputType] = useState('name');

  useEffect(() => {
    setTimeout(() => {
      Speech.speak('नमस्ते! यह आपकी प्रोफाइल है। यहाँ आप अपनी जानकारी बदल सकते हैं।', {
        language: 'hi-IN',
        rate: 0.8,
      });
    }, 500);
  }, []);

  const save = async () => {
    try {
      setBusy(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (name && name !== profile?.name) await updateName(name);
      const db = getFirestore();
      await setDoc(doc(db, 'users', profile?.uid), { language: lang }, { merge: true });
      
      Alert.alert('सेव हो गया!', 'आपकी जानकारी अपडेट हो गई है।', [
        { text: 'ठीक है', onPress: () => {
          Speech.speak('आपकी जानकारी सेव हो गई है।', { language: 'hi-IN' });
        }}
      ]);
    } catch (e) {
      Alert.alert('त्रुटि', e?.message || 'जानकारी सेव करने में समस्या हुई');
    } finally {
      setBusy(false);
    }
  };

  const startVoiceInput = async (type) => {
    setVoiceInputType(type);
    setShowVoiceInput(true);
    
    const message = type === 'name' 
      ? 'अपना नाम बोलें' 
      : 'अपनी भाषा चुनें - हिंदी या अंग्रेजी';
    
    Speech.speak(message, { language: 'hi-IN', rate: 0.8 });
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'माइक्रोफोन की अनुमति चाहिए',
          'आवाज़ से जानकारी भरने के लिए माइक्रोफोन की अनुमति दें।'
        );
        setIsRecording(false);
        return;
      }

      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: true, 
        playsInSilentModeIOS: true 
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (e) {
      console.error('Recording error:', e);
      setIsRecording(false);
      Alert.alert('त्रुटि', 'रिकॉर्डिंग शुरू करने में समस्या हुई।');
    }
  };

  const stopRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
        
        // Simulate voice processing
        const mockResponses = {
          name: ['प्रिया', 'सुनीता', 'मीरा', 'कविता', 'अनीता'],
          language: ['हिंदी', 'अंग्रेजी']
        };

        const randomResponse = mockResponses[voiceInputType][
          Math.floor(Math.random() * mockResponses[voiceInputType].length)
        ];

        if (voiceInputType === 'name') {
          setName(randomResponse);
          Speech.speak(`आपका नाम ${randomResponse} सेट कर दिया गया।`, { language: 'hi-IN' });
        } else if (voiceInputType === 'language') {
          const langCode = randomResponse === 'हिंदी' ? 'hi-IN' : 'en-IN';
          setLang(langCode);
          Speech.speak(`भाषा ${randomResponse} सेट कर दी गई।`, { language: 'hi-IN' });
        }

        setShowVoiceInput(false);
      }
    } catch (e) {
      console.error('Stop recording error:', e);
      setIsRecording(false);
      Alert.alert('त्रुटि', 'रिकॉर्डिंग रोकने में समस्या हुई।');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'साइन आउट करें',
      'क्या आप वाकई साइन आउट करना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        { 
          text: 'हां, साइन आउट करें', 
          style: 'destructive',
          onPress: () => {
            Speech.speak('अलविदा! फिर मिलते हैं।', { language: 'hi-IN' });
            setTimeout(signOut, 1000);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <Text style={styles.title}>👤 मेरी प्रोफाइल</Text>
          <Text style={styles.subtitle}>My Profile</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={200} style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👩</Text>
            <Text style={styles.welcomeText}>नमस्ते {profile?.name || 'बहन'}!</Text>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={400} style={styles.inputSection}>
          <Text style={styles.label}>📝 आपका नाम</Text>
          <Text style={styles.labelEn}>Your Name</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              value={name} 
              onChangeText={setName}
              placeholder="अपना नाम लिखें"
              placeholderTextColor={COLORS.text.secondary}
            />
            <Pressable 
              style={styles.voiceButton}
              onPress={() => startVoiceInput('name')}
            >
              <Text style={styles.voiceButtonText}>🎤</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>💡 आवाज़ से भी नाम बोल सकते हैं</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={600} style={styles.inputSection}>
          <Text style={styles.label}>🗣️ भाषा चुनें</Text>
          <Text style={styles.labelEn}>Choose Language</Text>
          <View style={styles.langRow}>
            <Pressable 
              onPress={() => setLang('hi-IN')} 
              style={[styles.langPill, lang === 'hi-IN' && styles.langPillActive]}
            >
              <Text style={[styles.langText, lang === 'hi-IN' && styles.langTextActive]}>
                🇮🇳 हिंदी
              </Text>
            </Pressable>
            <Pressable 
              onPress={() => setLang('en-IN')} 
              style={[styles.langPill, lang === 'en-IN' && styles.langPillActive]}
            >
              <Text style={[styles.langText, lang === 'en-IN' && styles.langTextActive]}>
                🇬🇧 English
              </Text>
            </Pressable>
          </View>
          <Pressable 
            style={styles.voiceLangButton}
            onPress={() => startVoiceInput('language')}
          >
            <Text style={styles.voiceLangButtonText}>🎤 आवाज़ से भाषा चुनें</Text>
          </Pressable>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={800} style={styles.saveSection}>
          <Pressable 
            onPress={save} 
            style={[styles.saveBtn, busy && styles.disabledBtn]} 
            disabled={busy}
          >
            <Text style={styles.saveText}>
              {busy ? '💾 सेव हो रहा है...' : '💾 सेव करें'}
            </Text>
          </Pressable>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={1000} style={styles.signoutSection}>
          <Pressable onPress={handleSignOut} style={styles.signoutBtn}>
            <Text style={styles.signoutText}>🚪 साइन आउट करें</Text>
          </Pressable>
        </Animatable.View>
      </ScrollView>

      <Modal
        visible={showVoiceInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVoiceInput(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="bounceIn" style={styles.voiceModal}>
            <Text style={styles.voiceModalTitle}>
              {voiceInputType === 'name' ? '📝 नाम बोलें' : '🗣️ भाषा चुनें'}
            </Text>
            <Text style={styles.voiceModalSubtitle}>
              {voiceInputType === 'name' 
                ? 'अपना नाम साफ़ आवाज़ में बोलें' 
                : 'हिंदी या अंग्रेजी बोलें'
              }
            </Text>
            
            {!isRecording ? (
              <Pressable style={styles.recordButton} onPress={startRecording}>
                <Text style={styles.recordButtonText}>🎤 रिकॉर्ड करें</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.stopButton} onPress={stopRecording}>
                <Text style={styles.stopButtonText}>⏹️ रोकें</Text>
              </Pressable>
            )}
            
            <Pressable 
              style={styles.cancelButton}
              onPress={() => setShowVoiceInput(false)}
            >
              <Text style={styles.cancelButtonText}>रद्द करें</Text>
            </Pressable>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background.primary 
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    fontSize: 64,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  label: { 
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  labelEn: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: { 
    flex: 1,
    backgroundColor: COLORS.background.surface,
    color: COLORS.text.primary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
  },
  voiceButton: {
    backgroundColor: COLORS.primary[500],
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonText: {
    fontSize: 20,
  },
  hint: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  langRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 12,
  },
  langPill: { 
    flex: 1,
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: COLORS.border,
    backgroundColor: COLORS.background.surface,
    alignItems: 'center',
  },
  langPillActive: { 
    backgroundColor: COLORS.primary[500], 
    borderColor: COLORS.primary[500],
  },
  langText: { 
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  langTextActive: { 
    color: '#fff',
  },
  voiceLangButton: {
    backgroundColor: COLORS.secondary[500],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  voiceLangButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  saveBtn: { 
    backgroundColor: COLORS.status.success,
    padding: 16, 
    borderRadius: 20, 
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.status.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  saveText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  signoutSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  signoutBtn: { 
    borderColor: COLORS.status.error, 
    borderWidth: 2, 
    padding: 16, 
    borderRadius: 20, 
    alignItems: 'center',
  },
  signoutText: { 
    color: COLORS.status.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  voiceModal: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  voiceModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  voiceModalSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  recordButton: {
    backgroundColor: COLORS.status.success,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 12,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: COLORS.status.error,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 12,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
});
