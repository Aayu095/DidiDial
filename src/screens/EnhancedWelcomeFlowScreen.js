import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';
import GradientBackground from '../components/GradientBackground';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';

const { width, height } = Dimensions.get('window');

// Engaging Welcome Flow Steps
const WELCOME_STEPS = [
  {
    id: 'welcome',
    title: 'दीदीडायल में आपका स्वागत है! 🙏',
    subtitle: 'Welcome to DidiDial!',
    description: 'मैं दीदी हूं! मैं आपकी सबसे अच्छी दोस्त और गुरु बनना चाहती हूं। साथ मिलकर हम बहुत कुछ सीखेंगे!',
    icon: '🌟',
    voiceText: 'नमस्ते! मैं दीदी हूं। मैं आपकी सबसे अच्छी दोस्त बनूंगी और आपको बहुत कुछ सिखाऊंगी।',
    action: 'continue'
  },
  {
    id: 'excitement',
    title: 'आप कितनी उत्साहित हैं सीखने के लिए? 🚀',
    subtitle: 'How excited are you to learn?',
    description: 'मुझे बताइए कि आप कितनी उत्साहित हैं नई चीजें सीखने के लिए!',
    icon: '🎯',
    voiceText: 'आप कितनी उत्साहित हैं नई चीजें सीखने के लिए? मुझे बताइए!',
    action: 'select_excitement'
  },
  {
    id: 'learning_style',
    title: 'आप कैसे सीखना पसंद करती हैं? 🎨',
    subtitle: 'How do you like to learn?',
    description: 'हर इंसान अलग तरीके से सीखता है। आपका पसंदीदा तरीका कौन सा है?',
    icon: '🧠',
    voiceText: 'आप कैसे सीखना पसंद करती हैं? मुझे बताइए ताकि मैं आपकी मदद कर सकूं।',
    action: 'select_learning_style'
  },
  {
    id: 'daily_goal',
    title: 'रोज कितना समय दे सकती हैं सीखने के लिए? ⏰',
    subtitle: 'How much time can you dedicate daily?',
    description: 'थोड़ा सा समय भी काफी है! बताइए आप रोज कितना समय दे सकती हैं।',
    icon: '⏰',
    voiceText: 'आप रोज कितना समय दे सकती हैं सीखने के लिए? थोड़ा सा समय भी बहुत है।',
    action: 'select_time_commitment'
  },
  {
    id: 'motivation',
    title: 'आपको सबसे ज्यादा क्या प्रेरित करता है? 💪',
    subtitle: 'What motivates you the most?',
    description: 'जब आप कुछ नया सीखती हैं तो आपको सबसे ज्यादा खुशी किस बात से मिलती है?',
    icon: '💖',
    voiceText: 'आपको सबसे ज्यादा क्या प्रेरित करता है? क्या आपको खुशी देता है?',
    action: 'select_motivation'
  },
  {
    id: 'support_system',
    title: 'आप किसके साथ अपनी सफलता साझा करना चाहेंगी? 👥',
    subtitle: 'Who would you like to share your success with?',
    description: 'जब आप कुछ नया सीखेंगी तो किसे बताना चाहेंगी? यह आपको और भी प्रेरित करेगा!',
    icon: '🤗',
    voiceText: 'आप अपनी सफलता किसके साथ साझा करना चाहेंगी? परिवार, दोस्त या समुदाय के साथ?',
    action: 'select_support'
  },
  {
    id: 'ready',
    title: 'तैयार हैं शुरू करने के लिए? 🎉',
    subtitle: 'Ready to start your journey?',
    description: 'वाह! अब मैं आपको बहुत अच्छी तरह जानती हूं। चलिए अब साथ मिलकर सीखते हैं!',
    icon: '🚀',
    voiceText: 'बहुत बढ़िया! अब हम तैयार हैं। चलिए अब साथ मिलकर सीखते हैं!',
    action: 'complete'
  }
];

// Engaging Options for Each Step
const EXCITEMENT_OPTIONS = [
  { id: 'very_excited', name: 'बहुत उत्साहित! 🔥', icon: '🔥', description: 'मैं बहुत उत्साहित हूं!' },
  { id: 'excited', name: 'उत्साहित हूं 😊', icon: '😊', description: 'मैं उत्साहित हूं सीखने के लिए' },
  { id: 'curious', name: 'जिज्ञासु हूं 🤔', icon: '🤔', description: 'मुझे जानना है कि क्या होगा' },
  { id: 'nervous', name: 'थोड़ी घबराहट है 😅', icon: '😅', description: 'थोड़ी घबराहट है लेकिन सीखना चाहती हूं' }
];

const LEARNING_STYLE_OPTIONS = [
  { id: 'visual', name: 'देखकर सीखना 👀', icon: '👀', description: 'मुझे चित्र और वीडियो पसंद हैं' },
  { id: 'audio', name: 'सुनकर सीखना 👂', icon: '👂', description: 'मुझे बातचीत और आवाज़ पसंद है' },
  { id: 'hands_on', name: 'करके सीखना ✋', icon: '✋', description: 'मुझे खुद करके सीखना पसंद है' },
  { id: 'mixed', name: 'सब तरीकों से 🌟', icon: '🌟', description: 'मुझे सभी तरीके पसंद हैं' }
];

