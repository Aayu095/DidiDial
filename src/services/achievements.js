// Achievement system for gamifying the learning experience
export const ACHIEVEMENT_TYPES = {
  STREAK: 'streak',
  COMPLETION: 'completion',
  INTERACTION: 'interaction',
  MILESTONE: 'milestone',
  SOCIAL: 'social',
  SPECIAL: 'special',
};

export const ACHIEVEMENTS = [
  // Streak achievements
  {
    id: 'first_call',
    title: 'पहली बात',
    description: 'दीदी से पहली बार बात की',
    icon: '🎉',
    type: ACHIEVEMENT_TYPES.MILESTONE,
    rarity: 'common',
    condition: (stats) => stats.totalCalls >= 1,
  },
  {
    id: 'streak_3',
    title: '3 दिन',
    description: '3 दिन लगातार सीखा',
    icon: '🔥',
    type: ACHIEVEMENT_TYPES.STREAK,
    rarity: 'common',
    condition: (stats) => stats.currentStreak >= 3,
  },
  {
    id: 'streak_7',
    title: 'सप्ताह चैंपियन',
    description: '7 दिन लगातार सीखा',
    icon: '⭐',
    type: ACHIEVEMENT_TYPES.STREAK,
    rarity: 'rare',
    condition: (stats) => stats.currentStreak >= 7,
  },
  {
    id: 'streak_30',
    title: 'महीना मास्टर',
    description: '30 दिन लगातार सीखा',
    icon: '👑',
    type: ACHIEVEMENT_TYPES.STREAK,
    rarity: 'legendary',
    condition: (stats) => stats.currentStreak >= 30,
  },

  // Completion achievements
  {
    id: 'health_complete',
    title: 'स्वास्थ्य गुरु',
    description: 'स्वास्थ्य पैक पूरा किया',
    icon: '🏥',
    type: ACHIEVEMENT_TYPES.COMPLETION,
    rarity: 'rare',
    condition: (stats) => stats.packProgress?.health_hygiene >= 100,
  },
  {
    id: 'digital_complete',
    title: 'डिजिटल सखी',
    description: 'डिजिटल साथी पैक पूरा किया',
    icon: '📱',
    type: ACHIEVEMENT_TYPES.COMPLETION,
    rarity: 'rare',
    condition: (stats) => stats.packProgress?.digital_saathi >= 100,
  },
  {
    id: 'rights_complete',
    title: 'अधिकार योद्धा',
    description: 'अधिकार और सुरक्षा पैक पूरा किया',
    icon: '⚖️',
    type: ACHIEVEMENT_TYPES.COMPLETION,
    rarity: 'rare',
    condition: (stats) => stats.packProgress?.rights_safety >= 100,
  },
  {
    id: 'self_dev_complete',
    title: 'आत्म विकास स्टार',
    description: 'आत्म विकास पैक पूरा किया',
    icon: '🌟',
    type: ACHIEVEMENT_TYPES.COMPLETION,
    rarity: 'rare',
    condition: (stats) => stats.packProgress?.self_dev >= 100,
  },

  // Interaction achievements
  {
    id: 'chatty',
    title: 'बातूनी',
    description: '50 बार दीदी से बात की',
    icon: '💬',
    type: ACHIEVEMENT_TYPES.INTERACTION,
    rarity: 'common',
    condition: (stats) => stats.totalCalls >= 50,
  },
  {
    id: 'super_learner',
    title: 'सुपर लर्नर',
    description: '100 बार दीदी से बात की',
    icon: '🚀',
    type: ACHIEVEMENT_TYPES.INTERACTION,
    rarity: 'epic',
    condition: (stats) => stats.totalCalls >= 100,
  },

  // Milestone achievements
  {
    id: 'all_packs_complete',
    title: 'सर्वज्ञ',
    description: 'सभी पैक पूरे किए',
    icon: '🎓',
    type: ACHIEVEMENT_TYPES.MILESTONE,
    rarity: 'legendary',
    condition: (stats) => {
      const packs = ['health_hygiene', 'digital_saathi', 'rights_safety', 'self_dev'];
      return packs.every(pack => stats.packProgress?.[pack] >= 100);
    },
  },
  {
    id: 'early_bird',
    title: 'सुबह की रानी',
    description: 'सुबह 8 बजे से पहले 10 बार सीखा',
    icon: '🌅',
    type: ACHIEVEMENT_TYPES.SPECIAL,
    rarity: 'rare',
    condition: (stats) => stats.earlyMorningSessions >= 10,
  },
  {
    id: 'night_owl',
    title: 'रात की चैंपियन',
    description: 'रात 10 बजे के बाद 10 बार सीखा',
    icon: '🌙',
    type: ACHIEVEMENT_TYPES.SPECIAL,
    rarity: 'rare',
    condition: (stats) => stats.lateNightSessions >= 10,
  },

  // Social achievements (for future community features)
  {
    id: 'helper',
    title: 'सहायक',
    description: '5 सहेलियों की मदद की',
    icon: '🤝',
    type: ACHIEVEMENT_TYPES.SOCIAL,
    rarity: 'epic',
    condition: (stats) => stats.helpedFriends >= 5,
  },
  {
    id: 'mentor',
    title: 'गुरु माता',
    description: '10 नई सहेलियों को जोड़ा',
    icon: '👩‍🏫',
    type: ACHIEVEMENT_TYPES.SOCIAL,
    rarity: 'legendary',
    condition: (stats) => stats.referrals >= 10,
  },

  // Festival achievements
  {
    id: 'diwali_learner',
    title: 'दिवाली दीदी',
    description: 'दिवाली के दिन सीखा',
    icon: '🪔',
    type: ACHIEVEMENT_TYPES.SPECIAL,
    rarity: 'rare',
    condition: (stats) => stats.festivalLearning?.diwali,
  },
  {
    id: 'womens_day',
    title: 'महिला दिवस स्पेशल',
    description: 'महिला दिवस पर सीखा',
    icon: '👩',
    type: ACHIEVEMENT_TYPES.SPECIAL,
    rarity: 'epic',
    condition: (stats) => stats.festivalLearning?.womensDay,
  },
];

