import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

// Accessibility features for inclusive design
export const ACCESSIBILITY_FEATURES = {
  VOICE_NAVIGATION: 'voice_navigation',
  HIGH_CONTRAST: 'high_contrast',
  LARGE_TEXT: 'large_text',
  SCREEN_READER: 'screen_reader',
  VOICE_COMMANDS: 'voice_commands',
  HAPTIC_FEEDBACK: 'haptic_feedback',
  SLOW_SPEECH: 'slow_speech',
};

// Default accessibility settings
export const DEFAULT_ACCESSIBILITY_SETTINGS = {
  [ACCESSIBILITY_FEATURES.VOICE_NAVIGATION]: false,
  [ACCESSIBILITY_FEATURES.HIGH_CONTRAST]: false,
  [ACCESSIBILITY_FEATURES.LARGE_TEXT]: false,
  [ACCESSIBILITY_FEATURES.SCREEN_READER]: false,
  [ACCESSIBILITY_FEATURES.VOICE_COMMANDS]: true,
  [ACCESSIBILITY_FEATURES.HAPTIC_FEEDBACK]: true,
  [ACCESSIBILITY_FEATURES.SLOW_SPEECH]: false,
  speechRate: 0.8,
  speechPitch: 1.0,
  textSize: 'normal', // small, normal, large, extra_large
  contrastLevel: 'normal', // normal, high, extra_high
};

// Voice commands in Hindi
export const VOICE_COMMANDS = {
  // Navigation commands
  'होम जाओ': { action: 'navigate', target: 'Home' },
  'घर जाओ': { action: 'navigate', target: 'Home' },
  'कॉल करो': { action: 'navigate', target: 'Call' },
  'प्रगति देखो': { action: 'navigate', target: 'Progress' },
  'सेटिंग्स खोलो': { action: 'navigate', target: 'Settings' },
  'समुदाय देखो': { action: 'navigate', target: 'Community' },
  
  // Call controls
  'बोलना शुरू करो': { action: 'start_recording' },
  'रिकॉर्डिंग बंद करो': { action: 'stop_recording' },
  'कॉल बंद करो': { action: 'end_call' },
  
  // General commands
  'मदद चाहिए': { action: 'help' },
  'दोहराओ': { action: 'repeat' },
  'रोको': { action: 'stop' },
  'हां': { action: 'confirm' },
  'नहीं': { action: 'cancel' },
  
  // Emergency commands
  'इमरजेंसी': { action: 'emergency' },
  'हेल्प': { action: 'emergency' },
  'बचाओ': { action: 'emergency' },
};

// High contrast color schemes
export const HIGH_CONTRAST_COLORS = {
  normal: {
    background: '#000000',
    text: '#FFFFFF',
    primary: '#FFFF00',
    secondary: '#00FFFF',
    accent: '#FF00FF',
    success: '#00FF00',
    warning: '#FF8800',
    error: '#FF0000',
  },
  extraHigh: {
    background: '#000000',
    text: '#FFFFFF',
    primary: '#FFFFFF',
    secondary: '#FFFF00',
    accent: '#00FFFF',
    success: '#00FF00',
    warning: '#FFFF00',
    error: '#FF0000',
  }
};

// Text size multipliers
export const TEXT_SIZE_MULTIPLIERS = {
  small: 0.8,
  normal: 1.0,
  large: 1.3,
  extra_large: 1.6,
};

// Load accessibility settings
export async function loadAccessibilitySettings() {
  try {
    const settings = await AsyncStorage.getItem('accessibility_settings');
    if (settings) {
      return { ...DEFAULT_ACCESSIBILITY_SETTINGS, ...JSON.parse(settings) };
    }
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  } catch (error) {
    console.error('Error loading accessibility settings:', error);
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  }
}

// Save accessibility settings
export async function saveAccessibilitySettings(settings) {
  try {
    await AsyncStorage.setItem('accessibility_settings', JSON.stringify(settings));
    return { success: true };
  } catch (error) {
    console.error('Error saving accessibility settings:', error);
    return { success: false, error: error.message };
  }
}

// Voice navigation announcements
export async function announceScreen(screenName, settings) {
  if (!settings[ACCESSIBILITY_FEATURES.VOICE_NAVIGATION]) return;
  
  const announcements = {
    Home: 'होम स्क्रीन खुली है। यहां आप सीखने के पैक चुन सकती हैं।',
    Call: 'कॉल स्क्रीन खुली है। दीदी से बात करने के लिए तैयार हैं।',
    Progress: 'प्रगति स्क्रीन खुली है। यहां आप अपनी उपलब्धियां देख सकती हैं।',
    Settings: 'सेटिंग्स स्क्रीन खुली है। यहां आप ऐप की सेटिंग्स बदल सकती हैं।',
    Community: 'समुदाय स्क्रीन खुली है। यहां आप दूसरी महिलाओं से जुड़ सकती हैं।',
  };
  
  const announcement = announcements[screenName] || `${screenName} स्क्रीन खुली है।`;
  
  await Speech.speak(announcement, {
    language: 'hi-IN',
    rate: settings.speechRate || 0.8,
    pitch: settings.speechPitch || 1.0,
  });
}

// Announce UI elements
export async function announceElement(elementType, elementText, settings) {
  if (!settings[ACCESSIBILITY_FEATURES.SCREEN_READER]) return;
  
  const elementAnnouncements = {
    button: 'बटन',
    text: 'टेक्स्ट',
    heading: 'शीर्षक',
    link: 'लिंक',
    image: 'तस्वीर',
    input: 'इनपुट फील्ड',
  };
  
  const elementLabel = elementAnnouncements[elementType] || '';
  const announcement = `${elementLabel} ${elementText}`;
  
  await Speech.speak(announcement, {
    language: 'hi-IN',
    rate: settings.speechRate || 0.8,
    pitch: settings.speechPitch || 1.0,
  });
}

