import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

// Hackathon Demo STT - Real-time voice interaction
export const STT_PROVIDERS = {
  DEMO: 'demo', // Interactive demo for judges
  MOCK: 'mock', // Fallback responses
};

// Language codes for Indian languages
export const SUPPORTED_LANGUAGES = {
  'hi-IN': { name: 'हिंदी', code: 'hi-IN', provider: 'demo' },
  'en-IN': { name: 'English (India)', code: 'en-IN', provider: 'demo' },
  'bn-IN': { name: 'বাংলা', code: 'bn-IN', provider: 'demo' },
  'ta-IN': { name: 'தமிழ்', code: 'ta-IN', provider: 'demo' },
  'te-IN': { name: 'తెలుగు', code: 'te-IN', provider: 'demo' },
  'mr-IN': { name: 'मराठी', code: 'mr-IN', provider: 'demo' },
  'gu-IN': { name: 'ગુજરાતી', code: 'gu-IN', provider: 'demo' },
  'kn-IN': { name: 'ಕನ್ನಡ', code: 'kn-IN', provider: 'demo' },
  'ml-IN': { name: 'മലയാളം', code: 'ml-IN', provider: 'demo' },
  'pa-IN': { name: 'ਪੰਜਾਬੀ', code: 'pa-IN', provider: 'demo' },
};

// Hackathon Demo - Interactive Voice Responses
const DEMO_RESPONSES = {
  greeting: [
    'नमस्ते दीदी! मैं आपकी मदद के लिए यहां हूं',
    'हैलो! आज कैसे मदद कर सकती हूं?',
    'नमस्कार! क्या जानना चाहती हैं?',
    'हाय दीदी! बताइए क्या चाहिए',
  ],
  health: [
    'स्वास्थ्य के बारे में पूछना चाहती हूं',
    'डॉक्टर से कब मिलना चाहिए?',
    'दवाई कैसे लेनी चाहिए?',
    'बच्चों का टीकाकरण कराना है',
  ],
  education: [
    'बच्चों की पढ़ाई के बारे में बताइए',
    'स्कूल में एडमिशन कैसे कराएं?',
    'ऑनलाइन क्लास कैसे जॉइन करें?',
    'छात्रवृत्ति के लिए अप्लाई कैसे करें?',
  ],
  finance: [
    'पैसे कैसे बचाकर रखें?',
    'बैंक अकाउंट कैसे खोलें?',
    'UPI पेमेंट कैसे करते हैं?',
    'लोन के लिए कहां जाना चाहिए?',
  ],
  rights: [
    'महिला अधिकार क्या हैं?',
    'कानूनी मदद कहां मिलेगी?',
    'पुलिस कंप्लेंट कैसे करें?',
    'हेल्पलाइन नंबर क्या है?',
  ],
  technology: [
    'मोबाइल कैसे चलाते हैं?',
    'WhatsApp कैसे इस्तेमाल करें?',
    'ऑनलाइन फॉर्म कैसे भरें?',
    'डिजिटल पेमेंट कैसे करें?',
  ]
};

// Mock STT responses for different contexts
const MOCK_RESPONSES = {
  greeting: [
    'हां दीदी, मुझे समझ आया',
    'जी हां, बताइए',
    'नमस्ते दीदी',
    'मैं तैयार हूं',
  ],
  agreement: [
    'ठीक है दीदी',
    'हां, यह सही है',
    'मैं समझ गई',
    'जी बिल्कुल',
  ],
  question: [
    'और क्या करना चाहिए?',
    'यह कैसे करते हैं?',
    'मुझे और बताइए',
    'क्या यह सुरक्षित है?',
  ],
  thanks: [
    'धन्यवाद दीदी',
    'बहुत अच्छी जानकारी है',
    'यह बहुत उपयोगी है',
    'आपका बहुत शुक्रिया',
  ],
  health: [
    'मुझे पेट में दर्द होता है',
    'महावारी के समय क्या करना चाहिए?',
    'गर्भावस्था में कैसे खाना चाहिए?',
    'डॉक्टर के पास कब जाना चाहिए?',
  ],
  digital: [
    'UPI कैसे इस्तेमाल करते हैं?',
    'फोन में पैसे कैसे भेजें?',
    'फ्रॉड से कैसे बचें?',
    'WhatsApp पर बिजनेस कैसे करें?',
  ],
  rights: [
    'महिला हेल्पलाइन नंबर क्या है?',
    'घरेलू हिंसा के लिए क्या करें?',
    'सरकारी योजना कैसे मिलती है?',
    'पुलिस में शिकायत कैसे करें?',
  ],
};

