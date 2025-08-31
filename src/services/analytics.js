import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';

// Analytics and impact measurement for hackathon demonstration
export const ANALYTICS_EVENTS = {
  // Learning events
  CALL_STARTED: 'call_started',
  CALL_COMPLETED: 'call_completed',
  PACK_COMPLETED: 'pack_completed',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  
  // Engagement events
  APP_OPENED: 'app_opened',
  SCREEN_VIEWED: 'screen_viewed',
  FEATURE_USED: 'feature_used',
  
  // Social events
  STORY_SHARED: 'story_shared',
  GROUP_JOINED: 'group_joined',
  MENTOR_CONTACTED: 'mentor_contacted',
  
  // Impact events
  KNOWLEDGE_APPLIED: 'knowledge_applied',
  BEHAVIOR_CHANGED: 'behavior_changed',
  HELP_SOUGHT: 'help_sought',
};

// Impact categories for measuring social change
export const IMPACT_CATEGORIES = {
  HEALTH_AWARENESS: 'health_awareness',
  DIGITAL_LITERACY: 'digital_literacy',
  RIGHTS_AWARENESS: 'rights_awareness',
  ECONOMIC_EMPOWERMENT: 'economic_empowerment',
  SOCIAL_CONFIDENCE: 'social_confidence',
};

// Learning outcome metrics
export const LEARNING_METRICS = {
  COMPREHENSION: 'comprehension',
  RETENTION: 'retention',
  APPLICATION: 'application',
  CONFIDENCE: 'confidence',
  SATISFACTION: 'satisfaction',
};

// Track analytics event
export async function trackEvent(eventType, eventData = {}) {
  try {
    const event = {
      type: eventType,
      data: eventData,
      timestamp: Date.now(),
      userId: eventData.userId || 'anonymous',
      sessionId: eventData.sessionId || generateSessionId(),
    };

    // Store locally for offline support
    await storeEventLocally(event);
    
    // Send to analytics service (mock implementation)
    await sendToAnalyticsService(event);
    
    return { success: true };
  } catch (error) {
    console.error('Error tracking event:', error);
    return { success: false, error: error.message };
  }
}

// Store event locally for offline analytics
async function storeEventLocally(event) {
  try {
    const existingEvents = await AsyncStorage.getItem('analytics_events');
    const events = existingEvents ? JSON.parse(existingEvents) : [];
    
    events.push(event);
    
    // Keep only last 1000 events locally
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    await AsyncStorage.setItem('analytics_events', JSON.stringify(events));
  } catch (error) {
    console.error('Error storing event locally:', error);
  }
}

// Send to analytics service (mock implementation)
async function sendToAnalyticsService(event) {
  // In real implementation, send to Firebase Analytics, Mixpanel, etc.
  console.log('Analytics Event:', event);
  return Promise.resolve();
}

// Generate session ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Track learning progress
export async function trackLearningProgress(userId, packId, progressData) {
  const event = {
    userId,
    packId,
    progress: progressData.progress,
    timeSpent: progressData.timeSpent,
    questionsAnswered: progressData.questionsAnswered,
    correctAnswers: progressData.correctAnswers,
    completionRate: progressData.completionRate,
    satisfactionRating: progressData.satisfactionRating,
  };

  return await trackEvent(ANALYTICS_EVENTS.PACK_COMPLETED, event);
}

// Track social impact
export async function trackSocialImpact(userId, impactType, impactData) {
  const event = {
    userId,
    impactType,
    category: impactData.category,
    description: impactData.description,
    confidence: impactData.confidence, // 1-5 scale
    applicationIntent: impactData.applicationIntent, // Will user apply this knowledge?
    shareIntent: impactData.shareIntent, // Will user share with others?
  };

  return await trackEvent(ANALYTICS_EVENTS.KNOWLEDGE_APPLIED, event);
}

