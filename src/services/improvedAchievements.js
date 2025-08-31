// Enhanced Achievement System for Rural Women's Digital Education
export const ACHIEVEMENT_CATEGORIES = {
  LEARNING: 'learning',
  CONSISTENCY: 'consistency', 
  COMMUNICATION: 'communication',
  PROGRESS: 'progress',
  COMMUNITY: 'community',
  SPECIAL: 'special'
};

export const ACHIEVEMENT_RARITIES = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

// Culturally relevant achievements for rural Indian women
export const ENHANCED_ACHIEVEMENTS = [
  // Learning Achievements
  {
    id: 'first_lesson',
    title: '🌸 शुरुआत चैंपियन',
    titleEnglish: 'Shuruaat Champion',
    description: 'पहला पाठ पूरा किया',
    descriptionEnglish: 'Completed first lesson',
    category: ACHIEVEMENT_CATEGORIES.LEARNING,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '🌸',
    color: '#FF69B4',
    requirement: { type: 'lessons_completed', count: 1 },
    motivationalMessage: 'शा���ाश! आपने अपनी सीखने की यात्रा शुरू कर दी है। आगे बढ़ते रहें!'
  },
  {
    id: 'three_lessons',
    title: '🌟 सीखने वाली बहन',
    titleEnglish: 'Seekhne Wali Behen',
    description: '3 पाठ पूरे किए',
    descriptionEnglish: 'Completed 3 lessons',
    category: ACHIEVEMENT_CATEGORIES.LEARNING,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '🌟',
    color: '#FFD700',
    requirement: { type: 'lessons_completed', count: 3 },
    motivationalMessage: 'वाह! आप तो सच में सीखने वाली बहन हैं। ऐसे ही आगे बढ़ें!'
  },
  {
    id: 'ten_lessons',
    title: '📚 ज्ञान की प्यासी',
    titleEnglish: 'Gyan Ki Pyaasi',
    description: '10 पाठ पूरे किए',
    descriptionEnglish: 'Completed 10 lessons',
    category: ACHIEVEMENT_CATEGORIES.LEARNING,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '📚',
    color: '#4169E1',
    requirement: { type: 'lessons_completed', count: 10 },
    motivationalMessage: 'आप तो ज्ञान की सच्ची प्या��ी हैं! आपकी मेहनत सराहनीय है।'
  },
  {
    id: 'knowledge_queen',
    title: '👑 ज्ञान रानी',
    titleEnglish: 'Gyan Rani',
    description: 'सभी मुख्य विषय पूरे किए',
    descriptionEnglish: 'Completed all main subjects',
    category: ACHIEVEMENT_CATEGORIES.LEARNING,
    rarity: ACHIEVEMENT_RARITIES.LEGENDARY,
    icon: '👑',
    color: '#8A2BE2',
    requirement: { type: 'modules_completed', count: 5 },
    motivationalMessage: 'आप सच में ज्ञान की रानी हैं! पूरे समुदाय के लिए प्रेरणा हैं।'
  },

  // Consistency Achievements
  {
    id: 'three_day_streak',
    title: '🔥 लगातार सीखने वाली',
    titleEnglish: 'Lagatar Seekhne Wali',
    description: '3 दिन लगातार सीखा',
    descriptionEnglish: '3 day learning streak',
    category: ACHIEVEMENT_CATEGORIES.CONSISTENCY,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '🔥',
    color: '#FF4500',
    requirement: { type: 'streak_days', count: 3 },
    motivationalMessage: 'बहुत बढ़िया! लगाता�� सीखना ही सफलता की चाबी है।'
  },
  {
    id: 'seven_day_streak',
    title: '🪔 दीदी की रोशनी',
    titleEnglish: 'Didi Ki Roshni',
    description: '7 दिन लगातार सीखा',
    descriptionEnglish: '7 day learning streak',
    category: ACHIEVEMENT_CATEGORIES.CONSISTENCY,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '🪔',
    color: '#FF8C00',
    requirement: { type: 'streak_days', count: 7 },
    motivationalMessage: 'आप तो दीदी की सच्ची रोशनी हैं! आपका जुनून देखने लायक है।'
  },
  {
    id: 'thirty_day_streak',
    title: '🌅 सूर्य की तरह निरंतर',
    titleEnglish: 'Surya Ki Tarah Nirantar',
    description: '30 दिन लगातार सीखा',
    descriptionEnglish: '30 day learning streak',
    category: ACHIEVEMENT_CATEGORIES.CONSISTENCY,
    rarity: ACHIEVEMENT_RARITIES.EPIC,
    icon: '🌅',
    color: '#FF6347',
    requirement: { type: 'streak_days', count: 30 },
    motivationalMessage: 'वाह! आप तो सूर्य की तरह निरंतर चमक रही हैं। अद्भुत!'
  },

  // Communication Achievements
  {
    id: 'first_call',
    title: '📞 पहली बातचीत',
    titleEnglish: 'Pehli Baatcheet',
    description: 'दीदी से पहली बार बात की',
    descriptionEnglish: 'First conversation with Didi',
    category: ACHIEVEMENT_CATEGORIES.COMMUNICATION,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '📞',
    color: '#32CD32',
    requirement: { type: 'calls_completed', count: 1 },
    motivationalMessage: 'शाबाश! आपने हिम्मत दिखाई और दीदी से बात की।'
  },
  {
    id: 'confident_speaker',
    title: '🗣️ आत्मविश्वास से भरी',
    titleEnglish: 'Aatmvishwas Se Bhari',
    description: '10 बार दीदी से बात की',
    descriptionEnglish: '10 conversations with Didi',
    category: ACHIEVEMENT_CATEGORIES.COMMUNICATION,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '🗣️',
    color: '#20B2AA',
    requirement: { type: 'calls_completed', count: 10 },
    motivationalMessage: 'आप तो आत्मविश्वास से भरी हुई हैं! बात करने में माहिर हो गईं।'
  },
  {
    id: 'voice_champion',
    title: '🎤 आवाज़ की चैंपियन',
    titleEnglish: 'Awaaz Ki Champion',
    description: '50 बार दीदी से बात की',
    descriptionEnglish: '50 conversations with Didi',
    category: ACHIEVEMENT_CATEGORIES.COMMUNICATION,
    rarity: ACHIEVEMENT_RARITIES.EPIC,
    icon: '🎤',
    color: '#9370DB',
    requirement: { type: 'calls_completed', count: 50 },
    motivationalMessage: 'आप तो आवाज़ की सच्ची चैंपियन हैं! आपकी बातचीत कमाल की है।'
  },

  // Progress Achievements
  {
    id: 'quick_learner',
    title: '⚡ तेज़ सीखने वाली',
    titleEnglish: 'Tez Seekhne Wali',
    description: '1 दिन में 3 पाठ पूरे किए',
    descriptionEnglish: 'Completed 3 lessons in 1 day',
    category: ACHIEVEMENT_CATEGORIES.PROGRESS,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '⚡',
    color: '#FFD700',
    requirement: { type: 'lessons_per_day', count: 3 },
    motivationalMessage: 'वाह! आप तो बहुत तेज़ सीखती हैं। शा���दार!'
  },
  {
    id: 'perfect_score',
    title: '💯 परफेक्ट स्कोर',
    titleEnglish: 'Perfect Score',
    description: 'किसी पाठ में 100% अंक पाए',
    descriptionEnglish: 'Got 100% in a lesson',
    category: ACHIEVEMENT_CATEGORIES.PROGRESS,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '💯',
    color: '#FF1493',
    requirement: { type: 'perfect_score', count: 1 },
    motivationalMessage: 'परफेक्ट! आपने 100% अंक पाए हैं। बेहतरीन!'
  },

  // Community Achievements
  {
    id: 'helpful_sister',
    title: '🤝 मददगार बहन',
    titleEnglish: 'Madadgar Behen',
    description: '5 लोगों की मदद की',
    descriptionEnglish: 'Helped 5 people',
    category: ACHIEVEMENT_CATEGORIES.COMMUNITY,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '🤝',
    color: '#FF69B4',
    requirement: { type: 'people_helped', count: 5 },
    motivationalMessage: 'आप तो सच्ची मददगार बहन हैं! दूसरों की मदद करना बहुत अच्छी बात है।'
  },
  {
    id: 'story_teller',
    title: '📖 कहानी सुनाने वाली',
    titleEnglish: 'Kahani Sunane Wali',
    description: '3 सफलता की कहानियां साझा कीं',
    descriptionEnglish: 'Shared 3 success stories',
    category: ACHIEVEMENT_CATEGORIES.COMMUNITY,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '📖',
    color: '#4169E1',
    requirement: { type: 'stories_shared', count: 3 },
    motivationalMessage: 'आपकी कहानियां दूसरों को प्रेरणा देती हैं। बहुत खूब!'
  },

  // Special Achievements
  {
    id: 'early_bird',
    title: '🌅 सुबह की चिड़िया',
    titleEnglish: 'Subah Ki Chidiya',
    description: 'सुबह 6 बजे से पहले सीखा',
    descriptionEnglish: 'Learned before 6 AM',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '🌅',
    color: '#FF8C00',
    requirement: { type: 'early_learning', count: 1 },
    motivationalMessage: 'वाह! आप तो सुबह की चिड़िया हैं। जल्दी उठकर सीखना बहुत अच्छी आदत है।'
  },
  {
    id: 'night_owl',
    title: '🌙 रात की रानी',
    titleEnglish: 'Raat Ki Rani',
    description: 'रात 10 बजे के बाद सीखा',
    descriptionEnglish: 'Learned after 10 PM',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '🌙',
    color: '#4B0082',
    requirement: { type: 'night_learning', count: 1 },
    motivationalMessage: 'आप तो रात की रानी हैं! देर रात भी सीखने का जुनून देखिए।'
  },
  {
    id: 'festival_learner',
    title: '🎉 त्योहारी सीखने वाली',
    titleEnglish: 'Tyohari Seekhne Wali',
    description: 'त्योहार के दिन भी सीखा',
    descriptionEnglish: 'Learned on a festival day',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    rarity: ACHIEVEMENT_RARITIES.EPIC,
    icon: '🎉',
    color: '#FF1493',
    requirement: { type: 'festival_learning', count: 1 },
    motivationalMessage: 'त्योहार के दिन भी सीखना! आपका जुनून लाजवाब है।'
  },
  {
    id: 'didi_favorite',
    title: '💖 दीदी की लाडली',
    titleEnglish: 'Didi Ki Ladli',
    description: 'दीदी के साथ 100 मिनट बात की',
    descriptionEnglish: 'Talked with Didi for 100 minutes',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    rarity: ACHIEVEMENT_RARITIES.LEGENDARY,
    icon: '💖',
    color: '#FF1493',
    requirement: { type: 'total_talk_time', count: 100 },
    motivationalMessage: 'आप तो दीदी की सच्ची लाडली हैं! इतन�� देर बात करना प्यार दिखाता है।'
  }
];

