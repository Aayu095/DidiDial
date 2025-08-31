// Community Learning Platform for Peer Support and Mentorship
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Community features for peer learning and support
export const COMMUNITY_ROLES = {
  LEARNER: 'learner',
  MENTOR: 'mentor',
  COMMUNITY_LEADER: 'community_leader',
  MODERATOR: 'moderator'
};

export const GROUP_TYPES = {
  STUDY_GROUP: 'study_group',
  SUPPORT_GROUP: 'support_group',
  REGIONAL_GROUP: 'regional_group',
  SKILL_BASED: 'skill_based'
};

export const INTERACTION_TYPES = {
  HELP_REQUEST: 'help_request',
  SUCCESS_STORY: 'success_story',
  QUESTION: 'question',
  ANSWER: 'answer',
  ENCOURAGEMENT: 'encouragement',
  RESOURCE_SHARE: 'resource_share'
};

// Community Learning Service
export class CommunityLearningService {
  constructor() {
    this.db = getFirestore();
  }

  // Create user community profile
  async createCommunityProfile(userId, profileData) {
    try {
      const communityProfile = {
        userId,
        displayName: profileData.name || 'दीदी की सहेली',
        role: COMMUNITY_ROLES.LEARNER,
        location: {
          state: profileData.state || '',
          district: profileData.district || '',
          village: profileData.village || ''
        },
        learningGoals: profileData.learningGoals || [],
        completedModules: [],
        helpOffered: [],
        helpReceived: [],
        mentorshipStatus: {
          isMentor: false,
          mentees: [],
          mentor: null
        },
        communityStats: {
          helpGiven: 0,
          helpReceived: 0,
          storiesShared: 0,
          questionsAnswered: 0,
          reputationScore: 0
        },
        preferences: {
          shareProgress: true,
          receiveHelp: true,
          offerHelp: false,
          joinGroups: true
        },
        createdAt: Date.now(),
        lastActive: Date.now()
      };

      await setDoc(doc(this.db, 'communityProfiles', userId), communityProfile);
      return communityProfile;
    } catch (error) {
      console.error('Error creating community profile:', error);
      throw error;
    }
  }

  // Find learning peers based on location and goals
  async findLearningPeers(userId, filters = {}) {
    try {
      const userProfile = await this.getCommunityProfile(userId);
      if (!userProfile) return [];

      let q = collection(this.db, 'communityProfiles');
      
      // Filter by location if specified
      if (filters.sameLocation && userProfile.location.state) {
        q = query(q, where('location.state', '==', userProfile.location.state));
      }
      
      // Filter by learning goals
      if (filters.similarGoals && userProfile.learningGoals.length > 0) {
        q = query(q, where('learningGoals', 'array-contains-any', userProfile.learningGoals));
      }
      
      // Exclude self and limit results
      q = query(q, limit(20));
      
      const snapshot = await getDocs(q);
      const peers = [];
      
      snapshot.forEach(doc => {
        if (doc.id !== userId) {
          const peerData = doc.data();
          peers.push({
            id: doc.id,
            ...peerData,
            compatibility: this.calculateCompatibility(userProfile, peerData)
          });
        }
      });
      
      // Sort by compatibility score
      return peers.sort((a, b) => b.compatibility - a.compatibility);
    } catch (error) {
      console.error('Error finding learning peers:', error);
      return [];
    }
  }

  // Calculate compatibility between users
  calculateCompatibility(user1, user2) {
    let score = 0;
    
    // Location similarity
    if (user1.location.state === user2.location.state) score += 30;
    if (user1.location.district === user2.location.district) score += 20;
    
    // Learning goals overlap
    const commonGoals = user1.learningGoals.filter(goal => 
      user2.learningGoals.includes(goal)
    );
    score += commonGoals.length * 15;
    
    // Similar progress level
    const progressDiff = Math.abs(
      user1.completedModules.length - user2.completedModules.length
    );
    score += Math.max(0, 20 - progressDiff * 5);
    
    // Activity level
    const daysSinceActive = (Date.now() - user2.lastActive) / (1000 * 60 * 60 * 24);
    if (daysSinceActive < 7) score += 10;
    
    return Math.min(score, 100);
  }