// Convert audio to base64 for API calls
async function audioToBase64(uri) {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting audio to base64:', error);
    throw error;
  }
}


// Demo STT - Interactive Voice Chat
async function demoSTT(audioUri, language = 'hi-IN', context = 'general') {
  try {
    console.log('🎤 Processing voice input for demo...');
    
    // Simulate realistic processing time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    // Get contextual responses based on conversation flow
    const contextResponses = DEMO_RESPONSES[context] || DEMO_RESPONSES.greeting;
    const randomResponse = contextResponses[Math.floor(Math.random() * contextResponses.length)];
    
    // Add some variety with mixed responses
    const allResponses = [
      ...DEMO_RESPONSES.greeting,
      ...DEMO_RESPONSES.health,
      ...DEMO_RESPONSES.education,
      ...DEMO_RESPONSES.finance,
      ...DEMO_RESPONSES.rights,
      ...DEMO_RESPONSES.technology
    ];
    
    // 70% chance of contextual response, 30% chance of random topic
    const finalResponse = Math.random() < 0.7 ? 
      randomResponse : 
      allResponses[Math.floor(Math.random() * allResponses.length)];
    
    return {
      success: true,
      text: finalResponse,
      confidence: 0.88 + Math.random() * 0.1,
      language: language,
      provider: 'demo',
      isDemo: true,
      context: context,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Demo STT error:', error);
    return {
      success: false,
      error: error.message,
      text: '',
    };
  }
}


// Mock STT for development and demo
function mockSTT(audioUri, language = 'hi-IN', context = 'general') {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      let responses = MOCK_RESPONSES.greeting;
      
      // Choose responses based on context
      if (context.includes('health')) {
        responses = MOCK_RESPONSES.health;
      } else if (context.includes('digital')) {
        responses = MOCK_RESPONSES.digital;
      } else if (context.includes('rights')) {
        responses = MOCK_RESPONSES.rights;
      } else {
        // Mix different types of responses
        const allResponses = [
          ...MOCK_RESPONSES.greeting,
          ...MOCK_RESPONSES.agreement,
          ...MOCK_RESPONSES.question,
          ...MOCK_RESPONSES.thanks,
        ];
        responses = allResponses;
      }
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      resolve({
        success: true,
        text: randomResponse,
        confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
        language: language,
        provider: 'mock',
      });
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  });
}

// Main STT function with fallback providers
export async function speechToText(audioUri, options = {}) {
  const {
    language = 'hi-IN',
    provider = STT_PROVIDERS.DEMO, // Default to Demo
    context = 'general',
    maxRetries = 2,
  } = options;

  let lastError = null;
  
  // Try primary provider
  try {
    let result;
    
    switch (provider) {
      case STT_PROVIDERS.DEMO:
        result = await demoSTT(audioUri, language, context);
        break;
      case STT_PROVIDERS.MOCK:
      default:
        result = await mockSTT(audioUri, language, context);
        break;
    }
    
    if (result.success) {
      return result;
    } else {
      lastError = result.error;
    }
  } catch (error) {
    lastError = error.message;
  }
  
  // Fallback to mock if primary provider fails
  if (provider !== STT_PROVIDERS.MOCK) {
    console.warn(`Primary STT provider failed, falling back to mock: ${lastError}`);
    try {
      return await mockSTT(audioUri, language, context);
    } catch (fallbackError) {
      console.error('Fallback STT also failed:', fallbackError);
    }
  }
  
  // If all fails, return error
  return {
    success: false,
    error: lastError || 'Speech recognition failed',
    text: '',
  };
}

// Utility function to detect language from audio (mock implementation)
export function detectLanguage(audioUri) {
  // In real implementation, this would use language detection APIs
  // For now, return most common language
  return Promise.resolve({
    language: 'hi-IN',
    confidence: 0.8,
  });
}

// Get available languages for current user location
export function getAvailableLanguages() {
  return Object.values(SUPPORTED_LANGUAGES);
}

// Validate if language is supported
export function isLanguageSupported(languageCode) {
  return languageCode in SUPPORTED_LANGUAGES;
}

// Get language display name
export function getLanguageName(languageCode) {
  return SUPPORTED_LANGUAGES[languageCode]?.name || languageCode;
}