// Process voice commands
export function processVoiceCommand(transcript, navigation) {
  const normalizedTranscript = transcript.toLowerCase().trim();
  
  for (const [command, action] of Object.entries(VOICE_COMMANDS)) {
    if (normalizedTranscript.includes(command.toLowerCase())) {
      return executeVoiceCommand(action, navigation);
    }
  }
  
  return { success: false, message: 'कमांड समझ नहीं आई।' };
}

// Execute voice command
function executeVoiceCommand(action, navigation) {
  try {
    switch (action.action) {
      case 'navigate':
        if (navigation) {
          navigation.navigate(action.target);
          return { 
            success: true, 
            message: `${action.target} पर जा रहे हैं।`,
            haptic: true 
          };
        }
        break;
        
      case 'help':
        return { 
          success: true, 
          message: 'मदद के लिए आप कह सकती हैं: होम जाओ, कॉल करो, प्रगति देखो।',
          speak: true 
        };
        
      case 'emergency':
        return { 
          success: true, 
          message: 'इमरजेंसी हेल्पलाइन: 1091 महिला हेल्पलाइन, 100 पुलिस।',
          speak: true,
          haptic: true,
          urgent: true 
        };
        
      default:
        return { success: true, message: 'कमांड पूरी हुई।' };
    }
  } catch (error) {
    console.error('Error executing voice command:', error);
    return { success: false, message: 'कमांड में समस्या हुई।' };
  }
  
  return { success: false, message: 'कमांड पूरी नहीं हो सकी।' };
}

// Provide haptic feedback
export async function provideHapticFeedback(type, settings) {
  if (!settings[ACCESSIBILITY_FEATURES.HAPTIC_FEEDBACK]) return;
  
  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    console.error('Error providing haptic feedback:', error);
  }
}

// Get accessible color scheme
export function getAccessibleColors(settings) {
  if (settings[ACCESSIBILITY_FEATURES.HIGH_CONTRAST]) {
    return settings.contrastLevel === 'extra_high' 
      ? HIGH_CONTRAST_COLORS.extraHigh 
      : HIGH_CONTRAST_COLORS.normal;
  }
  return null; // Use default colors
}

// Get accessible text size
export function getAccessibleTextSize(baseSize, settings) {
  const multiplier = TEXT_SIZE_MULTIPLIERS[settings.textSize] || 1.0;
  return Math.round(baseSize * multiplier);
}

// Emergency assistance
export async function triggerEmergencyAssistance() {
  try {
    // Speak emergency information
    const emergencyMessage = `
      इमरजेंसी हेल्प: 
      महिला हेल्पलाइन: 1091
      पुलिस: 100
      एम्बुलेंस: 108
      फायर ब्रिगेड: 101
    `;
    
    await Speech.speak(emergencyMessage, {
      language: 'hi-IN',
      rate: 0.7, // Slower for emergency
      pitch: 1.2, // Higher pitch for urgency
    });
    
    // Provide strong haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    return {
      success: true,
      message: 'इमरजेंसी जानकारी बताई गई है।',
    };
  } catch (error) {
    console.error('Error triggering emergency assistance:', error);
    return {
      success: false,
      error: 'इमरजेंसी सहायता में समस्या हुई।',
    };
  }
}

// Accessibility testing helpers
export function testAccessibilityFeature(feature, settings) {
  const tests = {
    [ACCESSIBILITY_FEATURES.VOICE_NAVIGATION]: () => {
      return Speech.speak('वॉइस नेवीगेशन टेस्ट', { language: 'hi-IN' });
    },
    [ACCESSIBILITY_FEATURES.HAPTIC_FEEDBACK]: () => {
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [ACCESSIBILITY_FEATURES.HIGH_CONTRAST]: () => {
      return Promise.resolve('हाई कंट्रास्ट मोड सक्रिय है।');
    },
    [ACCESSIBILITY_FEATURES.LARGE_TEXT]: () => {
      return Promise.resolve('बड़ा टेक्स्ट मोड सक्रिय है।');
    },
  };
  
  const test = tests[feature];
  if (test && settings[feature]) {
    return test();
  }
  
  return Promise.resolve('फीचर उपलब्ध नहीं है या बंद है।');
}

// Get accessibility recommendations
export function getAccessibilityRecommendations(userProfile) {
  const recommendations = [];
  
  // Age-based recommendations
  if (userProfile?.age && userProfile.age > 45) {
    recommendations.push({
      feature: ACCESSIBILITY_FEATURES.LARGE_TEXT,
      reason: 'बड़ा टेक्स्ट पढ़ने में आसानी के लिए सुझाया गया है।',
      priority: 'medium',
    });
  }
  
  // Usage pattern recommendations
  if (userProfile?.callsCompleted > 10) {
    recommendations.push({
      feature: ACCESSIBILITY_FEATURES.VOICE_COMMANDS,
      reason: 'वॉइस कमांड से ऐप का इस्तेमाल और भी आसान हो जाएगा।',
      priority: 'low',
    });
  }
  
  // Default helpful features
  recommendations.push({
    feature: ACCESSIBILITY_FEATURES.HAPTIC_FEEDBACK,
    reason: 'हैप्टिक फीडबैक से बेहतर अनुभव मिलता है।',
    priority: 'low',
  });
  
  return recommendations;
}