// Generate user analytics dashboard
export async function generateUserAnalytics(userId) {
  try {
    const events = await getLocalEvents(userId);
    
    const analytics = {
      overview: generateOverviewMetrics(events),
      learning: generateLearningMetrics(events),
      engagement: generateEngagementMetrics(events),
      impact: generateImpactMetrics(events),
      recommendations: generateRecommendations(events),
    };

    return { success: true, analytics };
  } catch (error) {
    console.error('Error generating user analytics:', error);
    return { success: false, error: error.message };
  }
}

// Get local events for a user
async function getLocalEvents(userId) {
  try {
    const allEvents = await AsyncStorage.getItem('analytics_events');
    const events = allEvents ? JSON.parse(allEvents) : [];
    
    return events.filter(event => event.userId === userId);
  } catch (error) {
    console.error('Error getting local events:', error);
    return [];
  }
}

// Generate overview metrics
function generateOverviewMetrics(events) {
  const totalSessions = new Set(events.map(e => e.sessionId)).size;
  const totalTimeSpent = events
    .filter(e => e.data.timeSpent)
    .reduce((sum, e) => sum + e.data.timeSpent, 0);
  
  const callEvents = events.filter(e => e.type === ANALYTICS_EVENTS.CALL_COMPLETED);
  const avgCallDuration = callEvents.length > 0 
    ? callEvents.reduce((sum, e) => sum + (e.data.duration || 0), 0) / callEvents.length 
    : 0;

  return {
    totalSessions,
    totalTimeSpent: Math.round(totalTimeSpent / 60), // in minutes
    totalCalls: callEvents.length,
    avgCallDuration: Math.round(avgCallDuration / 60), // in minutes
    streakDays: calculateStreakDays(events),
    lastActive: getLastActiveDate(events),
  };
}

// Generate learning metrics
function generateLearningMetrics(events) {
  const packCompletions = events.filter(e => e.type === ANALYTICS_EVENTS.PACK_COMPLETED);
  const achievements = events.filter(e => e.type === ANALYTICS_EVENTS.ACHIEVEMENT_UNLOCKED);
  
  const packProgress = {};
  packCompletions.forEach(event => {
    const packId = event.data.packId;
    if (!packProgress[packId]) {
      packProgress[packId] = {
        completions: 0,
        totalTime: 0,
        avgSatisfaction: 0,
        lastCompleted: 0,
      };
    }
    
    packProgress[packId].completions++;
    packProgress[packId].totalTime += event.data.timeSpent || 0;
    packProgress[packId].avgSatisfaction += event.data.satisfactionRating || 0;
    packProgress[packId].lastCompleted = Math.max(
      packProgress[packId].lastCompleted, 
      event.timestamp
    );
  });

  // Calculate average satisfaction for each pack
  Object.keys(packProgress).forEach(packId => {
    if (packProgress[packId].completions > 0) {
      packProgress[packId].avgSatisfaction /= packProgress[packId].completions;
    }
  });

  return {
    packsCompleted: Object.keys(packProgress).length,
    totalAchievements: achievements.length,
    packProgress,
    learningStreak: calculateLearningStreak(events),
    preferredLearningTime: getPreferredLearningTime(events),
  };
}

// Generate engagement metrics
function generateEngagementMetrics(events) {
  const screenViews = events.filter(e => e.type === ANALYTICS_EVENTS.SCREEN_VIEWED);
  const featureUsage = events.filter(e => e.type === ANALYTICS_EVENTS.FEATURE_USED);
  
  const screenFrequency = {};
  screenViews.forEach(event => {
    const screen = event.data.screen;
    screenFrequency[screen] = (screenFrequency[screen] || 0) + 1;
  });

  const featureFrequency = {};
  featureUsage.forEach(event => {
    const feature = event.data.feature;
    featureFrequency[feature] = (featureFrequency[feature] || 0) + 1;
  });

  return {
    mostVisitedScreens: Object.entries(screenFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5),
    mostUsedFeatures: Object.entries(featureFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5),
    engagementScore: calculateEngagementScore(events),
    sessionDuration: calculateAvgSessionDuration(events),
  };
}

