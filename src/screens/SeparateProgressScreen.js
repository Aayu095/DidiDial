import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Modal
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../providers/AuthProvider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../config/theme';
import GradientBackground from '../components/GradientBackground';
import ProgressRing from '../components/ProgressRing';
import { VIDEO_LEARNING_MODULES } from './VideoLearningScreen';
import { VOICE_TOPICS } from '../services/enhancedGeminiVoiceAssistant';

const { width } = Dimensions.get('window');

// Badge/Sticker system for achievements
const LEARNING_BADGES = {
  // Video Learning Badges
  video_first_complete: {
    id: 'video_first_complete',
    title: 'पहला वीडियो पूरा',
    icon: '🎬',
    description: 'आपने अपना पहला वीडियो पूरा देखा!',
    color: ['#10B981', '#34D399'],
    category: 'video'
  },
  video_health_expert: {
    id: 'video_health_expert',
    title: 'स्वास्थ्य विशेषज्ञ',
    icon: '🏥',
    description: 'स्वास्थ्य के सभी वीडियो पूरे किए!',
    color: ['#EC4899', '#F472B6'],
    category: 'video'
  },
  video_digital_guru: {
    id: 'video_digital_guru',
    title: 'डिजिटल गुरु',
    icon: '📱',
    description: 'डिजिटल साक्षरता के सभी वीडियो पूरे!',
    color: ['#3B82F6', '#60A5FA'],
    category: 'video'
  },
  video_all_modules: {
    id: 'video_all_modules',
    title: 'वीडियो चैंपियन',
    icon: '👑',
    description: 'सभी वीडियो मॉड्यूल पूरे किए!',
    color: ['#F59E0B', '#FBBF24'],
    category: 'video'
  },
  
  // Voice Call Badges
  voice_first_call: {
    id: 'voice_first_call',
    title: 'पहली बातचीत',
    icon: '📞',
    description: 'दीदी से पहली बार बात की!',
    color: ['#8B5CF6', '#A78BFA'],
    category: 'voice'
  },
  voice_health_advisor: {
    id: 'voice_health_advisor',
    title: 'स्वास्थ्य सलाहकार',
    icon: '🩺',
    description: 'स्वास्थ्य पर 10 बार बात की!',
    color: ['#EF4444', '#F87171'],
    category: 'voice'
  },
  voice_digital_learner: {
    id: 'voice_digital_learner',
    title: 'डिजिटल शिक्षार्थी',
    icon: '💻',
    description: 'डिजिटल चीजों पर 5 बार बात की!',
    color: ['#06B6D4', '#67E8F9'],
    category: 'voice'
  },
  voice_conversation_master: {
    id: 'voice_conversation_master',
    title: 'बातचीत की मास्टर',
    icon: '🗣️',
    description: '50 से ज्यादा बातचीत की!',
    color: ['#84CC16', '#A3E635'],
    category: 'voice'
  },
  voice_time_champion: {
    id: 'voice_time_champion',
    title: 'समय चैंपियन',
    icon: '⏰',
    description: '2 घंटे से ज्यादा बात की!',
    color: ['#F97316', '#FB923C'],
    category: 'voice'
  }
};