// Function to check if user has earned new achievements
export function checkNewAchievements(userStats, currentAchievements = []) {
  const newAchievements = [];
  
  for (const achievement of ENHANCED_ACHIEVEMENTS) {
    // Skip if already earned
    if (currentAchievements.includes(achievement.id)) {
      continue;
    }
    
    // Check if requirement is met
    if (isRequirementMet(achievement.requirement, userStats)) {
      newAchievements.push(achievement.id);
    }
  }
  
  return newAchievements;
}

function isRequirementMet(requirement, userStats) {
  switch (requirement.type) {
    case 'lessons_completed':
      return (userStats.lessonsCompleted || 0) >= requirement.count;
    
    case 'modules_completed':
      return (userStats.modulesCompleted?.length || 0) >= requirement.count;
    
    case 'streak_days':
      return (userStats.currentStreak || 0) >= requirement.count;
    
    case 'calls_completed':
      return (userStats.totalCalls || 0) >= requirement.count;
    
    case 'lessons_per_day':
      return (userStats.lessonsToday || 0) >= requirement.count;
    
    case 'perfect_score':
      return (userStats.perfectScores || 0) >= requirement.count;
    
    case 'people_helped':
      return (userStats.peopleHelped || 0) >= requirement.count;
    
    case 'stories_shared':
      return (userStats.storiesShared || 0) >= requirement.count;
    
    case 'early_learning':
      return userStats.hasEarlyLearning || false;
    
    case 'night_learning':
      return userStats.hasNightLearning || false;
    
    case 'festival_learning':
      return userStats.hasFestivalLearning || false;
    
    case 'total_talk_time':
      return (userStats.totalTalkTime || 0) >= requirement.count;
    
    default:
      return false;
  }
}

