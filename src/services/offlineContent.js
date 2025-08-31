import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// Offline content management for areas with poor connectivity
export const OFFLINE_STORAGE_KEYS = {
  CONTENT_PACKS: 'offline_content_packs',
  USER_PROGRESS: 'offline_user_progress',
  CONVERSATION_HISTORY: 'offline_conversations',
  ACHIEVEMENTS: 'offline_achievements',
  SETTINGS: 'offline_settings',
};

// Enhanced content packs with offline support
export const ENHANCED_CONTENT_PACKS = [
  {
    id: 'health_hygiene',
    title: 'स्वास्थ्य और स्वच्छता',
    description: 'महावारी, पोषण, गर्भावस्था की देखभाल',
    icon: '🏥',
    color: ['#A67C52', '#B7906F'],
    estimatedDuration: '15-20 मिनट',
    difficulty: 'आसान',
    topics: [
      {
        id: 'periods_basics',
        title: 'महावारी की जानकारी',
        duration: '5 मिनट',
        keyPoints: ['पैड vs कपड़ा', 'सफाई के तरीके', 'मिथकों को तोड़ना'],
      },
      {
        id: 'nutrition_local',
        title: 'स्थानीय खाना और पोषण',
        duration: '5 मिनट',
        keyPoints: ['दाल-चावल का महत्व', 'हरी सब्जियां', 'आयरन के स्रोत'],
      },
      {
        id: 'pregnancy_care',
        title: 'गर्भावस्था की देखभाल',
        duration: '8 मिनट',
        keyPoints: ['डॉक्टर से चेकअप', 'खाने में सावधानी', 'आराम का महत्व'],
      },
    ],
    opening: 'नमस्ते बहन! मैं तुम्हारी दीदी बोल रही हूं। आज हम महावारी के बारे में सीधी बात करेंगे। तैयार हो? बोल दो: हां दीदी।',
    system: 'You are Didi, a warm, supportive female mentor speaking in simple Hindi for rural women learners. Keep responses short (2-3 sentences), empathetic, and actionable. Use examples from local life. Ask small questions to check understanding and offer choices like option 1/2/3.',
    offlineContent: true,
    downloadSize: '2.5 MB',
  },
  {
    id: 'digital_saathi',
    title: 'डिजिटल साथी',
    description: 'UPI, डिजिटल पेमेंट, फ्रॉड से बचाव',
    icon: '📱',
    color: ['#E6D5C3', '#D4C2A8'],
    estimatedDuration: '20-25 मिनट',
    difficulty: 'मध्यम',
    topics: [
      {
        id: 'phone_basics',
        title: 'फोन का बेसिक इस्तेमाल',
        duration: '8 मिनट',
        keyPoints: ['कॉन्टैक्ट सेव करना', 'SMS भेजना', 'कॉल करना'],
      },
      {
        id: 'upi_safety',
        title: 'UPI और सुरक्षित पेमेंट',
        duration: '10 मिनट',
        keyPoints: ['UPI PIN की सुरक्षा', 'QR कोड स्कैन', 'गलत ट्रांजैक्शन'],
      },
      {
        id: 'fraud_prevention',
        title: 'ऑनलाइन फ्रॉड से बचाव',
        duration: '7 मिनट',
        keyPoints: ['फेक कॉल पहचानना', 'OTP शेयर न करना', 'सुरक्षित ऐप्स'],
      },
    ],
    opening: 'नमस्ते! आज हम फोन और UPI के सेफ इस्तेमाल पर बात करेंगे। तैयार हो? बस बोलो: हां दीदी।',
    system: 'You are Didi, a helpful mentor teaching phone basics and safe digital payments in Hindi. Keep it friendly, step-by-step, short replies, and ask tiny questions.',
    offlineContent: true,
    downloadSize: '3.1 MB',
  },
  {
    id: 'rights_safety',
    title: 'अधिकार और सुरक्षा',
    description: 'हेल्पलाइन, सरकारी योजनाएं, कानून',
    icon: '⚖️',
    color: ['#C9AC92', '#A67C52'],
    estimatedDuration: '18-22 मिनट',
    difficulty: 'मध्यम',
    topics: [
      {
        id: 'helplines',
        title: 'जरूरी हेल्पलाइन नंबर',
        duration: '6 मिनट',
        keyPoints: ['1091 महिला हेल्पलाइन', '100 पुलिस', '108 एम्बुलेंस'],
      },
      {
        id: 'govt_schemes',
        title: 'सरकारी योजनाएं',
        duration: '8 मिनट',
        keyPoints: ['उज्ज्वला योजना', 'जन धन खाता', 'आयुष्मान भारत'],
      },
      {
        id: 'legal_rights',
        title: 'कानूनी अधिकार',
        duration: '8 मिनट',
        keyPoints: ['घरेलू हिंसा कानून', 'बाल विवाह रोकथाम', 'संपत्ति के अधिकार'],
      },
    ],
    opening: 'दीदी यहां। आज हम महिला सुरक्षा और हकों पर बात करेंगे। तैयार हो तो बोलो: हां दीदी।',
    system: 'You are a caring mentor in Hindi guiding women on rights, laws, and helplines. Be sensitive and empowering. Keep answers short, practical, and local.',
    offlineContent: true,
    downloadSize: '2.8 MB',
  },
  {
    id: 'self_dev',
    title: 'आत्म विकास',
    description: 'अंग्रेजी शब्द, छोटे बिजनेस टिप्स',
    icon: '🌟',
    color: ['#D4C2A8', '#C2AF8D'],
    estimatedDuration: '15-18 मिनट',
    difficulty: 'आसान',
    topics: [
      {
        id: 'english_daily',
        title: 'रोज़ाना अंग्रेजी',
        duration: '6 मिनट',
        keyPoints: ['दैनिक उपयोग के शब्द', 'सरल वाक्य', 'उच्चारण टिप्स'],
      },
      {
        id: 'micro_business',
        title: 'छोटा धंधा शुरू करना',
        duration: '7 मिनट',
        keyPoints: ['अचार बनाना', 'सिलाई का काम', 'ऑनलाइन बेचना'],
      },
      {
        id: 'confidence_building',
        title: 'आत्मविश्वास बढ़ाना',
        duration: '5 मिनट',
        keyPoints: ['अपनी बात रखना', 'सपने देखना', 'डर को हराना'],
      },
    ],
    opening: 'नमस्ते बहन! दीदी के साथ थोड़ा आत्म-विकास करें। छोटे छोटे टिप्स और अंग्रेजी शब्द सीखेंगे। तैयार? बोलो: हां दीदी।',
    system: 'You are Didi, motivating in Hindi with tiny English learning and micro-business tips. Keep it cheerful and concise.',
    offlineContent: true,
    downloadSize: '2.2 MB',
  },
  {
    id: 'emergency_kit',
    title: 'आपातकालीन किट',
    description: 'जरूरी नंबर, तुरंत मदद',
    icon: '🚨',
    color: ['#C44536', '#D4A574'],
    estimatedDuration: '10 मिनट',
    difficulty: 'जरूरी',
    topics: [
      {
        id: 'emergency_contacts',
        title: 'आपातकालीन संपर्क',
        duration: '5 मिनट',
        keyPoints: ['पुलिस 100', 'फायर 101', 'एम्बुलेंस 108'],
      },
      {
        id: 'first_aid',
        title: 'प्राथमिक चिकित्सा',
        duration: '5 मिनट',
        keyPoints: ['चोट पर पट्टी', 'बुखार में क्या करें', 'सांस की तकलीफ'],
      },
    ],
    opening: 'यह आपातकालीन किट है। जरूरी नंबर और तुरंत मदद के तरीके सीखेंगे।',
    system: 'You are providing emergency information in clear, simple Hindi. Be direct and helpful.',
    offlineContent: true,
    downloadSize: '1.5 MB',
    priority: true,
  },
];

