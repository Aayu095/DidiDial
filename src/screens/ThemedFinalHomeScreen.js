 import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';
import GradientBackground from '../components/GradientBackground';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';

const { width } = Dimensions.get('window');

// Inspirational quotes for women empowerment
const INSPIRATIONAL_QUOTES = [
  {
    hindi: "शिक्षा ही महिलाओं की सबसे बड़ी शक्ति है।",
    english: "Education is the greatest power of women.",
    author: "दीदी"
  },
  {
    hindi: "आप जितना सीखेंगी, उतना ही आगे बढ़ेंगी।",
    english: "The more you learn, the more you grow.",
    author: "दीदी"
  },
  {
    hindi: "हर महिला में कुछ खास करने की शक्ति है।",
    english: "Every woman has the power to do something special.",
    author: "दीदी"
  },
  {
    hindi: "ज्ञान ही वह चाबी है जो हर दरवाजा खोल देती है।",
    english: "Knowledge is the key that opens every door.",
    author: "दीदी"
  },
  {
    hindi: "आपकी मेहनत आपको सफलता तक ले जाएगी।",
    english: "Your hard work will lead you to success.",
    author: "दीदी"
  },
  {
    hindi: "सीखना कभी बंद न करें, यही आपकी असली ताकत है।",
    english: "Never stop learning, that's your real strength.",
    author: "दीदी"
  }
];

// Main navigation options - Voice Learning FIRST (Most Important Feature)
// All cards use the same brown gradient for consistency
const MAIN_OPTIONS = [
  {
    id: 'didi_voice_learning',
    title: 'Didi se Bolkar Seekhiye',
    subtitle: 'दीदी से बोलकर सीखिए',
    description: 'आवाज़ में सवाल पूछें और सीखें',
    icon: '🗣️',
    color: ['#8B7355', '#A67C52'], // Same brown gradient for all cards
    screen: 'GeminiVoiceCall'
  },
  {
    id: 'video_learning',
    title: 'Video se Seekhiye',
    subtitle: 'वीडियो से सीखिए',
    description: 'वीडियो देखकर सीखें',
    icon: '🎬',
    color: ['#8B7355', '#A67C52'], // Same brown gradient for all cards
    screen: 'VideoLearning'
  },
  {
    id: 'module_learning',
    title: 'Modules se Seekhiye',
    subtitle: 'मॉड्यूल से सीखिए',
    description: 'पढ़कर सीखें',
    icon: '📚',
    color: ['#8B7355', '#A67C52'], // Same brown gradient for all cards
    screen: 'ModuleLearning'
  },
  {
    id: 'progress',
    title: 'Pragati Dekhiye',
    subtitle: 'प्रगति देखिए',
    description: 'अपनी प्रगति देखें',
    icon: '📊',
    color: ['#8B7355', '#A67C52'], // Same brown gradient for all cards
    screen: 'SeparateProgress'
  },
  {
    id: 'community',
    title: 'Samudaya',
    subtitle: 'समुदाय',
    description: 'समुदाय से जुड़ें',
    icon: '👥',
    color: ['#8B7355', '#A67C52'], // Same brown gradient for all cards
    screen: 'Community'
  }
];