// Generate impact metrics
function generateImpactMetrics(events) {
  const impactEvents = events.filter(e => e.type === ANALYTICS_EVENTS.KNOWLEDGE_APPLIED);
  const socialEvents = events.filter(e => 
    [ANALYTICS_EVENTS.STORY_SHARED, ANALYTICS_EVENTS.GROUP_JOINED, ANALYTICS_EVENTS.MENTOR_CONTACTED]
    .includes(e.type)
  );

  const impactByCategory = {};
  impactEvents.forEach(event => {
    const category = event.data.category;
    if (!impactByCategory[category]) {
      impactByCategory[category] = {
        count: 0,
        avgConfidence: 0,
        applicationRate: 0,
        shareRate: 0,
      };
    }
    
    impactByCategory[category].count++;
    impactByCategory[category].avgConfidence += event.data.confidence || 0;
    impactByCategory[category].applicationRate += event.data.applicationIntent ? 1 : 0;
    impactByCategory[category].shareRate += event.data.shareIntent ? 1 : 0;
  });

  // Calculate averages
  Object.keys(impactByCategory).forEach(category => {
    const data = impactByCategory[category];
    if (data.count > 0) {
      data.avgConfidence /= data.count;
      data.applicationRate = (data.applicationRate / data.count) * 100;
      data.shareRate = (data.shareRate / data.count) * 100;
    }
  });

  return {
    totalImpactEvents: impactEvents.length,
    socialEngagement: socialEvents.length,
    impactByCategory,
    overallConfidence: calculateOverallConfidence(impactEvents),
    knowledgeSharing: calculateKnowledgeSharing(events),
  };
}

// Generate personalized recommendations
function generateRecommendations(events) {
  const recommendations = [];
  
  // Learning recommendations
  const recentCalls = events
    .filter(e => e.type === ANALYTICS_EVENTS.CALL_COMPLETED)
    .filter(e => Date.now() - e.timestamp < 7 * 24 * 60 * 60 * 1000); // Last 7 days
  
  if (recentCalls.length === 0) {
    recommendations.push({
      type: 'learning',
      priority: 'high',
      message: 'दीदी से बात किए हुए कुछ दिन हो गए हैं। आज कुछ नया सीखते हैं!',
      action: 'start_call',
    });
  }

  // Engagement recommendations
  const packCompletions = events.filter(e => e.type === ANALYTICS_EVENTS.PACK_COMPLETED);
  const completedPacks = new Set(packCompletions.map(e => e.data.packId));
  
  if (completedPacks.size >= 2 && !events.some(e => e.type === ANALYTICS_EVENTS.STORY_SHARED)) {
    recommendations.push({
      type: 'social',
      priority: 'medium',
      message: 'आपने बहुत कुछ सीखा है! अपनी सफलता की कहानी दूसरों के साथ साझा करें।',
      action: 'share_story',
    });
  }

  // Achievement recommendations
  const achievements = events.filter(e => e.type === ANALYTICS_EVENTS.ACHIEVEMENT_UNLOCKED);
  if (achievements.length < 3) {
    recommendations.push({
      type: 'achievement',
      priority: 'low',
      message: 'नए बैज अनलॉक करने के लिए रोज़ाना सीखते रहें।',
      action: 'view_achievements',
    });
  }

  return recommendations;
}