// Offline content management functions
export async function downloadContentPack(packId) {
  try {
    const pack = ENHANCED_CONTENT_PACKS.find(p => p.id === packId);
    if (!pack) throw new Error('Content pack not found');

    // Simulate download process
    const downloadProgress = { current: 0, total: 100 };
    
    // In real implementation, download actual content files
    // For now, we'll store the pack data locally
    await AsyncStorage.setItem(
      `${OFFLINE_STORAGE_KEYS.CONTENT_PACKS}_${packId}`,
      JSON.stringify(pack)
    );

    return { success: true, pack };
  } catch (error) {
    console.error('Error downloading content pack:', error);
    return { success: false, error: error.message };
  }
}

export async function getOfflineContentPack(packId) {
  try {
    const packData = await AsyncStorage.getItem(
      `${OFFLINE_STORAGE_KEYS.CONTENT_PACKS}_${packId}`
    );
    return packData ? JSON.parse(packData) : null;
  } catch (error) {
    console.error('Error getting offline content pack:', error);
    return null;
  }
}

export async function isContentPackDownloaded(packId) {
  const pack = await getOfflineContentPack(packId);
  return !!pack;
}

export async function getDownloadedContentPacks() {
  try {
    const downloadedPacks = [];
    for (const pack of ENHANCED_CONTENT_PACKS) {
      const isDownloaded = await isContentPackDownloaded(pack.id);
      if (isDownloaded) {
        downloadedPacks.push(pack);
      }
    }
    return downloadedPacks;
  } catch (error) {
    console.error('Error getting downloaded content packs:', error);
    return [];
  }
}

export async function deleteContentPack(packId) {
  try {
    await AsyncStorage.removeItem(`${OFFLINE_STORAGE_KEYS.CONTENT_PACKS}_${packId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting content pack:', error);
    return { success: false, error: error.message };
  }
}

export async function getOfflineStorageUsage() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const offlineKeys = keys.filter(key => 
      key.startsWith(OFFLINE_STORAGE_KEYS.CONTENT_PACKS) ||
      key.startsWith(OFFLINE_STORAGE_KEYS.USER_PROGRESS) ||
      key.startsWith(OFFLINE_STORAGE_KEYS.CONVERSATION_HISTORY)
    );

    let totalSize = 0;
    for (const key of offlineKeys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        totalSize += new Blob([data]).size;
      }
    }

    return {
      totalSize,
      formattedSize: formatBytes(totalSize),
      packsCount: offlineKeys.filter(k => k.includes('content_packs')).length,
    };
  } catch (error) {
    console.error('Error calculating offline storage usage:', error);
    return { totalSize: 0, formattedSize: '0 B', packsCount: 0 };
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Sync offline data when connection is available
export async function syncOfflineData() {
  try {
    // Check if online
    // In real implementation, check network connectivity
    const isOnline = true; // Placeholder
    
    if (!isOnline) {
      return { success: false, message: 'No internet connection' };
    }

    // Sync user progress
    const offlineProgress = await AsyncStorage.getItem(OFFLINE_STORAGE_KEYS.USER_PROGRESS);
    if (offlineProgress) {
      // Upload to Firebase
      // Implementation depends on your Firebase structure
    }

    // Sync conversation history
    const offlineConversations = await AsyncStorage.getItem(OFFLINE_STORAGE_KEYS.CONVERSATION_HISTORY);
    if (offlineConversations) {
      // Upload to Firebase
    }

    return { success: true, message: 'Data synced successfully' };
  } catch (error) {
    console.error('Error syncing offline data:', error);
    return { success: false, error: error.message };
  }
}