export default function ThemedFinalHomeScreen({ navigation }) {
  const { profile } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    // Welcome message
    setTimeout(() => {
      const welcomeMessage = `नमस्ते ${profile?.name || 'बहन'}! आज क्या सीखना चाहती हैं?`;
      speakText(welcomeMessage);
    }, 1500);

    // Change quote every 10 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % INSPIRATIONAL_QUOTES.length);
    }, 10000);

    return () => clearInterval(quoteInterval);
  }, []);

  const speakText = (text, onComplete = null) => {
    setIsPlaying(true);
    Speech.speak(text, {
      language: profile?.language || 'hi-IN',
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

  const getGreeting = () => {
    const name = profile?.name || 'बहन';
    const hour = new Date().getHours();
    let greeting = 'नमस्ते';
    
    if (hour < 12) greeting = 'सुप्रभात';
    else if (hour < 17) greeting = 'नमस्ते';
    else greeting = 'शुभ संध्या';
    
    return `${greeting}, ${name}! 🙏`;
  };

  const getMotivationalMessage = () => {
    const messages = [
      'आज कुछ नया सीखने के लिए तैयार हैं? 📚',
      'सीखना कभी बंद न करें! आप बहुत अच्छा कर रही हैं! 🌟',
      'हर दिन एक नया कदम, सफलता की ओर! 🚀',
      'ज्ञान ही शक्ति है! आगे बढ़ते रहें! 💪',
      'आपकी मेहनत रंग लाएगी! 🌈'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleOptionPress = (option) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Navigate to appropriate screen based on option
    switch (option.screen) {
      case 'GeminiVoiceCall':
        // Navigate to voice learning (MOST IMPORTANT FEATURE)
        navigation.navigate('GeminiVoiceCall', {
          topic: 'general_health'
        });
        break;
      case 'VideoLearning':
        // Navigate to video learning categories screen first
        navigation.navigate('VideoLearningCategories');
        break;
      case 'ModuleLearning':
        // Navigate to module learning categories screen first
        navigation.navigate('ModuleLearningCategories');
        break;
      case 'SeparateProgress':
        // Navigate to progress screen
        navigation.navigate('SeparateProgress');
        break;
      case 'Community':
        // Navigate to community screen
        navigation.navigate('Community');
        break;
      default:
        break;
    }
  };

  const renderHeader = () => (
    <Animatable.View animation="fadeInDown" style={styles.headerSection}>
      <Text style={styles.greeting}>{getGreeting()}</Text>
      <Text style={styles.motivationalMessage}>{getMotivationalMessage()}</Text>
    </Animatable.View>
  );

  const renderDidiSection = () => (
    <Animatable.View animation="zoomIn" delay={300} style={styles.didiSection}>
      <AnimatedDidiAvatar
        isSpeaking={isPlaying}
        emotion="welcoming"
        size={100}
      />
      <View style={styles.didiQuoteContainer}>
        <Text style={styles.didiQuote}>
          {isPlaying ? 'दीदी बोल रही हैं...' : INSPIRATIONAL_QUOTES[currentQuote].hindi}
        </Text>
        {!isPlaying && (
          <Text style={styles.didiQuoteEnglish}>
            {INSPIRATIONAL_QUOTES[currentQuote].english}
          </Text>
        )}
      </View>
    </Animatable.View>
  );

  const renderMainOptions = () => (
    <Animatable.View animation="fadeInUp" delay={500} style={styles.optionsSection}>
      <Text style={styles.sectionTitle}>आज क्या सीखना चाहती हैं?</Text>
      <View style={styles.optionsGrid}>
        {MAIN_OPTIONS.map((option, index) => (
          <Animatable.View
            key={option.id}
            animation="fadeInUp"
            delay={600 + (index * 100)}
            style={styles.optionWrapper}
          >
            <Pressable
              style={styles.optionCard}
              onPress={() => handleOptionPress(option)}
            >
              <LinearGradient
                colors={option.color}
                style={styles.optionGradient}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </LinearGradient>
            </Pressable>
          </Animatable.View>
        ))}
      </View>
    </Animatable.View>
  );

  const renderInspirationalQuotes = () => (
    <Animatable.View animation="fadeInUp" delay={1000} style={styles.quotesSection}>
      <Text style={styles.quotesSectionTitle}>आपके लिए प्रेरणा</Text>
      <View style={styles.quotesContainer}>
        {INSPIRATIONAL_QUOTES.slice(0, 3).map((quote, index) => (
          <Animatable.View
            key={index}
            animation="fadeInLeft"
            delay={1100 + (index * 200)}
            style={styles.quoteCard}
          >
            <Text style={styles.quoteText}>"{quote.hindi}"</Text>
            <Text style={styles.quoteEnglish}>"{quote.english}"</Text>
            <Text style={styles.quoteAuthor}>- {quote.author}</Text>
          </Animatable.View>
        ))}
      </View>
      
      {/* Voice Control for Quotes - Same brown gradient as cards */}
      <Pressable 
        style={styles.voiceQuoteButton}
        onPress={() => speakText(INSPIRATIONAL_QUOTES[currentQuote].hindi)}
        disabled={isPlaying}
      >
        <LinearGradient
          colors={['#8B7355', '#A67C52']} // Same brown gradient as cards
          style={styles.voiceQuoteGradient}
        >
          <Text style={styles.voiceQuoteIcon}>🔊</Text>
          <Text style={styles.voiceQuoteText}>
            {isPlaying ? 'बोल रही हूं...' : 'प्रेरणा सुनें'}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animatable.View>
  );

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderDidiSection()}
        {renderMainOptions()}
        {renderInspirationalQuotes()}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  motivationalMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.primary[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  didiSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  didiQuoteContainer: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  didiQuote: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  didiQuoteEnglish: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  optionsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  optionsGrid: {
    gap: SPACING.md,
  },
  optionWrapper: {
    marginBottom: SPACING.md,
  },
  optionCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  optionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  optionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  quotesSection: {
    marginBottom: SPACING.xl,
  },
  quotesSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  quotesContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quoteCard: {
    backgroundColor: COLORS.primary[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  quoteText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  quoteEnglish: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  quoteAuthor: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'right',
  },
  voiceQuoteButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    alignSelf: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  voiceQuoteGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  voiceQuoteIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  voiceQuoteText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});