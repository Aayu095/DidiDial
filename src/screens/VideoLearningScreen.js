import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  Image
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';
import GradientBackground from '../components/GradientBackground';
import ProgressRing from '../components/ProgressRing';

const { width, height } = Dimensions.get('window');

// Video-based Learning Modules for Under-Communities Women
const VIDEO_LEARNING_MODULES = [
  {
    id: 'menstrual_health',
    title: 'महावारी की सही जानकारी',
    subtitle: 'Menstrual Health Education',
    description: 'महावारी के बारे में सही और पूरी जानकारी सीखें',
    icon: '��',
    color: ['#EC4899', '#F472B6'],
    duration: '15 मिनट',
    difficulty: 'आसान',
    videos: [
      {
        id: 'what_is_menstruation',
        title: 'महावारी क्या है?',
        duration: '3 मिनट',
        thumbnail: '🩸',
        content: {
          videoScript: 'महावारी एक प्राकृतिक प्रक्रिया है जो हर महिला के साथ होती है। यह शरीर का सफाई का तरीका है।',
          keyPoints: [
            'महावारी 28 दिन में एक बार आती है',
            'यह 3-7 दिन तक रहती है',
            'यह बिल्कुल सामान्य और प्राकृतिक है',
            'इससे डरने की कोई बात नहीं है'
          ],
          practicalTips: [
            'साफ कपड़े या पैड का इस्तेमाल करें',
            'रोज नहाएं और साफ रहें',
            'पेट दर्द के लिए गर्म पानी की बोतल रखें'
          ]
        }
      },
      {
        id: 'menstrual_hygiene',
        title: 'महाव��री में सफाई',
        duration: '4 मिनट',
        thumbnail: '🧼',
        content: {
          videoScript: 'महावारी के दौरान सफाई बहुत जरूरी है। आइए सीखते हैं कि कैसे साफ रहें।',
          keyPoints: [
            'हर 4-6 घंटे में पैड बदलें',
            'साफ पानी से धोएं',
            'साबुन का इस्तेमाल करें',
            'सूखे और साफ कपड़े से पोंछें'
          ],
          practicalTips: [
            'इस्तेमाल किए गए पैड को कागज में लपेटकर फेंकें',
            'हाथ धोना न भूलें',
            'टाइट कपड़े न पहनें'
          ]
        }
      },
      {
        id: 'menstrual_myths',
        title: 'गलत धारणाओं को तोड़ें',
        duration: '5 मिनट',
        thumbnail: '❌',
        content: {
          videoScript: 'महावारी के बारे में कई गलत बातें कही जाती हैं। आइए सच जानते हैं।',
          keyPoints: [
            'महावारी में मंदिर जा सकते हैं',
            'खाना बना सकते हैं',
            'नहा सकते हैं',
            'सभी काम कर सकते हैं'
          ],
          practicalTips: [
            'अपने परिवार को सही जानकारी दें',
            'बेटियों को सही बातें सिखाएं',
            'डॉक्टर से सलाह लें'
          ]
        }
      }
    ]
  },
  {
    id: 'pregnancy_care',
    title: 'गर्भावस्था की देखभाल',
    subtitle: 'Pregnancy Care',
    description: 'गर्भावस्था के दौरान सही देखभाल सीखें',
    icon: '🤱',
    color: ['#10B981', '#34D399'],
    duration: '20 मिनट',
    difficulty: 'मध्यम',
    videos: [
      {
        id: 'pregnancy_nutrition',
        title: 'गर्भावस्था में खाना',
        duration: '6 मिनट',
        thumbnail: '🥗',
        content: {
          videoScript: 'गर्भावस्था में सही खाना बहुत जरूरी है। मां ���र बच्चे दोनों के लिए।',
          keyPoints: [
            'हरी सब्जियां रोज खाएं',
            'दूध और दही जरूर लें',
            'फल खाना न भूलें',
            'पानी ज्यादा पिएं'
          ],
          practicalTips: [
            'आयरन की गोली लें',
            'फोलिक एसिड जरूरी है',
            'चाय-कॉफी कम करें'
          ]
        }
      }
    ]
  },
  {
    id: 'digital_payments',
    title: 'डिजिटल पेमेंट सीखें',
    subtitle: 'Digital Payment Learning',
    description: 'फोन से पैसे भेजना और लेना सीखें',
    icon: '💳',
    color: ['#3B82F6', '#60A5FA'],
    duration: '25 मिनट',
    difficulty: 'मध्यम',
    videos: [
      {
        id: 'upi_basics',
        title: 'UPI क्या है?',
        duration: '5 मिनट',
        thumbnail: '📱',
        content: {
          videoScript: 'UPI से आप फोन से ही पैसे भेज और ले सकते हैं। यह बहुत आसान और सुरक्षित है।',
          keyPoints: [
            'UPI एक डिजिटल पेमेंट सिस्टम है',
            'फोन नंबर से पैसे भेज सकते हैं',
            'QR कोड स्कैन करके पेमेंट करें',
            'बैंक अकाउंट से जुड़ा होता है'
          ],
          practicalTips: [
            'हमेशा UPI PIN डालें',
            'गलत नंबर पर पैसे न भेजें',
            'रसीद जरूर चेक करें'
          ]
        }
      }
    ]
  }
];

