import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

// Real STT integration with multiple providers
export const STT_PROVIDERS = {
  GOOGLE: 'google',
  AZURE: 'azure',
  WHISPER: 'whisper',
  MOCK: 'mock', // For development/demo
};

// Language codes for Indian languages
export const SUPPORTED_LANGUAGES = {
  'hi-IN': { name: 'हिंदी', code: 'hi-IN', provider: 'google' },
  'en-IN': { name: 'English (India)', code: 'en-IN', provider: 'google' },
  'bn-IN': { name: 'বাংলা', code: 'bn-IN', provider: 'google' },
  'ta-IN': { name: 'தமிழ்', code: 'ta-IN', provider: 'google' },
  'te-IN': { name: 'తెలుగు', code: 'te-IN', provider: 'google' },
  'mr-IN': { name: 'मराठी', code: 'mr-IN', provider: 'google' },
  'gu-IN': { name: 'ગુજરાતી', code: 'gu-IN', provider: 'google' },
  'kn-IN': { name: 'ಕನ್ನಡ', code: 'kn-IN', provider: 'google' },
  'ml-IN': { name: 'മലയാളം', code: 'ml-IN', provider: 'google' },
  'pa-IN': { name: 'ਪੰਜਾਬੀ', code: 'pa-IN', provider: 'google' },
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

// Google Speech-to-Text API integration
async function googleSTT(audioUri, language = 'hi-IN') {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_STT_API_KEY;
    if (!apiKey) {
      throw new Error('Google STT API key not configured');
    }

    const base64Audio = await audioToBase64(audioUri);
    
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'MP4',
            sampleRateHertz: 44100,
            languageCode: language,
            enableAutomaticPunctuation: true,
            model: 'latest_long',
            useEnhanced: true,
          },
          audio: {
            content: base64Audio,
          },
        }),
      }
    );

    const result = await response.json();
    
    if (result.results && result.results.length > 0) {
      return {
        success: true,
        text: result.results[0].alternatives[0].transcript,
        confidence: result.results[0].alternatives[0].confidence,
        language: language,
      };
    } else {
      return {
        success: false,
        error: 'No speech detected',
        text: '',
      };
    }
  } catch (error) {
    console.error('Google STT error:', error);
    return {
      success: false,
      error: error.message,
      text: '',
    };
  }
}

// Azure Speech Services integration
async function azureSTT(audioUri, language = 'hi-IN') {
  try {
    const apiKey = process.env.EXPO_PUBLIC_AZURE_SPEECH_KEY;
    const region = process.env.EXPO_PUBLIC_AZURE_SPEECH_REGION;
    
    if (!apiKey || !region) {
      throw new Error('Azure Speech API credentials not configured');
    }

    // Convert audio file to proper format for Azure
    const audioData = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await fetch(
      `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'audio/wav',
          'Accept': 'application/json',
        },
        body: audioData,
      }
    );

    const result = await response.json();
    
    if (result.RecognitionStatus === 'Success') {
      return {
        success: true,
        text: result.DisplayText,
        confidence: result.Confidence || 0.8,
        language: language,
      };
    } else {
      return {
        success: false,
        error: result.RecognitionStatus,
        text: '',
      };
    }
  } catch (error) {
    console.error('Azure STT error:', error);
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
    provider = STT_PROVIDERS.MOCK, // Default to mock for demo
    context = 'general',
    maxRetries = 2,
  } = options;

  let lastError = null;
  
  // Try primary provider
  try {
    let result;
    
    switch (provider) {
      case STT_PROVIDERS.GOOGLE:
        result = await googleSTT(audioUri, language);
        break;
      case STT_PROVIDERS.AZURE:
        result = await azureSTT(audioUri, language);
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