export default function SeparateProgressScreen({ navigation }) {
  const { profile } = useAuth();
  const [selectedTab, setSelectedTab] = useState('video'); // 'video' or 'voice'
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [voiceProgress, setVoiceProgress] = useState({});
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
    loadProgress();
  }, [profile]);

  const loadProgress = () => {
    // Load video learning progress
    const videoData = profile?.videoModuleProgress || {};
    setVideoProgress(videoData);
    
    // Load voice call progress
    const voiceData = profile?.voiceCallProgress || {};
    setVoiceProgress(voiceData);
    
    // Calculate earned badges
    calculateEarnedBadges(videoData, voiceData);
  };

  const calculateEarnedBadges = (videoData, voiceData) => {
    const badges = [];
    
    // Video badges
    const completedVideoModules = Object.values(videoData).filter(module => module.completed).length;
    const totalVideoWatched = Object.values(videoData).reduce((sum, module) => sum + (module.watchedVideos?.length || 0), 0);
    
    if (totalVideoWatched >= 1) badges.push('video_first_complete');
    if (videoData.menstrual_health?.completed && videoData.pregnancy_care?.completed) badges.push('video_health_expert');
    if (videoData.digital_payments?.completed) badges.push('video_digital_guru');
    if (completedVideoModules >= VIDEO_LEARNING_MODULES.length) badges.push('video_all_modules');
    
    // Voice badges
    const totalVoiceCalls = Object.values(voiceData).reduce((sum, topic) => sum + (topic.totalCalls || 0), 0);
    const totalVoiceTime = Object.values(voiceData).reduce((sum, topic) => sum + (topic.totalDuration || 0), 0);
    const healthCalls = (voiceData.menstrual_health?.totalCalls || 0) + (voiceData.pregnancy_care?.totalCalls || 0) + (voiceData.general_health?.totalCalls || 0);
    const digitalCalls = voiceData.digital_literacy?.totalCalls || 0;
    
    if (totalVoiceCalls >= 1) badges.push('voice_first_call');
    if (healthCalls >= 10) badges.push('voice_health_advisor');
    if (digitalCalls >= 5) badges.push('voice_digital_learner');
    if (totalVoiceCalls >= 50) badges.push('voice_conversation_master');
    if (totalVoiceTime >= 7200) badges.push('voice_time_champion'); // 2 hours
    
    setEarnedBadges(badges);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} घंटे ${minutes} मिनट`;
    }
    return `${minutes} मिनट`;
  };

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      <Pressable
        style={[styles.tab, selectedTab === 'video' && styles.activeTab]}
        onPress={() => setSelectedTab('video')}
      >
        <Text style={[styles.tabIcon, selectedTab === 'video' && styles.activeTabIcon]}>🎬</Text>
        <Text style={[styles.tabText, selectedTab === 'video' && styles.activeTabText]}>
          वीडियो सीखना
        </Text>
      </Pressable>
      
      <Pressable
        style={[styles.tab, selectedTab === 'voice' && styles.activeTab]}
        onPress={() => setSelectedTab('voice')}
      >
        <Text style={[styles.tabIcon, selectedTab === 'voice' && styles.activeTabIcon]}>📞</Text>
        <Text style={[styles.tabText, selectedTab === 'voice' && styles.activeTabText]}>
          दीदी से बात
        </Text>
      </Pressable>
    </View>
  );

  const renderVideoProgress = () => {
    const totalModules = VIDEO_LEARNING_MODULES.length;
    const completedModules = Object.values(videoProgress).filter(module => module.completed).length;
    const totalVideosWatched = Object.values(videoProgress).reduce((sum, module) => sum + (module.watchedVideos?.length || 0), 0);
    const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

    return (
      <Animatable.View animation="fadeInRight" style={styles.progressContent}>
        {/* Overall Progress */}
        <View style={styles.overallProgressCard}>
          <View style={styles.progressHeader}>
            <ProgressRing
              progress={overallProgress}
              size={70}
              color={COLORS.primary[500]}
            >
              <Text style={styles.progressNumber}>
                {Math.round(overallProgress)}%
              </Text>
            </ProgressRing>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>वीडियो सीखने की प्रगति</Text>
              <Text style={styles.progressDesc}>
                📚 {completedModules}/{totalModules} मॉड्यूल पूरे
              </Text>
              <Text style={styles.progressDesc}>
                🎬 {totalVideosWatched} वीडियो देखे
              </Text>
            </View>
          </View>
        </View>

        {/* Module Progress */}
        <Text style={styles.sectionTitle}>मॉड्यूल की प्रगति</Text>
        {VIDEO_LEARNING_MODULES.map((module, index) => {
          const moduleProgress = videoProgress[module.id] || { watchedVideos: [], completed: false };
          const watchedCount = moduleProgress.watchedVideos.length;
          const totalVideos = module.videos.length;
          const modulePercentage = totalVideos > 0 ? (watchedCount / totalVideos) * 100 : 0;

          return (
            <Animatable.View
              key={module.id}
              animation="fadeInUp"
              delay={index * 100}
              style={styles.moduleProgressCard}
            >
              <LinearGradient
                colors={module.color}
                style={styles.moduleGradient}
              >
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleIcon}>{module.icon}</Text>
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleSubtitle}>
                      {watchedCount}/{totalVideos} वीडियो देखे
                    </Text>
                  </View>
                  <View style={styles.moduleStatus}>
                    {moduleProgress.completed && <Text style={styles.completedBadge}>✅</Text>}
                    <Text style={styles.modulePercentage}>{Math.round(modulePercentage)}%</Text>
                  </View>
                </View>
                <View style={styles.moduleProgressBar}>
                  <View 
                    style={[
                      styles.moduleProgressFill, 
                      { width: `${modulePercentage}%` }
                    ]} 
                  />
                </View>
              </LinearGradient>
            </Animatable.View>
          );
        })}
      </Animatable.View>
    );
  };

  const renderVoiceProgress = () => {
    const totalCalls = Object.values(voiceProgress).reduce((sum, topic) => sum + (topic.totalCalls || 0), 0);
    const totalDuration = Object.values(voiceProgress).reduce((sum, topic) => sum + (topic.totalDuration || 0), 0);
    const avgCallDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

    const topicTitles = {
      [VOICE_TOPICS.MENSTRUAL_HEALTH]: 'महावारी की जानकारी',
      [VOICE_TOPICS.PREGNANCY_CARE]: 'गर्भावस्था की देखभाल',
      [VOICE_TOPICS.DIGITAL_LITERACY]: 'डिजिटल साक्षरता',
      [VOICE_TOPICS.GENERAL_HEALTH]: 'सामान्य स्वास्थ्य'
    };

    return (
      <Animatable.View animation="fadeInLeft" style={styles.progressContent}>
        {/* Overall Voice Stats */}
        <View style={styles.overallProgressCard}>
          <View style={styles.voiceStatsContainer}>
            <View style={styles.voiceStat}>
              <Text style={styles.voiceStatNumber}>{totalCalls}</Text>
              <Text style={styles.voiceStatLabel}>कुल बातचीत</Text>
            </View>
            <View style={styles.voiceStat}>
              <Text style={styles.voiceStatNumber}>{formatDuration(totalDuration)}</Text>
              <Text style={styles.voiceStatLabel}>कुल समय</Text>
            </View>
            <View style={styles.voiceStat}>
              <Text style={styles.voiceStatNumber}>{formatDuration(avgCallDuration)}</Text>
              <Text style={styles.voiceStatLabel}>औसत समय</Text>
            </View>
          </View>
        </View>

        {/* Topic-wise Progress */}
        <Text style={styles.sectionTitle}>विषयवार प्रगति</Text>
        {Object.entries(VOICE_TOPICS).map(([key, topicId], index) => {
          const topicProgress = voiceProgress[topicId] || { totalCalls: 0, totalDuration: 0, conversations: [] };
          const recentCalls = topicProgress.conversations?.slice(-3) || [];

          return (
            <Animatable.View
              key={topicId}
              animation="fadeInUp"
              delay={index * 100}
              style={styles.topicProgressCard}
            >
              <View style={styles.topicHeader}>
                <Text style={styles.topicIcon}>
                  {topicId === VOICE_TOPICS.MENSTRUAL_HEALTH && '🩸'}
                  {topicId === VOICE_TOPICS.PREGNANCY_CARE && '🤱'}
                  {topicId === VOICE_TOPICS.DIGITAL_LITERACY && '📱'}
                  {topicId === VOICE_TOPICS.GENERAL_HEALTH && '🏥'}
                </Text>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicTitle}>{topicTitles[topicId]}</Text>
                  <Text style={styles.topicStats}>
                    {topicProgress.totalCalls} बातचीत • {formatDuration(topicProgress.totalDuration)}
                  </Text>
                </View>
              </View>
              
              {recentCalls.length > 0 && (
                <View style={styles.recentCallsContainer}>
                  <Text style={styles.recentCallsTitle}>हाल की बातचीत:</Text>
                  {recentCalls.map((call, callIndex) => (
                    <View key={callIndex} style={styles.recentCall}>
                      <Text style={styles.recentCallText} numberOfLines={2}>
                        "{call.userMessage}"
                      </Text>
                      <Text style={styles.recentCallDate}>
                        {new Date(call.timestamp).toLocaleDateString('hi-IN')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Animatable.View>
          );
        })}
      </Animatable.View>
    );
  };

  const renderBadges = () => {
    const categoryBadges = Object.values(LEARNING_BADGES).filter(badge => 
      selectedTab === 'video' ? badge.category === 'video' : badge.category === 'voice'
    );

    return (
      <View style={styles.badgesSection}>
        <Text style={styles.sectionTitle}>
          {selectedTab === 'video' ? '🏆 वीडियो बैज' : '🏆 बातचीत बैज'}
        </Text>
        <View style={styles.badgesGrid}>
          {categoryBadges.map((badge, index) => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <Animatable.View
                key={badge.id}
                animation="bounceIn"
                delay={index * 100}
              >
                <Pressable
                  style={[styles.badgeCard, !isEarned && styles.lockedBadge]}
                  onPress={() => {
                    setSelectedBadge(badge);
                    setShowBadgeModal(true);
                  }}
                >
                  <LinearGradient
                    colors={isEarned ? badge.color : ['#E5E7EB', '#D1D5DB']}
                    style={styles.badgeGradient}
                  >
                    <Text style={[styles.badgeIcon, !isEarned && styles.lockedBadgeIcon]}>
                      {isEarned ? badge.icon : '🔒'}
                    </Text>
                    <Text style={[styles.badgeTitle, !isEarned && styles.lockedBadgeText]}>
                      {badge.title}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </Animatable.View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderBadgeModal = () => (
    <Modal
      visible={showBadgeModal}
      animationType="fade"
      transparent
      onRequestClose={() => setShowBadgeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View animation="bounceIn" style={styles.badgeModal}>
          {selectedBadge && (
            <>
              <LinearGradient
                colors={earnedBadges.includes(selectedBadge.id) ? selectedBadge.color : ['#E5E7EB', '#D1D5DB']}
                style={styles.modalBadgeContainer}
              >
                <Text style={styles.modalBadgeIcon}>
                  {earnedBadges.includes(selectedBadge.id) ? selectedBadge.icon : '🔒'}
                </Text>
              </LinearGradient>
              <Text style={styles.modalBadgeTitle}>{selectedBadge.title}</Text>
              <Text style={styles.modalBadgeDescription}>{selectedBadge.description}</Text>
              <Text style={styles.modalBadgeStatus}>
                {earnedBadges.includes(selectedBadge.id) ? '✅ अर्जित किया गया!' : '🔒 अभी तक नहीं मिला'}
              </Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowBadgeModal(false)}
              >
                <Text style={styles.modalCloseText}>बंद करें</Text>
              </Pressable>
            </>
          )}
        </Animatable.View>
      </View>
    </Modal>
  );

  return (
    <GradientBackground colors={[COLORS.background.primary, COLORS.background.surface]}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>आपकी प्रगति</Text>
          <Text style={styles.headerSubtitle}>Your Learning Progress</Text>
        </View>

        {/* Tab Selector */}
        {renderTabSelector()}

        {/* Progress Content */}
        {selectedTab === 'video' ? renderVideoProgress() : renderVoiceProgress()}

        {/* Badges Section */}
        {renderBadges()}
      </ScrollView>

      {renderBadgeModal()}
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary[500],
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  activeTabIcon: {
    // No additional styles needed
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  activeTabText: {
    color: COLORS.neutral.white,
  },
  progressContent: {
    marginBottom: SPACING.lg,
  },
  overallProgressCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
  },
  progressInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  progressTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  progressDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  voiceStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  voiceStat: {
    alignItems: 'center',
  },
  voiceStatNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
    marginBottom: SPACING.xs,
  },
  voiceStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  moduleProgressCard: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  moduleGradient: {
    padding: SPACING.md,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  moduleIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  moduleSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  moduleStatus: {
    alignItems: 'center',
  },
  completedBadge: {
    fontSize: 18,
    marginBottom: SPACING.xs,
  },
  modulePercentage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
  },
  moduleProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  moduleProgressFill: {
    height: '100%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: 2,
  },
  topicProgressCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  topicIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  topicStats: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  recentCallsContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  recentCallsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  recentCall: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  recentCallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  recentCallDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  badgesSection: {
    marginBottom: SPACING.lg,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  badgeCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  lockedBadge: {
    opacity: 0.7,
  },
  badgeGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  lockedBadgeIcon: {
    opacity: 0.5,
  },
  badgeTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral.white,
    textAlign: 'center',
  },
  lockedBadgeText: {
    color: COLORS.neutral.gray[600],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  badgeModal: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  modalBadgeContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  modalBadgeIcon: {
    fontSize: 35,
  },
  modalBadgeTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalBadgeDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  modalBadgeStatus: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary[600],
    marginBottom: SPACING.lg,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
  },
  modalCloseText: {
    color: COLORS.neutral.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});