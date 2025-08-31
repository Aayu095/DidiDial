 // Multi-Language Support System for Regional Accessibility
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

// Supported languages with regional variations
export const SUPPORTED_LANGUAGES = {
  HINDI: {
    code: 'hi',
    name: 'हिंदी',
    englishName: 'Hindi',
    speechCode: 'hi-IN',
    rtl: false,
    regions: ['UP', 'MP', 'RJ', 'HR', 'DL', 'UK', 'HP', 'JH', 'CG']
  },
  BENGALI: {
    code: 'bn',
    name: 'বাংলা',
    englishName: 'Bengali',
    speechCode: 'bn-IN',
    rtl: false,
    regions: ['WB', 'TR', 'AS']
  },
  MARATHI: {
    code: 'mr',
    name: 'मराठी',
    englishName: 'Marathi',
    speechCode: 'mr-IN',
    rtl: false,
    regions: ['MH', 'GOA']
  },
  TAMIL: {
    code: 'ta',
    name: 'தமிழ்',
    englishName: 'Tamil',
    speechCode: 'ta-IN',
    rtl: false,
    regions: ['TN', 'PY']
  },
  TELUGU: {
    code: 'te',
    name: 'తెలుగు',
    englishName: 'Telugu',
    speechCode: 'te-IN',
    rtl: false,
    regions: ['AP', 'TS']
  },
  GUJARATI: {
    code: 'gu',
    name: 'ગુજરાતી',
    englishName: 'Gujarati',
    speechCode: 'gu-IN',
    rtl: false,
    regions: ['GJ', 'DD', 'DNH']
  },
  PUNJABI: {
    code: 'pa',
    name: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    speechCode: 'pa-IN',
    rtl: false,
    regions: ['PB', 'CH', 'HR']
  },
  KANNADA: {
    code: 'kn',
    name: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    speechCode: 'kn-IN',
    rtl: false,
    regions: ['KA']
  },
  MALAYALAM: {
    code: 'ml',
    name: 'മലയാളം',
    englishName: 'Malayalam',
    speechCode: 'ml-IN',
    rtl: false,
    regions: ['KL', 'LD']
  },
  ODIA: {
    code: 'or',
    name: 'ଓଡ଼ିଆ',
    englishName: 'Odia',
    speechCode: 'or-IN',
    rtl: false,
    regions: ['OR']
  },
  ENGLISH: {
    code: 'en',
    name: 'English',
    englishName: 'English',
    speechCode: 'en-IN',
    rtl: false,
    regions: ['ALL'] // Available everywhere
  }
};