// Function to check and unlock achievements
export function checkAchievements(userStats, currentAchievements = []) {
  const newAchievements = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already unlocked
    if (currentAchievements.includes(achievement.id)) {
      return;
    }
    
    // Check if condition is met
    if (achievement.condition(userStats)) {
      newAchievements.push(achievement.id);
    }
  });
  
  return newAchievements;
}

// Get achievement by ID
export function getAchievement(id) {
  return ACHIEVEMENTS.find(achievement => achievement.id === id);
}

// Get achievements by type
export function getAchievementsByType(type) {
  return ACHIEVEMENTS.filter(achievement => achievement.type === type);
}

// Calculate achievement progress
export function getAchievementProgress(achievement, userStats) {
  // This is a simplified version - in real implementation, 
  // you'd have more sophisticated progress tracking
  if (achievement.condition(userStats)) {
    return 100;
  }
  
  // Basic progress estimation for streak achievements
  if (achievement.type === ACHIEVEMENT_TYPES.STREAK) {
    const targetStreak = parseInt(achievement.id.split('_')[1]);
    return Math.min(100, (userStats.currentStreak / targetStreak) * 100);
  }
  
  // Basic progress for interaction achievements
  if (achievement.type === ACHIEVEMENT_TYPES.INTERACTION) {
    if (achievement.id === 'chatty') {
      return Math.min(100, (userStats.totalCalls / 50) * 100);
    }
    if (achievement.id === 'super_learner') {
      return Math.min(100, (userStats.totalCalls / 100) * 100);
    }
  }
  
  return 0;
}

// Motivational messages for achievements
export const ACHIEVEMENT_MESSAGES = {
  unlock: [
    'वाह! आपने एक नया बैज अनलॉक किया! 🎉',
    'शाबाश! यह आपकी मेहनत का फल है! ⭐',
    'बहुत बढ़िया! आप आगे बढ़ रही हैं! 🚀',
    'अद्भुत! आपकी लगन देखकर खुशी हुई! 💖',
  ],
  progress: [
    'आप सही दिशा में जा रही हैं! 👍',
    'थोड़ा और मेहनत, बैज आपका! 💪',
    'बस कुछ कदम और! 🏃‍♀️',
    'आप कर सकती हैं! 🌟',
  ]
};