  // Create or join study groups
  async createStudyGroup(creatorId, groupData) {
    try {
      const groupId = `group_${Date.now()}_${creatorId}`;
      const studyGroup = {
        id: groupId,
        name: groupData.name,
        description: groupData.description,
        type: groupData.type || GROUP_TYPES.STUDY_GROUP,
        creatorId,
        members: [creatorId],
        maxMembers: groupData.maxMembers || 10,
        location: groupData.location || {},
        focusAreas: groupData.focusAreas || [],
        schedule: groupData.schedule || {},
        isActive: true,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        groupStats: {
          totalSessions: 0,
          totalMembers: 1,
          averageProgress: 0
        }
      };

      await setDoc(doc(this.db, 'studyGroups', groupId), studyGroup);
      
      // Update creator's profile
      await this.updateCommunityProfile(creatorId, {
        'communityStats.groupsCreated': increment(1)
      });
      
      return studyGroup;
    } catch (error) {
      console.error('Error creating study group:', error);
      throw error;
    }
  }

  // Join study group
  async joinStudyGroup(userId, groupId) {
    try {
      const groupRef = doc(this.db, 'studyGroups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        throw new Error('Study group not found');
      }
      
      const groupData = groupDoc.data();
      
      if (groupData.members.length >= groupData.maxMembers) {
        throw new Error('Study group is full');
      }
      
      if (groupData.members.includes(userId)) {
        throw new Error('Already a member of this group');
      }
      
      // Add user to group
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
        'groupStats.totalMembers': increment(1),
        lastActivity: Date.now()
      });
      
      // Update user's profile
      await this.updateCommunityProfile(userId, {
        'communityStats.groupsJoined': increment(1)
      });
      