// Get achievement by ID
export function getAchievementById(achievementId) {
  return ENHANCED_ACHIEVEMENTS.find(a => a.id === achievementId);
}

// Get achievements by category
export function getAchievementsByCategory(category) {
  return ENHANCED_ACHIEVEMENTS.filter(a => a.category === category);
}

// Get achievements by rarity
export function getAchievementsByRarity(rarity) {
  return ENHANCED_ACHIEVEMENTS.filter(a => a.rarity === rarity);
}

// Calculate achievement progress
export function calculateAchievementProgress(userStats) {
  const totalAchievements = ENHANCED_ACHIEVEMENTS.length;
  const earnedAchievements = userStats.achievements?.length || 0;
  
  return {
    total: totalAchievements,
    earned: earnedAchievements,
    percentage: Math.round((earnedAchievements / totalAchievements) * 100),
    remaining: totalAchievements - earnedAchievements
  };
}

// Get next achievable achievements
export function getNextAchievements(userStats, currentAchievements = [], limit = 3) {
  const nextAchievements = [];
  
  for (const achievement of ENHANCED_ACHIEVEMENTS) {
    if (currentAchievements.includes(achievement.id)) {
      continue;
    }
    
    // Calculate how close user is to earning this achievement
    const progress = calculateRequirementProgress(achievement.requirement, userStats);
    
    if (progress.percentage > 0) {
      nextAchievements.push({
        ...achievement,
        progress
      });
    }
  }
  
  // Sort by progress percentage (closest to completion first)
  return nextAchievements
    .sort((a, b) => b.progress.percentage - a.progress.percentage)
    .slice(0, limit);
}

function calculateRequirementProgress(requirement, userStats) {
  let current = 0;
  let target = requirement.count;
  
  switch (requirement.type) {
    case 'lessons_completed':
      current = userStats.lessonsCompleted || 0;
      break;
    case 'modules_completed':
      current = userStats.modulesCompleted?.length || 0;
      break;
    case 'streak_days':
      current = userStats.currentStreak || 0;
      break;
    case 'calls_completed':
      current = userStats.totalCalls || 0;
      break;
    case 'total_talk_time':
      current = userStats.totalTalkTime || 0;
      break;
    default:
      return { current: 0, target: 1, percentage: 0 };
  }
  
  return {
    current: Math.min(current, target),
    target,
    percentage: Math.min(Math.round((current / target) * 100), 100)
  };
}