// Helper functions for calculations
function calculateStreakDays(events) {
  const callDates = events
    .filter(e => e.type === ANALYTICS_EVENTS.CALL_COMPLETED)
    .map(e => new Date(e.timestamp).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort();

  let streak = 0;
  let currentDate = new Date();
  
  for (let i = callDates.length - 1; i >= 0; i--) {
    const callDate = new Date(callDates[i]);
    const daysDiff = Math.floor((currentDate - callDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      currentDate = callDate;
    } else {
      break;
    }
  }
  
  return streak;
}

function getLastActiveDate(events) {
  if (events.length === 0) return null;
  return Math.max(...events.map(e => e.timestamp));
}

function calculateLearningStreak(events) {
  // Similar to calculateStreakDays but for learning events
  return calculateStreakDays(events);
}

function getPreferredLearningTime(events) {
  const callEvents = events.filter(e => e.type === ANALYTICS_EVENTS.CALL_STARTED);
  const hourCounts = {};
  
  callEvents.forEach(event => {
    const hour = new Date(event.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const preferredHour = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (!preferredHour) return null;
  
  const hour = parseInt(preferredHour[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function calculateEngagementScore(events) {
  // Simple engagement score based on variety of actions
  const uniqueEventTypes = new Set(events.map(e => e.type)).size;
  const recentEvents = events.filter(e => Date.now() - e.timestamp < 7 * 24 * 60 * 60 * 1000);
  
  return Math.min(100, (uniqueEventTypes * 10) + (recentEvents.length * 2));
}

function calculateAvgSessionDuration(events) {
  const sessions = {};
  
  events.forEach(event => {
    const sessionId = event.sessionId;
    if (!sessions[sessionId]) {
      sessions[sessionId] = { start: event.timestamp, end: event.timestamp };
    } else {
      sessions[sessionId].end = Math.max(sessions[sessionId].end, event.timestamp);
    }
  });
  
  const durations = Object.values(sessions).map(s => s.end - s.start);
  return durations.length > 0 
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length / 1000 / 60 // in minutes
    : 0;
}

function calculateOverallConfidence(impactEvents) {
  if (impactEvents.length === 0) return 0;
  
  const totalConfidence = impactEvents.reduce((sum, e) => sum + (e.data.confidence || 0), 0);
  return totalConfidence / impactEvents.length;
}

function calculateKnowledgeSharing(events) {
  const shareEvents = events.filter(e => 
    [ANALYTICS_EVENTS.STORY_SHARED, ANALYTICS_EVENTS.GROUP_JOINED].includes(e.type)
  );
  
  return shareEvents.length;
}

// Export analytics data for hackathon presentation
export async function exportAnalyticsForPresentation(userId) {
  try {
    const analytics = await generateUserAnalytics(userId);
    
    if (!analytics.success) {
      throw new Error(analytics.error);
    }

    const presentationData = {
      userProfile: {
        totalLearningTime: analytics.analytics.overview.totalTimeSpent,
        completedSessions: analytics.analytics.overview.totalCalls,
        streakDays: analytics.analytics.overview.streakDays,
        achievementsUnlocked: analytics.analytics.learning.totalAchievements,
      },
      impactMetrics: {
        knowledgeApplied: analytics.analytics.impact.totalImpactEvents,
        confidenceLevel: Math.round(analytics.analytics.impact.overallConfidence * 100) / 100,
        socialEngagement: analytics.analytics.impact.socialEngagement,
        knowledgeSharing: analytics.analytics.impact.knowledgeSharing,
      },
      learningProgress: analytics.analytics.learning.packProgress,
      recommendations: analytics.analytics.recommendations,
    };

    return {
      success: true,
      data: presentationData,
      summary: generateImpactSummary(presentationData),
    };
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return { success: false, error: error.message };
  }
}

// Generate impact summary for hackathon judges
function generateImpactSummary(data) {
  const summary = {
    learningImpact: `${data.userProfile.totalLearningTime} मिनट सीखा, ${data.userProfile.completedSessions} सत्र पूरे किए`,
    behaviorChange: `${data.impactMetrics.knowledgeApplied} बार ज्ञान का उपयोग किया`,
    socialImpact: `${data.impactMetrics.socialEngagement} सामाजिक गतिविधियों में भाग लिया`,
    confidenceGrowth: `आत्मविश्वास स्तर: ${data.impactMetrics.confidenceLevel}/5`,
    overallScore: calculateOverallImpactScore(data),
  };

  return summary;
}

function calculateOverallImpactScore(data) {
  // Simple scoring algorithm for demonstration
  const learningScore = Math.min(50, data.userProfile.totalLearningTime);
  const engagementScore = Math.min(30, data.impactMetrics.socialEngagement * 5);
  const applicationScore = Math.min(20, data.impactMetrics.knowledgeApplied * 2);
  
  return Math.round(learningScore + engagementScore + applicationScore);
}