// Translation content for different languages
export const TRANSLATIONS = {
  // Common UI Elements
  common: {
    hi: {
      welcome: 'स्वागत है',
      continue: 'जारी रखें',
      back: 'वापस',
      next: 'अगला',
      finish: 'समाप्त',
      loading: '���ोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      cancel: 'रद्द करें',
      save: 'सेव करें',
      delete: 'डिलीट करें',
      edit: 'संपादित करें',
      share: 'साझा करें',
      help: 'मदद',
      settings: 'सेटिंग्स',
      profile: 'प्रोफाइल',
      logout: 'लॉग आउट'
    },
    bn: {
      welcome: 'স্বাগতম',
      continue: 'চালিয়ে যান',
      back: 'পিছনে',
      next: 'পরবর্তী',
      finish: 'শেষ',
      loading: 'লোড হচ্ছে...',
      error: 'ত্রুটি',
      success: 'সফলতা',
      cancel: 'বাতিল',
      save: 'সেভ করুন',
      delete: 'ডিলিট করুন',
      edit: 'সম্পাদনা',
      share: 'শেয়ার করুন',
      help: 'সাহায্য',
      settings: 'সেটিংস',
      profile: 'প্রোফাইল',
      logout: 'লগ আউট'
    },
    mr: {
      welcome: 'स्वागत आहे',
      continue: 'सुरू ठेवा',
      back: 'मागे',
      next: 'पुढे',
      finish: 'संपूर्ण',
      loading: 'लोड होत आहे...',
      error: 'त्रुटी',
      success: 'यश',
      cancel: 'रद्द करा',
      save: 'सेव्ह करा',
      delete: 'डिलीट करा',
      edit: 'संपादित करा',
      share: 'शेअर करा',
      help: 'मदत',
      settings: 'सेटिंग्ज',
      profile: 'प्रोफाइल',
      logout: 'लॉग आउट'
    },
    en: {
      welcome: 'Welcome',
      continue: 'Continue',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      share: 'Share',
      help: 'Help',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout'
    }
  },
  
  // Educational Content
  education: {
    hi: {
      digitalLiteracy: 'डिजिटल साक्षरता',
      functionalLiteracy: 'कार्यात्मक साक्षरता',
      healthEducation: 'स्वास्थ्य शिक्षा',
      financialLiteracy: 'वित्तीय साक्षरता',
      phoneBasics: 'फोन की बुनियादी बा���ें',
      internetSafety: 'इंटरनेट सुरक्षा',
      digitalPayments: 'डिजिटल भुगतान',
      readingWriting: 'पढ़ना-लिखना',
      basicMath: 'बुनियादी गणित',
      menstrualHealth: 'मासिक धर्म स्वास्थ्य',
      nutrition: 'पोषण',
      bankingBasics: 'बैंकिंग की बुनियादी बातें',
      savingsPlanning: 'बचत योजना'
    },
    bn: {
      digitalLiteracy: 'ডিজিটাল সাক্ষরতা',
      functionalLiteracy: 'কার্যকরী সাক্ষরতা',
      healthEducation: 'স্বাস্থ্য শিক্ষা',
      financialLiteracy: 'আর্থিক সাক্ষরতা',
      phoneBasics: 'ফোনের মৌলিক বিষয়',
      internetSafety: 'ইন্টারনেট নিরাপত্তা',
      digitalPayments: 'ডিজিটাল পেমেন্ট',
      readingWriting: 'পড়া-লেখা',
      basicMath: 'মৌলিক গণিত',
      menstrualHealth: 'মাসিক স্বাস্থ্য',
      nutrition: 'পুষ্টি',
      bankingBasics: 'ব্যাংকিংয়ের মৌলিক বিষয়',
      savingsPlanning: 'সঞ্চয় পরিকল্পনা'
    },
    mr: {
      digitalLiteracy: 'डिजिटल साक्षरता',
      functionalLiteracy: 'कार्यात्मक साक्षरता',
      healthEducation: 'आरोग्य शिक्षण',
      financialLiteracy: 'आर्थिक साक्षरता',
      phoneBasics: 'फोनच्या मूलभूत गोष्टी',
      internetSafety: 'इंटरनेट सुरक्षा',
      digitalPayments: 'डिजिटल पेमेंट',
      readingWriting: 'वाचन-लेखन',
      basicMath: 'मूलभूत गणित',
      menstrualHealth: 'मासिक पाळी आरोग्य',
      nutrition: 'पोषण',
      bankingBasics: 'बँकिंगच्या मूलभूत गोष्टी',
      savingsPlanning: 'बचत योजना'
    },
    en: {
      digitalLiteracy: 'Digital Literacy',
      functionalLiteracy: 'Functional Literacy',
      healthEducation: 'Health Education',
      financialLiteracy: 'Financial Literacy',
      phoneBasics: 'Phone Basics',
      internetSafety: 'Internet Safety',
      digitalPayments: 'Digital Payments',
      readingWriting: 'Reading & Writing',
      basicMath: 'Basic Math',
      menstrualHealth: 'Menstrual Health',
      nutrition: 'Nutrition',
      bankingBasics: 'Banking Basics',
      savingsPlanning: 'Savings Planning'
    }
  },

  // Didi's Responses (Conversational)
  didiResponses: {
    hi: {
      greeting: 'नमस्ते बहन! मैं दीदी हूं। आज हम क्या सीखेंगे?',
      encouragement: 'बहुत अच्छा! आप बहुत अच्छा कर रही हैं।',
      help: 'कोई बात नहीं, मैं आपकी मदद करूंगी। धीरे-धीरे सीखते हैं।',
      completion: 'शाबाश! आपने यह पाठ पूरा कर लिया।',
      nextStep: 'अब हम अगला कदम उठाते हैं।',
      practice: 'चलिए अब अभ्यास करते हैं।',
      question: 'क्या आपका कोई सवाल है?',
      goodbye: 'आज बहुत अच्छा सीखा। कल फिर मिलते हैं!'
    },
    bn: {
      greeting: 'নমস্কার বোন! আমি দিদি। আজ আমরা কী শিখব?',
      encouragement: 'খুব ভালো! আপনি খুব ভালো করছেন।',
      help: '��োনো সমস্যা নেই, আমি আপনাকে সাহায্য করব। ধীরে ধীরে শিখি।',
      completion: 'বাহ! আপনি এই পাঠ শেষ করেছেন।',
      nextStep: 'এখন আমরা পরবর্তী ধাপে যাই।',
      practice: 'চলুন এখন অনুশীলন করি।',
      question: 'আপনার কোনো প্রশ্ন আছে?',
      goodbye: 'আজ খুব ভালো শিখেছেন। কাল আবার দেখা হবে!'
    },
    mr: {
      greeting: 'नमस्कार बहिणी! मी दीदी आहे। आज आपण काय शिकू?',
      encouragement: 'खूप छान! तुम्ही खूप चांगले करत आहात.',
      help: 'काही हरकत नाही, मी तुमची मदत करेन. हळू हळू शिकूया.',
      completion: 'वाह! तुम्ही हा धडा पूर्ण केला.',
      nextStep: 'आता आपण पुढचे पाऊल उचलतो.',
      practice: 'चला आता सराव करूया.',
      question: 'तुमचा काही प्रश्न आहे का?',
      goodbye: 'आज खूप छान शिकलात. उद्या पुन्हा भेटूया!'
    },
    en: {
      greeting: 'Hello sister! I am Didi. What shall we learn today?',
      encouragement: 'Very good! You are doing great.',
      help: 'No problem, I will help you. Let\'s learn step by step.',
      completion: 'Excellent! You have completed this lesson.',
      nextStep: 'Now let\'s take the next step.',
      practice: 'Let\'s practice now.',
      question: 'Do you have any questions?',
      goodbye: 'You learned very well today. See you tomorrow!'
    }
  }
};