      return true;
    } catch (error) {
      console.error('Error joining study group:', error);
      throw error;
    }
  }

  // Share success story
  async shareSuccessStory(userId, storyData) {
    try {
      const storyId = `story_${Date.now()}_${userId}`;
      const successStory = {
        id: storyId,
        userId,
        title: storyData.title,
        content: storyData.content,
        category: storyData.category,
        moduleCompleted: storyData.moduleCompleted || null,
        skillLearned: storyData.skillLearned || '',
        impactDescription: storyData.impactDescription || '',
        beforeAfter: storyData.beforeAfter || {},
        isAnonymous: storyData.isAnonymous || false,
        likes: 0,
        comments: [],
        shares: 0,
        isVerified: false,
        createdAt: Date.now(),
        tags: storyData.tags || []
      };

      await setDoc(doc(this.db, 'successStories', storyId), successStory);
      
      // Update user's community stats
      await this.updateCommunityProfile(userId, {
        'communityStats.storiesShared': increment(1),
        'communityStats.reputationScore': increment(10)
      });
      
      return successStory;
    } catch (error) {
      console.error('Error sharing success story:', error);
      throw error;
    }
  }

  // Get success stories for inspiration
  async getSuccessStories(filters = {}) {
    try {
      let q = collection(this.db, 'successStories');
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters.moduleCompleted) {
        q = query(q, where('moduleCompleted', '==', filters.moduleCompleted));
      }
      
      q = query(q, orderBy('createdAt', 'desc'), limit(filters.limit || 20));
      
      const snapshot = await getDocs(q);
      const stories = [];
      
      snapshot.forEach(doc => {
        stories.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return stories;
    } catch (error) {
      console.error('Error getting success stories:', error);
      return [];
    }
  }

  // Request help from community
  async requestHelp(userId, helpRequest) {
    try {
      const requestId = `help_${Date.now()}_${userId}`;
      const helpRequestData = {
        id: requestId,
        userId,
        title: helpRequest.title,
        description: helpRequest.description,
        category: helpRequest.category,
        urgency: helpRequest.urgency || 'medium',
        skillNeeded: helpRequest.skillNeeded || '',
        preferredHelpType: helpRequest.preferredHelpType || 'text', // text, voice, video
        location: helpRequest.location || {},
        isResolved: false,
        responses: [],
        helpersAssigned: [],
        createdAt: Date.now(),
        tags: helpRequest.tags || []
      };

      await setDoc(doc(this.db, 'helpRequests', requestId), helpRequestData);
      
      // Update user's community stats
      await this.updateCommunityProfile(userId, {
        'communityStats.helpRequested': increment(1)
      });
      
      // Notify potential helpers
      await this.notifyPotentialHelpers(helpRequestData);
      
      return helpRequestData;
    } catch (error) {
      console.error('Error requesting help:', error);
      throw error;
    }
  }

  // Offer help to someone
  async offerHelp(helperId, requestId, offerData) {
    try {
      const helpOffer = {
        helperId,
        requestId,
        message: offerData.message,
        availableTime: offerData.availableTime || '',
        helpMethod: offerData.helpMethod || 'text',
        experience: offerData.experience || '',
        isAccepted: false,
        createdAt: Date.now()
      };

      // Add offer to help request
      const requestRef = doc(this.db, 'helpRequests', requestId);
      await updateDoc(requestRef, {
        responses: arrayUnion(helpOffer)
      });
      
      // Update helper's community stats
      await this.updateCommunityProfile(helperId, {
        'communityStats.helpOffered': increment(1),
        'communityStats.reputationScore': increment(5)
      });
      
      return helpOffer;
    } catch (error) {
      console.error('Error offering help:', error);
      throw error;
    }
  }

  // Mentor system - become a mentor
  async becomeMentor(userId, mentorData) {
    try {
      const mentorProfile = {
        userId,
        expertise: mentorData.expertise || [],
        experience: mentorData.experience || '',
        availableTime: mentorData.availableTime || '',
        maxMentees: mentorData.maxMentees || 3,
        currentMentees: [],
        mentorshipStyle: mentorData.mentorshipStyle || 'supportive',
        languages: mentorData.languages || ['hindi'],
        isActive: true,
        rating: 0,
        totalSessions: 0,
        successStories: [],
        createdAt: Date.now()
      };

      await setDoc(doc(this.db, 'mentors', userId), mentorProfile);
      
      // Update user's community profile
      await this.updateCommunityProfile(userId, {
        'mentorshipStatus.isMentor': true,
        'communityStats.reputationScore': increment(20)
      });
      
      return mentorProfile;
    } catch (error) {
      console.error('Error becoming mentor:', error);
      throw error;
    }
  }

  // Find mentors
  async findMentors(userId, preferences = {}) {
    try {
      let q = collection(this.db, 'mentors');
      q = query(q, where('isActive', '==', true));
      
      if (preferences.expertise) {
        q = query(q, where('expertise', 'array-contains-any', preferences.expertise));
      }
      
      const snapshot = await getDocs(q);
      const mentors = [];
      
      snapshot.forEach(doc => {
        const mentorData = doc.data();
        if (mentorData.currentMentees.length < mentorData.maxMentees) {
          mentors.push({
            id: doc.id,
            ...mentorData
          });
        }
      });
      
      return mentors;
    } catch (error) {
      console.error('Error finding mentors:', error);
      return [];
    }
  }

  // Community engagement analytics
  async getCommunityAnalytics(userId) {
    try {
      const profile = await this.getCommunityProfile(userId);
      if (!profile) return null;

      // Get user's community interactions
      const helpRequestsQuery = query(
        collection(this.db, 'helpRequests'),
        where('userId', '==', userId)
      );
      const helpRequestsSnapshot = await getDocs(helpRequestsQuery);
      
      const storiesQuery = query(
        collection(this.db, 'successStories'),
        where('userId', '==', userId)
      );
      const storiesSnapshot = await getDocs(storiesQuery);
      
      return {
        profile: profile.communityStats,
        helpRequests: helpRequestsSnapshot.size,
        successStories: storiesSnapshot.size,
        communityRank: await this.calculateCommunityRank(userId),
        impactScore: this.calculateImpactScore(profile.communityStats),
        badges: this.getCommunityBadges(profile.communityStats)
      };
    } catch (error) {
      console.error('Error getting community analytics:', error);
      return null;
    }
  }

  // Helper methods
  async getCommunityProfile(userId) {
    try {
      const doc = await getDoc(doc(this.db, 'communityProfiles', userId));
      return doc.exists() ? doc.data() : null;
    } catch (error) {
      console.error('Error getting community profile:', error);
      return null;
    }
  }

  async updateCommunityProfile(userId, updates) {
    try {
      const profileRef = doc(this.db, 'communityProfiles', userId);
      await updateDoc(profileRef, {
        ...updates,
        lastActive: Date.now()
      });
    } catch (error) {
      console.error('Error updating community profile:', error);
    }
  }

  calculateImpactScore(stats) {
    return (
      stats.helpGiven * 10 +
      stats.storiesShared * 15 +
      stats.questionsAnswered * 8 +
      stats.reputationScore
    );
  }

  getCommunityBadges(stats) {
    const badges = [];
    
    if (stats.helpGiven >= 5) badges.push({ name: 'सहायक', icon: '🤝', description: '5 लोगों की मदद की' });
    if (stats.helpGiven >= 20) badges.push({ name: 'मददगार', icon: '🌟', description: '20 लोगों की मदद की' });
    if (stats.storiesShared >= 3) badges.push({ name: 'प्रेरणादायक', icon: '✨', description: '3 सफलता की कहानियां साझा कीं' });
    if (stats.questionsAnswered >= 10) badges.push({ name: 'ज्ञानी', icon: '🧠', description: '10 सवालों के जवाब दिए' });
    if (stats.reputationScore >= 100) badges.push({ name: 'समुदाय नेता', icon: '👑', description: 'उच्च प्रतिष्ठा स्कोर' });
    
    return badges;
  }

  async calculateCommunityRank(userId) {
    // Simplified ranking - in real implementation, this would be more sophisticated
    try {
      const profile = await this.getCommunityProfile(userId);
      if (!profile) return 'नया सदस्य';
      
      const score = profile.communityStats.reputationScore;
      
      if (score >= 200) return 'समुदाय नेता';
      if (score >= 100) return 'सक्रिय सदस्य';
      if (score >= 50) return 'योगदानकर्ता';
      if (score >= 20) return 'सहयोगी';
      return 'नया सदस्य';
    } catch (error) {
      return 'नया सदस्य';
    }
  }

  async notifyPotentialHelpers(helpRequest) {
    // In a real implementation, this would send push notifications
    // to users who have expertise in the requested area
    console.log('Notifying potential helpers for:', helpRequest.title);
  }
}

