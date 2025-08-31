// AI-Powered Personalization System for Adaptive Learning
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EDUCATIONAL_MODULES, LEARNING_CATEGORIES } from './educationalContent';

// Learning Analytics and AI Recommendations
export const LEARNING_PATTERNS = {
  VISUAL_LEARNER: 'visual',
  AUDIO_LEARNER: 'audio',
  KINESTHETIC_LEARNER: 'kinesthetic',
  MIXED_LEARNER: 'mixed'
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

export const LEARNING_PACE = {
  SLOW: 'slow',
  NORMAL: 'normal',
  FAST: 'fast'
};

// AI-powered learning analytics
export class LearningAnalytics {
  constructor(userId) {
    this.userId = userId;
    this.learningData = null;
  }

  async initializeUserData() {
    try {
      const data = await AsyncStorage.getItem(`learning_analytics_${this.userId}`);
      this.learningData = data ? JSON.parse(data) : this.getDefaultLearningData();
      return this.learningData;
    } catch (error) {
      console.error('Error initializing learning data:', error);
      return this.getDefaultLearningData();
    }
  }

  getDefaultLearningData() {
    return {
      learningPattern: LEARNING_PATTERNS.MIXED_LEARNER,
      difficultyLevel: DIFFICULTY_LEVELS.BEGINNER,
      learningPace: LEARNING_PACE.NORMAL,
      strengths: [],
      weaknesses: [],
      preferredCategories: [],
      sessionHistory: [],
      performanceMetrics: {
        averageScore: 0,
        completionRate: 0,
        retentionRate: 0,
        engagementScore: 0
      },
      adaptiveSettings: {
        repeatDifficultConcepts: true,
        skipMasteredContent: false,
        preferredSessionLength: 15, // minutes
        reminderFrequency: 'daily'
      }
    };
  }

  // Analyze user's learning pattern based on interaction data
  analyzeLearningPattern(sessionData) {
    const { timeSpent, interactions, completionRate, preferredContentType } = sessionData;
    
    let visualScore = 0;
    let audioScore = 0;
    let kinestheticScore = 0;

    // Analyze content type preferences
    if (preferredContentType.includes('visual')) visualScore += 3;
    if (preferredContentType.includes('audio')) audioScore += 3;
    if (preferredContentType.includes('interactive')) kinestheticScore += 3;

    // Analyze interaction patterns
    if (interactions.textClicks > interactions.audioPlays) visualScore += 2;
    if (interactions.audioPlays > interactions.textClicks) audioScore += 2;
    if (interactions.practiceExercises > 0) kinestheticScore += 2;

    // Analyze completion patterns
    if (completionRate > 0.8 && timeSpent < 600000) visualScore += 1; // Fast visual processing
    if (completionRate > 0.8 && timeSpent > 900000) audioScore += 1; // Thorough audio learning

    // Determine dominant learning pattern
    const maxScore = Math.max(visualScore, audioScore, kinestheticScore);
    if (maxScore === visualScore) return LEARNING_PATTERNS.VISUAL_LEARNER;
    if (maxScore === audioScore) return LEARNING_PATTERNS.AUDIO_LEARNER;
    if (maxScore === kinestheticScore) return LEARNING_PATTERNS.KINESTHETIC_LEARNER;
    
    return LEARNING_PATTERNS.MIXED_LEARNER;
  }

  // Adaptive difficulty adjustment
  adjustDifficulty(performanceData) {
    const { averageScore, recentScores, timeToComplete } = performanceData;
    
    if (averageScore > 85 && recentScores.every(score => score > 80)) {
      // User is performing well, increase difficulty
      if (this.learningData.difficultyLevel === DIFFICULTY_LEVELS.BEGINNER) {
        return DIFFICULTY_LEVELS.INTERMEDIATE;
      } else if (this.learningData.difficultyLevel === DIFFICULTY_LEVELS.INTERMEDIATE) {
        return DIFFICULTY_LEVELS.ADVANCED;
      }
    } else if (averageScore < 60 || recentScores.filter(score => score < 60).length > 2) {
      // User is struggling, decrease difficulty
      if (this.learningData.difficultyLevel === DIFFICULTY_LEVELS.ADVANCED) {
        return DIFFICULTY_LEVELS.INTERMEDIATE;
      } else if (this.learningData.difficultyLevel === DIFFICULTY_LEVELS.INTERMEDIATE) {
        return DIFFICULTY_LEVELS.BEGINNER;
      }
    }
    
    return this.learningData.difficultyLevel;
  }

  // Generate personalized learning recommendations
  generateRecommendations() {
    const recommendations = {
      nextModules: [],
      reviewTopics: [],
      practiceAreas: [],
      learningTips: []
    };

    // Recommend next modules based on completed ones and performance
    const completedModules = this.learningData.sessionHistory
      .filter(session => session.completed)
      .map(session => session.moduleId);

    const availableModules = EDUCATIONAL_MODULES.filter(module => 
      !completedModules.includes(module.id) &&
      module.prerequisites.every(prereq => completedModules.includes(prereq)) &&
      module.difficulty === this.learningData.difficultyLevel
    );

    // Prioritize based on user's preferred categories
    recommendations.nextModules = availableModules
      .sort((a, b) => {
        const aScore = this.learningData.preferredCategories.includes(a.category) ? 1 : 0;
        const bScore = this.learningData.preferredCategories.includes(b.category) ? 1 : 0;
        return bScore - aScore;
      })
      .slice(0, 3);

    // Identify topics that need review based on low scores
    const weakTopics = this.learningData.sessionHistory
      .filter(session => session.score < 70)
      .map(session => session.moduleId);

    recommendations.reviewTopics = [...new Set(weakTopics)].slice(0, 3);

    // Suggest practice areas based on learning pattern
    if (this.learningData.learningPattern === LEARNING_PATTERNS.KINESTHETIC_LEARNER) {
      recommendations.practiceAreas = ['hands_on_exercises', 'real_world_application'];
    } else if (this.learningData.learningPattern === LEARNING_PATTERNS.AUDIO_LEARNER) {
      recommendations.practiceAreas = ['voice_practice', 'listening_exercises'];
    } else {
      recommendations.practiceAreas = ['visual_exercises', 'reading_practice'];
    }

    // Generate personalized learning tips
    recommendations.learningTips = this.generateLearningTips();

    return recommendations;
  }

  generateLearningTips() {
    const tips = [];
    
    if (this.learningData.learningPattern === LEARNING_PATTERNS.VISUAL_LEARNER) {
      tips.push('📊 चार्ट और डायग्राम का उपयोग करके सीखें');
      tips.push('🎨 रंगीन नोट्स बनाएं');
    } else if (this.learningData.learningPattern === LEARNING_PATTERNS.AUDIO_LEARNER) {
      tips.push('🎧 ऑडियो लेसन को दोहराएं');
      tips.push('🗣️ जोर से पढ़कर सीखें');
    } else if (this.learningData.learningPattern === LEARNING_PATTERNS.KINESTHETIC_LEARNER) {
      tips.push('✋ व्यावहारिक अभ्यास करें');
      tips.push('🚶‍♀️ चलते-फिरते सीखें');
    }

    // General tips based on performance
    if (this.learningData.performanceMetrics.completionRate < 0.7) {
      tips.push('⏰ छोटे सेशन में सीखें');
      tips.push('🎯 एक समय में एक विषय पर फोकस करें');
    }

    if (this.learningData.performanceMetrics.retentionRate < 0.6) {
      tips.push('🔄 नियमित रिवीजन करें');
      tips.push('📝 महत्वपूर्ण बातों को लिखें');
    }

    return tips.slice(0, 3);
  }

  // Save learning analytics data
  async saveLearningData() {
    try {
      await AsyncStorage.setItem(
        `learning_analytics_${this.userId}`,
        JSON.stringify(this.learningData)
      );
    } catch (error) {
      console.error('Error saving learning data:', error);
    }
  }

  // Update learning data after each session
  async updateSessionData(sessionData) {
    if (!this.learningData) {
      await this.initializeUserData();
    }

    // Add session to history
    this.learningData.sessionHistory.push({
      ...sessionData,
      timestamp: Date.now()
    });

    // Update learning pattern
    this.learningData.learningPattern = this.analyzeLearningPattern(sessionData);

    // Update difficulty level
    const recentScores = this.learningData.sessionHistory
      .slice(-5)
      .map(session => session.score);
    
    this.learningData.difficultyLevel = this.adjustDifficulty({
      averageScore: recentScores.reduce((a, b) => a + b, 0) / recentScores.length,
      recentScores,
      timeToComplete: sessionData.timeSpent
    });

    // Update performance metrics
    this.updatePerformanceMetrics();

    // Save updated data
    await this.saveLearningData();
  }

  updatePerformanceMetrics() {
    const sessions = this.learningData.sessionHistory;
    if (sessions.length === 0) return;

    const completedSessions = sessions.filter(s => s.completed);
    const scores = sessions.map(s => s.score).filter(s => s > 0);

    this.learningData.performanceMetrics = {
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      completionRate: completedSessions.length / sessions.length,
      retentionRate: this.calculateRetentionRate(),
      engagementScore: this.calculateEngagementScore()
    };
  }

  calculateRetentionRate() {
    // Calculate retention based on review session performance
    const reviewSessions = this.learningData.sessionHistory.filter(s => s.isReview);
    if (reviewSessions.length === 0) return 0.8; // Default assumption

    const goodRetention = reviewSessions.filter(s => s.score > 70).length;
    return goodRetention / reviewSessions.length;
  }

  calculateEngagementScore() {
    const sessions = this.learningData.sessionHistory;
    if (sessions.length === 0) return 0;

    let engagementScore = 0;
    
    // Factor in completion rate
    engagementScore += this.learningData.performanceMetrics.completionRate * 30;
    
    // Factor in consistency (regular learning)
    const recentSessions = sessions.filter(s => 
      Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );
    engagementScore += Math.min(recentSessions.length * 10, 30);
    
    // Factor in interaction quality
    const avgInteractions = sessions.reduce((sum, s) => 
      sum + (s.interactions?.total || 0), 0
    ) / sessions.length;
    engagementScore += Math.min(avgInteractions * 2, 20);
    
    // Factor in time spent (not too little, not too much)
    const avgTimeSpent = sessions.reduce((sum, s) => sum + s.timeSpent, 0) / sessions.length;
    const idealTime = 15 * 60 * 1000; // 15 minutes
    const timeScore = Math.max(0, 20 - Math.abs(avgTimeSpent - idealTime) / 60000);
    engagementScore += timeScore;

    return Math.min(engagementScore, 100);
  }
}

// Adaptive content delivery based on user preferences
export function adaptContentForUser(content, userLearningData) {
  const adaptedContent = { ...content };
  
  // Adjust content based on learning pattern
  if (userLearningData.learningPattern === LEARNING_PATTERNS.VISUAL_LEARNER) {
    adaptedContent.preferredFormat = 'visual';
    adaptedContent.includeImages = true;
    adaptedContent.includeCharts = true;
  } else if (userLearningData.learningPattern === LEARNING_PATTERNS.AUDIO_LEARNER) {
    adaptedContent.preferredFormat = 'audio';
    adaptedContent.includeVoiceNarration = true;
    adaptedContent.includeAudioExamples = true;
  } else if (userLearningData.learningPattern === LEARNING_PATTERNS.KINESTHETIC_LEARNER) {
    adaptedContent.preferredFormat = 'interactive';
    adaptedContent.includeHandsOnExercises = true;
    adaptedContent.includeRealWorldExamples = true;
  }

  // Adjust difficulty
  if (userLearningData.difficultyLevel === DIFFICULTY_LEVELS.BEGINNER) {
    adaptedContent.vocabulary = 'simple';
    adaptedContent.explanationDepth = 'basic';
    adaptedContent.exampleComplexity = 'simple';
  } else if (userLearningData.difficultyLevel === DIFFICULTY_LEVELS.ADVANCED) {
    adaptedContent.vocabulary = 'advanced';
    adaptedContent.explanationDepth = 'detailed';
    adaptedContent.exampleComplexity = 'complex';
  }

  // Adjust pace
  if (userLearningData.learningPace === LEARNING_PACE.SLOW) {
    adaptedContent.contentChunks = 'small';
    adaptedContent.repetitionLevel = 'high';
  } else if (userLearningData.learningPace === LEARNING_PACE.FAST) {
    adaptedContent.contentChunks = 'large';
    adaptedContent.repetitionLevel = 'low';
  }

  return adaptedContent;
}

// Smart reminder system
export function generateSmartReminders(userLearningData) {
  const reminders = [];
  const now = new Date();
  const lastSession = userLearningData.sessionHistory[userLearningData.sessionHistory.length - 1];
  
  if (!lastSession) return reminders;
  
  const daysSinceLastSession = (now - new Date(lastSession.timestamp)) / (1000 * 60 * 60 * 24);
  
  if (daysSinceLastSession > 1) {
    reminders.push({
      type: 'comeback',
      message: 'दीदी आपका इंतजार कर रही है! आज कुछ नया सीखते हैं? 📚',
      priority: 'medium'
    });
  }
  
  if (daysSinceLastSession > 3) {
    reminders.push({
      type: 'streak_break',
      message: 'आपकी सीखने की लय टूट रही ���ै। वापस आकर अपनी प्रगति जारी रखें! 🔥',
      priority: 'high'
    });
  }
  
  // Review reminders based on retention
  if (userLearningData.performanceMetrics.retentionRate < 0.7) {
    reminders.push({
      type: 'review',
      message: 'पुराने पाठों को दोहराने का समय है। रिवीजन से याददाश्त बेहतर होती है! 🧠',
      priority: 'medium'
    });
  }
  
  return reminders;
}