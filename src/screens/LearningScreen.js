import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Dimensions,
  TextInput,
  Modal
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../providers/AuthProvider';
import { getFirestore, doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';
import GradientBackground from '../components/GradientBackground';
import AnimatedDidiAvatar from '../components/AnimatedDidiAvatar';
import ProgressRing from '../components/ProgressRing';

const { width } = Dimensions.get('window');

const LESSON_TYPES = {
  INTERACTIVE: 'interactive',
  PRACTICE: 'practice',
  EDUCATIONAL: 'educational',
  HANDS_ON: 'hands_on',
  ASSESSMENT: 'assessment'
};

export default function LearningScreen({ route, navigation }) {
  const { moduleData, lessonIndex = 0 } = route.params;
  const { profile } = useAuth();
  
  const [currentLessonIndex, setCurrentLessonIndex] = useState(lessonIndex);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [lessonStartTime, setLessonStartTime] = useState(Date.now());
  const [completedKeyPoints, setCompletedKeyPoints] = useState([]);

  const currentLesson = moduleData.lessons[currentLessonIndex];
  const totalLessons = moduleData.lessons.length;
  const progressPercentage = ((currentLessonIndex + (lessonProgress / 100)) / totalLessons) * 100;

  useEffect(() => {
    startLesson();
    setLessonStartTime(Date.now());
  }, [currentLessonIndex]);

  const startLesson = () => {
    setLessonProgress(0);
    setCompletedKeyPoints([]);
    
    // Welcome message for the lesson
    setTimeout(() => {
      const welcomeMessage = `आइए शुरू करते हैं "${currentLesson.title}"। ${currentLesson.content.introduction}`;
      speakText(welcomeMessage);
    }, 1000);
  };

  const speakText = (text, onComplete = null) => {
    setIsPlaying(true);
    Speech.speak(text, {
      language: 'hi-IN',
      rate: 0.8,
      onDone: () => {
        setIsPlaying(false);
        if (onComplete) onComplete();
      },
      onError: () => {
        setIsPlaying(false);
      }
    });
  };

  const handleKeyPointComplete = (pointIndex) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!completedKeyPoints.includes(pointIndex)) {
      const newCompleted = [...completedKeyPoints, pointIndex];
      setCompletedKeyPoints(newCompleted);
      
      // Update lesson progress
      const newProgress = (newCompleted.length / currentLesson.content.keyPoints.length) * 100;
      setLessonProgress(newProgress);
      
      // Speak the key point
      const keyPoint = currentLesson.content.keyPoints[pointIndex];
      speakText(`${pointIndex + 1}. ${keyPoint}`);
      
      // If all key points completed, move to practice
      if (newCompleted.length === currentLesson.content.keyPoints.length) {
        setTimeout(() => {
          speakText('बहुत अच्छा! अब हम अभ्यास करेंगे।', () => {
            setShowPracticeModal(true);
          });
        }, 2000);
      }
    }
  };

  const handlePracticeComplete = async () => {
    const practiceScore = calculatePracticeScore();
    
    // Save lesson completion
    await saveLessonProgress(practiceScore);
    
    if (practiceScore >= 70) {
      speakText('शाबाश! आपने यह पाठ पूरा कर लिया।', () => {
        if (currentLessonIndex < totalLessons - 1) {
          // Move to next lesson
          Alert.alert(
            'पाठ पूरा!',
            'क्या आप अगला पाठ शुरू करना चाहती हैं?',
            [
              { text: 'बाद में', onPress: () => navigation.goBack() },
              { text: 'अगला पाठ', onPress: () => setCurrentLessonIndex(currentLessonIndex + 1) }
            ]
          );
        } else {
          // Module completed
          completeModule();
        }
      });
    } else {
      speakText('कोई बात नहीं। एक बार फिर से कोशिश करते हैं।');
      setShowPracticeModal(false);
      setLessonProgress(50); // Reset to middle of lesson
    }
  };

  const calculatePracticeScore = () => {
    const totalQuestions = currentLesson.content.practiceExercises.length;
    const correctAnswers = Object.values(practiceAnswers).filter(answer => 
      answer && answer.trim().length > 0
    ).length;
    
    return (correctAnswers / totalQuestions) * 100;
  };

  const saveLessonProgress = async (score) => {
    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', profile.uid);
      
      const lessonData = {
        moduleId: moduleData.id,
        lessonId: currentLesson.id,
        lessonIndex: currentLessonIndex,
        score: score,
        timeSpent: Date.now() - lessonStartTime,
        completedAt: Date.now()
      };
      
      // Update user progress
      await updateDoc(userRef, {
        [`lessonProgress.${moduleData.id}.${currentLesson.id}`]: lessonData,
        lessonsCompleted: increment(1),
        totalTimeSpent: increment(Date.now() - lessonStartTime)
      });
      
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  };

  const completeModule = async () => {
    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', profile.uid);
      
      await updateDoc(userRef, {
        [`moduleProgress.${moduleData.id}`]: {
          completed: true,
          completedAt: Date.now(),
          totalScore: 100 // Calculate based on all lessons
        },
        modulesCompleted: [...(profile.modulesCompleted || []), moduleData.id]
      });
      
      Alert.alert(
        '🎉 मॉड्यूल पूरा!',
        `बधाई हो! आपने "${moduleData.title}" मॉड्यूल पूरा कर ��िया है।`,
        [
          { text: 'होम पर जाएं', onPress: () => navigation.navigate('Home') }
        ]
      );
      
    } catch (error) {
      console.error('Error completing module:', error);
    }
  };

  const renderKeyPoints = () => (
    <View style={styles.keyPointsContainer}>
      <Text style={styles.sectionTitle}>मुख्य बिंदु:</Text>
      {currentLesson.content.keyPoints.map((point, index) => (
        <Pressable
          key={index}
          style={[
            styles.keyPointCard,
            completedKeyPoints.includes(index) && styles.completedKeyPoint
          ]}
          onPress={() => handleKeyPointComplete(index)}
        >
          <View style={styles.keyPointHeader}>
            <Text style={styles.keyPointNumber}>{index + 1}</Text>
            <Text style={[
              styles.keyPointText,
              completedKeyPoints.includes(index) && styles.completedText
            ]}>
              {point}
            </Text>
            {completedKeyPoints.includes(index) && (
              <Text style={styles.checkMark}>✅</Text>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );

  const renderPracticeModal = () => (
    <Modal
      visible={showPracticeModal}
      animationType="slide"
      onRequestClose={() => setShowPracticeModal(false)}
    >
      <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
        <ScrollView style={styles.practiceContainer}>
          <View style={styles.practiceHeader}>
            <Text style={styles.practiceTitle}>अभ्यास करें</Text>
            <Text style={styles.practiceSubtitle}>Practice Exercises</Text>
          </View>
          
          {currentLesson.content.practiceExercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <Text style={styles.exerciseTitle}>
                अभ्यास {index + 1}: {exercise}
              </Text>
              <TextInput
                style={styles.exerciseInput}
                placeholder="यहाँ अपना जवाब लिखें..."
                placeholderTextColor={COLORS.text.secondary}
                value={practiceAnswers[index] || ''}
                onChangeText={(text) => 
                  setPracticeAnswers(prev => ({ ...prev, [index]: text }))
                }
                multiline
              />
            </View>
          ))}
          
          <View style={styles.practiceButtons}>
            <Pressable 
              style={styles.skipButton}
              onPress={() => setShowPracticeModal(false)}
            >
              <Text style={styles.skipButtonText}>बाद में</Text>
            </Pressable>
            <Pressable 
              style={styles.submitButton}
              onPress={handlePracticeComplete}
            >
              <Text style={styles.submitButtonText}>जमा करें</Text>
            </Pressable>
          </View>
        </ScrollView>
      </GradientBackground>
    </Modal>
  );

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with Progress */}
        <View style={styles.header}>
          <View style={styles.progressHeader}>
            <ProgressRing
              progress={progressPercentage}
              size={60}
              color={COLORS.primary[500]}
            >
              <Text style={styles.progressText}>
                {Math.round(progressPercentage)}%
              </Text>
            </ProgressRing>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
              <Text style={styles.lessonMeta}>
                पाठ {currentLessonIndex + 1} / {totalLessons} • {currentLesson.duration}
              </Text>
            </View>
          </View>
        </View>

        {/* Didi Avatar */}
        <Animatable.View animation="fadeIn" style={styles.avatarSection}>
          <AnimatedDidiAvatar
            isSpeaking={isPlaying}
            emotion="encouraging"
            size={100}
          />
          <Text style={styles.didiMessage}>
            {isPlaying ? 'दीदी बोल रही हैं...' : 'दीदी आपकी मदद के लिए यहाँ हैं'}
          </Text>
        </Animatable.View>

        {/* Lesson Introduction */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.introSection}>
          <Text style={styles.introText}>{currentLesson.content.introduction}</Text>
        </Animatable.View>

        {/* Key Points */}
        <Animatable.View animation="fadeInUp" delay={500}>
          {renderKeyPoints()}
        </Animatable.View>

        {/* Voice Controls */}
        <Animatable.View animation="fadeInUp" delay={700} style={styles.controlsSection}>
          <Pressable 
            style={styles.voiceButton}
            onPress={() => speakText(currentLesson.content.introduction)}
          >
            <Text style={styles.voiceButtonText}>🔊 फिर से सुनें</Text>
          </Pressable>
          
          <Pressable 
            style={styles.helpButton}
            onPress={() => speakText('कोई समस्या है तो मुझसे पूछें। मैं आपकी मदद करूंगी।')}
          >
            <Text style={styles.helpButtonText}>❓ मदद चाहिए</Text>
          </Pressable>
        </Animatable.View>

        {/* Navigation */}
        <View style={styles.navigationSection}>
          {currentLessonIndex > 0 && (
            <Pressable 
              style={styles.navButton}
              onPress={() => setCurrentLessonIndex(currentLessonIndex - 1)}
            >
              <Text style={styles.navButtonText}>← पिछला पाठ</Text>
            </Pressable>
          )}
          
          <Pressable 
            style={styles.homeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.homeButtonText}>होम पर जाएं</Text>
          </Pressable>
          
          {lessonProgress >= 100 && currentLessonIndex < totalLessons - 1 && (
            <Pressable 
              style={styles.navButton}
              onPress={() => setCurrentLessonIndex(currentLessonIndex + 1)}
            >
              <Text style={styles.navButtonText}>अगला पाठ →</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
      
      {renderPracticeModal()}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
  },
  lessonInfo: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  lessonTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  lessonMeta: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  didiMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  introSection: {
    backgroundColor: COLORS.primary[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  introText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  keyPointsContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  keyPointCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  completedKeyPoint: {
    borderColor: COLORS.status.success,
    backgroundColor: COLORS.status.success + '10',
  },
  keyPointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyPointNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
    marginRight: SPACING.md,
    minWidth: 30,
  },
  keyPointText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  completedText: {
    color: COLORS.status.success,
  },
  checkMark: {
    fontSize: 20,
    marginLeft: SPACING.sm,
  },
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  voiceButton: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    flex: 0.45,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  helpButton: {
    backgroundColor: COLORS.secondary[500],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    flex: 0.45,
  },
  helpButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
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
  },
  navButtonText: {
    color: COLORS.primary[700],
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  homeButton: {
    backgroundColor: COLORS.neutral.gray[200],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  homeButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Practice Modal Styles
  practiceContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  practiceHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.xl,
  },
  practiceTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  practiceSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
  },
  exerciseCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exerciseTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  exerciseInput: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  practiceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  skipButton: {
    backgroundColor: COLORS.neutral.gray[300],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    flex: 0.4,
  },
  skipButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    flex: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
});