// Community interaction templates
export const COMMUNITY_TEMPLATES = {
  helpRequest: {
    technical: {
      title: 'तकनीकी समस्या में मदद चाहिए',
      categories: ['फोन की समस्या', 'ऐप की समस्या', 'इंटरनेट की समस्या']
    },
    learning: {
      title: 'सीखने में मदद चाहिए',
      categories: ['पढ़ना-लिखना', 'गणित', 'अंग्रेजी', 'डिजिटल स्किल']
    },
    practical: {
      title: 'व्यावहारिक मदद चाहिए',
      categories: ['बैंक का काम', 'सरकारी योजना', 'ऑनलाइन फॉर्म']
    }
  },
  successStory: {
    learning: 'मैंने यह सीखा और इससे मेरी जिंदगी कैसे बदली',
    skill: 'नई स्किल सीखकर मैंने यह हासिल किया',
    confidence: 'दीदी के साथ सीखकर मेरा आत्मविश्वास बढ़ा'
  },
  encouragement: [
    'आप बहुत अच्छा कर रही हैं! 🌟',
    'हार मत मानिए, आप कर सकती हैं! 💪',
    'आपकी मेहनत रंग लाएगी! 🌈',
    'एक कदम और, आप पहुंच जाएंगी! 🚀'
  ]
};