// Language Service Class
export class LanguageService {
  constructor() {
    this.currentLanguage = SUPPORTED_LANGUAGES.HINDI;
    this.fallbackLanguage = SUPPORTED_LANGUAGES.ENGLISH;
  }

  async initializeLanguage() {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        const langData = JSON.parse(savedLanguage);
        this.currentLanguage = langData;
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  }

  async setLanguage(languageCode) {
    try {
      const language = Object.values(SUPPORTED_LANGUAGES).find(
        lang => lang.code === languageCode
      );
      
      if (language) {
        this.currentLanguage = language;
        await AsyncStorage.setItem('selectedLanguage', JSON.stringify(language));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting language:', error);
      return false;
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Get translation for a key
  translate(category, key, fallbackText = '') {
    try {
      const categoryTranslations = TRANSLATIONS[category];
      if (!categoryTranslations) return fallbackText || key;

      const languageTranslations = categoryTranslations[this.currentLanguage.code];
      if (!languageTranslations) {
        // Try fallback language
        const fallbackTranslations = categoryTranslations[this.fallbackLanguage.code];
        return fallbackTranslations?.[key] || fallbackText || key;
      }

      return languageTranslations[key] || fallbackText || key;
    } catch (error) {
      console.error('Translation error:', error);
      return fallbackText || key;
    }
  }

  // Get available languages for a region
  getLanguagesForRegion(regionCode) {
    return Object.values(SUPPORTED_LANGUAGES).filter(lang => 
      lang.regions.includes(regionCode) || lang.regions.includes('ALL')
    );
  }

  // Text-to-Speech with current language
  async speak(text, options = {}) {
    try {
      const speechOptions = {
        language: this.currentLanguage.speechCode,
        rate: options.rate || 0.8,
        pitch: options.pitch || 1.0,
        ...options
      };

      await Speech.speak(text, speechOptions);
    } catch (error) {
      console.error('Speech error:', error);
      // Fallback to default language
      await Speech.speak(text, { language: 'en-US', rate: 0.8 });
    }
  }

  // Check if text-to-speech is available for current language
  async isSpeechAvailable() {
    try {
      const availableVoices = await Speech.getAvailableVoicesAsync();
      return availableVoices.some(voice => 
        voice.language.startsWith(this.currentLanguage.code)
      );
    } catch (error) {
      console.error('Error checking speech availability:', error);
      return false;
    }
  }

  // Format numbers according to language/region
  formatNumber(number) {
    try {
      const locale = this.currentLanguage.code === 'hi' ? 'hi-IN' : 
                    this.currentLanguage.code === 'bn' ? 'bn-IN' :
                    this.currentLanguage.code === 'mr' ? 'mr-IN' :
                    'en-IN';
      
      return new Intl.NumberFormat(locale).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  // Format dates according to language/region
  formatDate(date) {
    try {
      const locale = this.currentLanguage.code === 'hi' ? 'hi-IN' : 
                    this.currentLanguage.code === 'bn' ? 'bn-IN' :
                    this.currentLanguage.code === 'mr' ? 'mr-IN' :
                    'en-IN';
      
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return date.toLocaleDateString();
    }
  }

  // Get culturally appropriate greetings
  getGreeting() {
    const hour = new Date().getHours();
    const greetings = {
      hi: {
        morning: 'सुप्रभात',
        afternoon: 'नमस्ते',
        evening: 'शुभ संध्या',
        night: 'शुभ रात्रि'
      },
      bn: {
        morning: 'সুপ্রভাত',
        afternoon: 'নমস্কার',
        evening: 'শুভ সন্ধ্যা',
        night: 'শুভ রাত্রি'
      },
      mr: {
        morning: 'सुप्रभात',
        afternoon: 'नमस्कार',
        evening: 'शुभ संध्या',
        night: 'शुभ रात्री'
      },
      en: {
        morning: 'Good Morning',
        afternoon: 'Good Afternoon',
        evening: 'Good Evening',
        night: 'Good Night'
      }
    };

    const langGreetings = greetings[this.currentLanguage.code] || greetings.en;
    
    if (hour < 12) return langGreetings.morning;
    if (hour < 17) return langGreetings.afternoon;
    if (hour < 21) return langGreetings.evening;
    return langGreetings.night;
  }

  // Get culturally appropriate motivational messages
  getMotivationalMessage() {
    const messages = {
      hi: [
        'आप बहुत अच्छा कर रही हैं! 🌟',
        'सीखते रहें, आगे बढ़ते रहें! 🚀',
        'आपकी मेहनत रंग लाएगी! 💪',
        'ज्ञान ही शक्ति है! 📚',
        'हर दिन कुछ नया सीखें! ✨'
      ],
      bn: [
        'আপনি খুব ভালো করছেন! 🌟',
        'শিখতে থাকুন, এগিয়ে চলুন! 🚀',
        'আপনার পরিশ্রম ফল দেবে! 💪',
        'জ্ঞানই শক্তি! 📚',
        'প্রতিদিন নতুন কিছু শিখুন! ✨'
      ],
      mr: [
        'तुम्ही खूप छान करत आहात! 🌟',
        'शिकत राहा, पुढे जात राहा! 🚀',
        'तुमची मेहनत रंग आणेल! 💪',
        'ज्ञानच शक्���ी आहे! 📚',
        'दररोज काहीतरी नवीन शिका! ✨'
      ],
      en: [
        'You are doing great! 🌟',
        'Keep learning, keep growing! 🚀',
        'Your hard work will pay off! 💪',
        'Knowledge is power! 📚',
        'Learn something new every day! ✨'
      ]
    };

    const langMessages = messages[this.currentLanguage.code] || messages.en;
    return langMessages[Math.floor(Math.random() * langMessages.length)];
  }
}

// Regional content adaptation
export function adaptContentForRegion(content, regionCode, languageCode) {
  const adaptedContent = { ...content };
  
  // Regional examples and contexts
  const regionalAdaptations = {
    'WB': { // West Bengal
      currency: 'টাকা',
      localExamples: ['কলকাতা', 'দুর্গাপূজা', 'মাছ-ভাত'],
      culturalContext: 'bengali'
    },
    'MH': { // Maharashtra
      currency: 'रुपये',
      localExamples: ['मुंबई', 'गणेश उत्सव', 'वडा पाव'],
      culturalContext: 'marathi'
    },
    'UP': { // Uttar Pradesh
      currency: 'रुपये',
      localExamples: ['लखनऊ', 'होली', 'आलू पराठा'],
      culturalContext: 'hindi'
    }
    // Add more regions as needed
  };

  const regionData = regionalAdaptations[regionCode];
  if (regionData) {
    adaptedContent.localExamples = regionData.localExamples;
    adaptedContent.culturalContext = regionData.culturalContext;
    adaptedContent.currency = regionData.currency;
  }

  return adaptedContent;
}

// Export singleton instance
export const languageService = new LanguageService();