export default function VideoLearningScreen({ route, navigation }) {
  const { moduleData } = route.params;
  const { profile, updateProfile } = useAuth();
  
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [moduleProgress, setModuleProgress] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  const currentVideo = moduleData.videos[currentVideoIndex];
  const totalVideos = moduleData.videos.length;

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    // Load user's progress for this module
    const savedProgress = profile?.videoModuleProgress?.[moduleData.id] || {
      watchedVideos: [],
      completed: false
    };
    setWatchedVideos(savedProgress.watchedVideos);
    setModuleProgress((savedProgress.watchedVideos.length / totalVideos) * 100);
  };

  const speakText = (text, onComplete = null) => {
    setIsPlaying(true);
    Speech.speak(text, {
      language: 'hi-IN',
      rate: 0.8,
      pitch: 1.0,
      onDone: () => {
        setIsPlaying(false);
        if (onComplete) onComplete();
      },
      onError: () => {
        setIsPlaying(false);
      }
    });
  };

  const startVideo = () => {
    // Simulate video playing by speaking the content
    const script = currentVideo.content.videoScript;
    speakText(script, () => {
      // After video ends, mark as watched
      markVideoAsWatched();
    });
  };

  const markVideoAsWatched = () => {
    if (!watchedVideos.includes(currentVideo.id)) {
      const newWatchedVideos = [...watchedVideos, currentVideo.id];
      setWatchedVideos(newWatchedVideos);
      
      const newProgress = (newWatchedVideos.length / totalVideos) * 100;
      setModuleProgress(newProgress);
      
      // Save progress
      saveProgress(newWatchedVideos, newProgress === 100);
      
      // Show quiz if video completed
      setTimeout(() => {
        setShowQuiz(true);
      }, 1000);
    }
  };

  const saveProgress = async (watchedList, isCompleted) => {
    try {
      const updatedProgress = {
        ...profile?.videoModuleProgress,
        [moduleData.id]: {
          watchedVideos: watchedList,
          completed: isCompleted,
          lastWatched: Date.now()
        }
      };
      
      await updateProfile({
        ...profile,
        videoModuleProgress: updatedProgress
      });
      
      if (isCompleted) {
        setShowCertificate(true);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const nextVideo = () => {
    if (currentVideoIndex < totalVideos - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setShowQuiz(false);
    }
  };

  const previousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setShowQuiz(false);
    }
  };

  const renderVideoPlayer = () => (
    <View style={styles.videoContainer}>
      <LinearGradient
        colors={moduleData.color}
        style={styles.videoPlayer}
      >
        <View style={styles.videoContent}>
          <Text style={styles.videoThumbnail}>{currentVideo.thumbnail}</Text>
          <Text style={styles.videoTitle}>{currentVideo.title}</Text>
          <Text style={styles.videoDuration}>{currentVideo.duration}</Text>
          
          <Pressable 
            style={styles.playButton}
            onPress={startVideo}
            disabled={isPlaying}
          >
            <Text style={styles.playIcon}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
            <Text style={styles.playText}>
              {isPlaying ? 'चल रहा है...' : 'वीडियो चलाएं'}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
      
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(currentVideoIndex / totalVideos) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        वीडियो {currentVideoIndex + 1} / {totalVideos}
      </Text>
    </View>
  );

  const renderKeyPoints = () => (
    <View style={styles.keyPointsSection}>
      <Text style={styles.sectionTitle}>मुख्य बातें:</Text>
      {currentVideo.content.keyPoints.map((point, index) => (
        <View key={index} style={styles.keyPointItem}>
          <Text style={styles.keyPointBullet}>•</Text>
          <Text style={styles.keyPointText}>{point}</Text>
        </View>
      ))}
    </View>
  );

  const renderPracticalTips = () => (
    <View style={styles.tipsSection}>
      <Text style={styles.sectionTitle}>व्यावहारिक सुझाव:</Text>
      {currentVideo.content.practicalTips.map((tip, index) => (
        <View key={index} style={styles.tipItem}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}
    </View>
  );

  const renderQuizModal = () => (
    <Modal
      visible={showQuiz}
      animationType="slide"
      onRequestClose={() => setShowQuiz(false)}
    >
      <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
        <View style={styles.quizContainer}>
          <Text style={styles.quizTitle}>क्या आपको समझ आया? 🤔</Text>
          <Text style={styles.quizSubtitle}>
            जो कुछ सीखा है, उसे याद करके बताएं
          </Text>
          
          <View style={styles.quizQuestion}>
            <Text style={styles.questionText}>
              इस वीडियो से आपने क्या सीखा?
            </Text>
            <View style={styles.answerOptions}>
              {['बहुत कुछ सीखा', 'कुछ समझ आया', 'फिर से देखना चाहूंगी'].map((option, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.answerOption,
                    quizAnswers.understanding === index && styles.selectedAnswer
                  ]}
                  onPress={() => setQuizAnswers(prev => ({ ...prev, understanding: index }))}
                >
                  <Text style={styles.answerText}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          <View style={styles.quizActions}>
            <Pressable 
              style={styles.skipButton}
              onPress={() => setShowQuiz(false)}
            >
              <Text style={styles.skipText}>छोड़ें</Text>
            </Pressable>
            <Pressable 
              style={styles.nextVideoButton}
              onPress={() => {
                setShowQuiz(false);
                if (currentVideoIndex < totalVideos - 1) {
                  nextVideo();
                } else {
                  setShowCertificate(true);
                }
              }}
            >
              <Text style={styles.nextVideoText}>
                {currentVideoIndex < totalVideos - 1 ? 'अगला वीडियो' : 'पूरा किया'}
              </Text>
            </Pressable>
          </View>
        </View>
      </GradientBackground>
    </Modal>
  );

  const renderCertificate = () => (
    <Modal
      visible={showCertificate}
      animationType="fade"
      onRequestClose={() => setShowCertificate(false)}
    >
      <GradientBackground colors={['#FFD700', '#FFA500']}>
        <View style={styles.certificateContainer}>
          <Animatable.View animation="bounceIn" style={styles.certificateCard}>
            <Text style={styles.certificateIcon}>🏆</Text>
            <Text style={styles.certificateTitle}>शाबाश!</Text>
            <Text style={styles.certificateName}>{profile?.name || 'आप'}</Text>
            <Text style={styles.certificateText}>ने सफलतापूर्वक पूरा किया</Text>
            <Text style={styles.certificateModule}>"{moduleData.title}"</Text>
            <Text style={styles.certificateMessage}>
              आपने बहुत अच्छा सीखा है। अब आप इस जानकारी को दूसरों क�� साथ भी साझा कर सकती हैं।
            </Text>
            
            <Pressable 
              style={styles.certificateButton}
              onPress={() => {
                setShowCertificate(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.certificateButtonText}>होम जाएं</Text>
            </Pressable>
          </Animatable.View>
        </View>
      </GradientBackground>
    </Modal>
  );

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.moduleTitle}>{moduleData.title}</Text>
          <Text style={styles.moduleSubtitle}>{moduleData.subtitle}</Text>
          <ProgressRing
            progress={moduleProgress}
            size={60}
            color={COLORS.primary[500]}
          >
            <Text style={styles.progressNumber}>
              {Math.round(moduleProgress)}%
            </Text>
          </ProgressRing>
        </View>

        {/* Video Player */}
        <Animatable.View animation="fadeInUp" delay={300}>
          {renderVideoPlayer()}
        </Animatable.View>

        {/* Key Points */}
        <Animatable.View animation="fadeInUp" delay={500}>
          {renderKeyPoints()}
        </Animatable.View>

        {/* Practical Tips */}
        <Animatable.View animation="fadeInUp" delay={700}>
          {renderPracticalTips()}
        </Animatable.View>

        {/* Navigation */}
        <View style={styles.navigationSection}>
          <Pressable 
            style={[styles.navButton, currentVideoIndex === 0 && styles.disabledButton]}
            onPress={previousVideo}
            disabled={currentVideoIndex === 0}
          >
            <Text style={styles.navButtonText}>← पिछला</Text>
          </Pressable>
          
          <Pressable 
            style={styles.homeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.homeButtonText}>होम</Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.navButton,
              (currentVideoIndex >= totalVideos - 1 || !watchedVideos.includes(currentVideo.id)) && styles.disabledButton
            ]}
            onPress={nextVideo}
            disabled={currentVideoIndex >= totalVideos - 1 || !watchedVideos.includes(currentVideo.id)}
          >
            <Text style={styles.navButtonText}>अगला →</Text>
          </Pressable>
        </View>
      </ScrollView>
      
      {renderQuizModal()}
      {renderCertificate()}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  moduleTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  moduleSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  progressNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
  },
  videoContainer: {
    marginBottom: SPACING.lg,
  },
  videoPlayer: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  videoContent: {
    alignItems: 'center',
  },
  videoThumbnail: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  videoTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  videoDuration: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.lg,
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  playText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.neutral.gray[300],
    borderRadius: 2,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary[500],
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  keyPointsSection: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  keyPointBullet: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.primary[500],
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  keyPointText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  tipsSection: {
    backgroundColor: COLORS.primary[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  navButton: {
    backgroundColor: COLORS.primary[100],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.neutral.gray[200],
    opacity: 0.5,
  },
  navButtonText: {
    color: COLORS.primary[700],
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  homeButton: {
    backgroundColor: COLORS.neutral.gray[200],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  homeButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Quiz Modal Styles
  quizContainer: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  quizTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  quizSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  quizQuestion: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  questionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  answerOptions: {
    gap: SPACING.sm,
  },
  answerOption: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedAnswer: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  answerText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  quizActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  skipButton: {
    flex: 1,
    backgroundColor: COLORS.neutral.gray[300],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  skipText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  nextVideoButton: {
    flex: 1,
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  nextVideoText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  // Certificate Modal Styles
  certificateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  certificateCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING['2xl'],
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  certificateIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  certificateTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[600],
    marginBottom: SPACING.md,
  },
  certificateName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  certificateText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  certificateModule: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  certificateMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  certificateButton: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
  },
  certificateButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

// Export the modules for use in other screens
export { VIDEO_LEARNING_MODULES };