const TIME_COMMITMENT_OPTIONS = [
  { id: '5_minutes', name: '5 मिनट रोज ⚡', icon: '⚡', description: 'बस 5 मिनट रोज' },
  { id: '15_minutes', name: '15 मिनट रोज ⏰', icon: '⏰', description: '15 मिनट का समय दे सकती हूं' },
  { id: '30_minutes', name: '30 मिनट रोज 📚', icon: '📚', description: 'आधा घंटा रोज सीखूंगी' },
  { id: 'flexible', name: 'जब समय मिले 🕐', icon: '🕐', description: 'जब भी समय मिलेगा सीखूंगी' }
];

const MOTIVATION_OPTIONS = [
  { id: 'family', name: 'परिवार की खुशी 👨‍👩‍👧‍👦', icon: '👨‍👩‍👧‍👦', description: 'परिवार को गर्व महसूस कराना' },
  { id: 'independence', name: 'आत्मनिर्भरता 💪', icon: '💪', description: 'खुद पर निर्भर रहना' },
  { id: 'knowledge', name: 'ज्ञान की प्यास 🧠', icon: '🧠', description: 'नई चीजें जानने का शौक' },
  { id: 'helping_others', name: 'दूसरों की मदद 🤝', icon: '🤝', description: 'दूसरों की मदद करना' }
];

const SUPPORT_OPTIONS = [
  { id: 'family', name: 'परिवार के साथ 👨‍👩‍👧‍👦', icon: '👨‍👩‍👧‍👦', description: 'अपने परिवार के साथ साझा करूंगी' },
  { id: 'friends', name: 'दोस्तों के साथ 👭', icon: '👭', description: 'अपनी सहेलियों के साथ' },
  { id: 'community', name: 'समुदाय के साथ 🏘️', icon: '🏘️', description: 'अपने समुदाय के साथ' },
  { id: 'myself', name: 'खुद के साथ 🪞', icon: '🪞', description: 'पहले खुद को गर्व महसूस कराऊंगी' }
];

const DREAM_OPTIONS = [
  { id: 'education', name: 'शिक्षा पूरी करना 🎓', icon: '🎓', description: 'अपनी पढ़ाई पूरी करना चाहती हूं' },
  { id: 'job', name: 'अच्छी नौकरी पाना 💼', icon: '💼', description: 'एक अच्छी नौकरी पाना चाहती हूं' },
  { id: 'business', name: 'अपना व्यवसाय शुरू करना 🏪', icon: '🏪', description: 'अपना छोटा व्यवसाय शुरू करना चाहती हूं' },
  { id: 'family', name: 'परिवार की मदद करना 🏠', icon: '🏠', description: 'अपने परिवार की बेहतर मदद करना चाहती हूं' }
];

export default function EnhancedWelcomeFlowScreen({ navigation }) {
  const { user, profile, updateUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    excitement: '',
    learningStyle: '',
    timeCommitment: '',
    motivation: '',
    support: '',
    dream: ''
  });
  const [avatarEmotion, setAvatarEmotion] = useState('welcoming');

  const currentStepData = WELCOME_STEPS[currentStep];

  useEffect(() => {
    // Auto-play voice introduction for each step
    const timer = setTimeout(() => {
      speakText(currentStepData.voiceText);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const speakText = (text, onComplete = null) => {
    setIsPlaying(true);
    Speech.speak(text, {
      language: 'hi-IN',
      rate: 0.8,
      pitch: 1.1,
      onDone: () => {
        setIsPlaying(false);
        if (onComplete) onComplete();
      },
      onError: () => {
        setIsPlaying(false);
      }
    });
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep < WELCOME_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setAvatarEmotion('encouraging');
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setAvatarEmotion('neutral');
    }
  };

  const handleOptionSelect = (field, value) => {
    setUserPreferences(prev => ({ ...prev, [field]: value }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAvatarEmotion('happy');
    
    // Auto-advance after selection with a small delay
    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const completeOnboarding = async () => {
    try {
      if (!user) {
        console.error('No user found');
        return;
      }

      const updatedProfile = {
        ...userPreferences,
        welcomeCompleted: true,
        onboardingCompletedAt: Date.now(),
        language: 'hi-IN'
      };

      // Use the AuthProvider's updateUserProfile function which handles both local and remote updates
      await updateUserProfile(updatedProfile);

      const userName = profile?.name || user?.displayName || 'बहन';
      speakText(`स्वागत है ${userName}! अब आप सीखना शुरू कर सकती हैं।`);
      
      // The app will automatically re-render and show the home screen
      // once the profile is updated locally
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Even if there's an error, the profile should still be updated locally
      // and the app will proceed to the home screen automatically
    }
  };

  const getOptionsForCurrentStep = () => {
    switch (currentStepData.action) {
      case 'select_excitement':
        return EXCITEMENT_OPTIONS;
      case 'select_learning_style':
        return LEARNING_STYLE_OPTIONS;
      case 'select_time_commitment':
        return TIME_COMMITMENT_OPTIONS;
      case 'select_motivation':
        return MOTIVATION_OPTIONS;
      case 'select_support':
        return SUPPORT_OPTIONS;
      case 'select_dream':
        return DREAM_OPTIONS;
      default:
        return [];
    }
  };

  const getFieldForCurrentStep = () => {
    switch (currentStepData.action) {
      case 'select_excitement':
        return 'excitement';
      case 'select_learning_style':
        return 'learningStyle';
      case 'select_time_commitment':
        return 'timeCommitment';
      case 'select_motivation':
        return 'motivation';
      case 'select_support':
        return 'support';
      case 'select_dream':
        return 'dream';
      default:
        return '';
    }
  };

  const renderStepContent = () => {
    const options = getOptionsForCurrentStep();
    const field = getFieldForCurrentStep();

    if (options.length === 0) {
      return null;
    }

    return (
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            style={[
              styles.optionCard,
              userPreferences[field] === option.id && styles.selectedOption
            ]}
            onPress={() => handleOptionSelect(field, option.id)}
          >
            <Text style={styles.optionIcon}>
              {option.icon}
            </Text>
            <View style={styles.optionContent}>
              <Text style={[
                styles.optionName,
                userPreferences[field] === option.id && styles.selectedOptionText
              ]}>
                {option.name}
              </Text>
              <Text style={[
                styles.optionDescription,
                userPreferences[field] === option.id && styles.selectedOptionDescription
              ]}>
                {option.description}
              </Text>
            </View>
            {userPreferences[field] === option.id && (
              <Text style={styles.checkMark}>✅</Text>
            )}
          </Pressable>
        ))}
      </View>
    );
  };

  const canProceed = () => {
    const field = getFieldForCurrentStep();
    if (!field) return true;
    return userPreferences[field] !== '';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
        <View style={styles.container}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / WELCOME_STEPS.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} / {WELCOME_STEPS.length}
            </Text>
          </View>

          {/* Main Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Didi Avatar */}
            <Animatable.View 
              key={`avatar-${currentStep}`}
              animation="zoomIn" 
              style={styles.avatarSection}
            >
              <AnimatedDidiAvatar
                isSpeaking={isPlaying}
                emotion={avatarEmotion}
                size={110}
              />
              <Text style={styles.didiMessage}>
                {isPlaying ? 'दीदी बोल रही हैं...' : 'दीदी आपकी मदद कर रही हैं'}
              </Text>
            </Animatable.View>

            {/* Step Content */}
            <Animatable.View 
              key={`step-${currentStep}`}
              animation="fadeInUp" 
              style={styles.stepContainer}
            >
              <Text style={styles.stepIcon}>{currentStepData.icon}</Text>
              <Text style={styles.stepTitle}>{currentStepData.title}</Text>
              <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
              <Text style={styles.stepDescription}>{currentStepData.description}</Text>
              
              {renderStepContent()}
            </Animatable.View>
          </ScrollView>

          {/* Navigation Controls */}
          <View style={styles.navigationContainer}>
            <Pressable 
              style={[
                styles.navButton, 
                styles.backButton, 
                currentStep === 0 && styles.disabledButton
              ]}
              onPress={handleBack}
              disabled={currentStep === 0}
            >
              <Text style={[
                styles.navButtonText,
                currentStep === 0 && styles.disabledButtonText
              ]}>
                ← पीछे
              </Text>
            </Pressable>

            <Pressable 
              style={styles.voiceButton}
              onPress={() => speakText(currentStepData.voiceText)}
              disabled={isPlaying}
            >
              <Text style={styles.voiceButtonText}>
                {isPlaying ? '🔊 बोल रही हैं...' : '🔊 फिर से सुनें'}
              </Text>
            </Pressable>

            <Pressable 
              style={[
                styles.navButton, 
                styles.nextButton, 
                !canProceed() && styles.disabledButton
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={[
                styles.navButtonText,
                styles.nextButtonText,
                !canProceed() && styles.disabledButtonText
              ]}>
                {currentStep === WELCOME_STEPS.length - 1 ? 'शुरू करें 🚀' : 'आगे →'}
              </Text>
            </Pressable>
          </View>
        </View>
      </GradientBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.neutral.gray[300],
    borderRadius: 3,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary[500],
    borderRadius: 3,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  didiMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  stepContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepIcon: {
    fontSize: 50,
    marginBottom: SPACING.lg,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 28,
  },
  stepSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
  },
  optionsContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedOption: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
    shadowColor: COLORS.primary[500],
    shadowOpacity: 0.2,
    elevation: 3,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: SPACING.lg,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    lineHeight: 20,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
  },
  selectedOptionText: {
    color: COLORS.primary[700],
  },
  selectedOptionDescription: {
    color: COLORS.primary[600],
  },
  checkMark: {
    fontSize: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 80,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: COLORS.neutral.gray[200],
  },
  nextButton: {
    backgroundColor: COLORS.primary[500],
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: COLORS.text.secondary,
  },
  voiceButton: {
    backgroundColor: COLORS.secondary[500],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  voiceButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
});