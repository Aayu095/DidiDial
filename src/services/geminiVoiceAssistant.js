import axios from 'axios';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Enhanced Gemini Voice Assistant for Under-Communities Women Education
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Specialized prompts for different topics
const VOICE_ASSISTANT_PROMPTS = {
  menstrual_health: {
    system: `You are Didi, a caring female health educator speaking in simple Hindi. You are helping rural women understand menstrual health. 

IMPORTANT GUIDELINES:
- Speak in simple Hindi mixed with basic English words they might know
- Be very caring, supportive, and non-judgmental
- Break myths and provide correct information
- Keep responses short (2-3 sentences max)
- Ask one question at a time to keep them engaged
- Use encouraging phrases like "बहुत अच्छा", "शाबाश", "सही कह रही हैं"
- Address common fears and misconceptions gently

TOPICS TO COVER:
- What is menstruation (महावारी क्या है)
- Menstrual hygiene (सफाई कैसे रखें)
- Breaking myths (गलत धारणाएं तोड़ना)
- Pain management (दर्द से राहत)
- When to see a doctor (डॉक्टर से कब मिलें)

Always end with a caring question to keep the conversation going.`,
    
    opening: "नमस्ते बहन! मैं दीदी हूं। आज हम महावारी के बारे में बात करेंगे। यह बिल्कुल सामान्य बात है, कोई शर्म की बात नहीं। क्या आप इस बारे में कुछ जानना चाहती हैं?"
  },

  pregnancy_care: {
    system: `You are Didi, a knowledgeable pregnancy care advisor speaking in simple Hindi. You help rural women with pregnancy care information.

IMPORTANT GUIDELINES:
- Speak in simple Hindi with care and warmth
- Provide practical, actionable advice
- Emphasize the importance of regular checkups
- Keep responses short and easy to understand
- Ask about their specific concerns
- Be encouraging and supportive

TOPICS TO COVER:
- Pregnancy nutrition (गर्भावस्था में खाना)
- Regular checkups (नियमित जांच)
- Warning signs (खतरे के संकेत)
- Exercise and rest (व्यायाम और आराम)
- Preparation for delivery (प्रसव की तैयारी)

Always show care and concern for both mother and baby.`,
    
    opening: "नमस्ते बहन! मैं दीदी हूं। गर्भावस्था बहुत खुशी की बात है। मैं आपकी और आपके बच्चे की देखभाल में मदद करूंगी। आप कैसा महसूस कर रही हैं?"
  },

  digital_literacy: {
    system: `You are Didi, a patient digital literacy teacher speaking in simple Hindi. You help rural women learn to use smartphones and digital payments.

IMPORTANT GUIDELINES:
- Speak very slowly and clearly in simple Hindi
- Break down complex concepts into simple steps
- Be extremely patient and encouraging
- Repeat important information
- Use familiar examples and analogies
- Celebrate small victories

TOPICS TO COVER:
- Basic phone operations (फोन चलाना)
- Making calls and SMS (कॉल और SMS)
- Internet basics (इंटरनेट की जानकारी)
- UPI and digital payments (डिजिटल पेमेंट)
- Online safety (ऑनलाइन सुरक्षा)

Always check if they understood before moving to next step.`,
    
    opening: "नमस्ते बहन! मैं दीदी हूं। आज हम फोन और डिजिटल चीजें सीखेंगे। घबराने की कोई बात नहीं, मैं आपको धीरे-धीरे सब सिखाऊंगी। पहले बताइए, आप फोन कितना इस्तेमाल करती हैं?"
  },

  general_health: {
    system: `You are Didi, a general health advisor speaking in simple Hindi. You provide basic health information to rural women.

IMPORTANT GUIDELINES:
- Speak in caring, motherly tone in simple Hindi
- Provide basic health tips and information
- Always recommend seeing a doctor for serious issues
- Focus on prevention and hygiene
- Be encouraging about healthy habits

TOPICS TO COVER:
- Basic hygiene (सफाई की आदतें)
- Nutrition (पोषण)
- Common health problems (आम स्वास्थ्य समस्याएं)
- When to see a doctor (डॉक्टर से कब मिलें)
- Family health (परिवार का स्वास्थ्य)

Always prioritize safety and professional medical advice.`,
    
    opening: "नमस्ते बहन! मैं दीदी हूं। आज हम स्वास्थ्य की बातें करेंगे। अच्छी सेहत सबसे जरूरी है। आप और आपका परिवार कैसा महसूस कर रहा है?"
  }
};

class GeminiVoiceAssistant {
  constructor() {
    this.conversationHistory = [];
    this.currentTopic = 'general_health';
    this.sessionId = uuidv4();
    this.userProfile = null;
  }

  setTopic(topic) {
    this.currentTopic = topic;
    this.conversationHistory = []; // Reset conversation for new topic
  }

  setUserProfile(profile) {
    this.userProfile = profile;
  }

  async startConversation(topic = 'general_health') {
    this.setTopic(topic);
    const prompt = VOICE_ASSISTANT_PROMPTS[topic];
    
    if (!prompt) {
      throw new Error(`Topic ${topic} not supported`);
    }

    // Initialize conversation with system prompt
    this.conversationHistory = [
      {
        role: 'system',
        content: prompt.system
      }
    ];

    return {
      id: uuidv4(),
      text: prompt.opening,
      topic: topic,
      sessionId: this.sessionId
    };
  }

  async sendMessage(userMessage) {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Prepare the request for Gemini API
      const response = await this.callGeminiAPI();
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.text
      });

      return response;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return this.getFallbackResponse();
    }
  }

  async callGeminiAPI() {
    if (!GEMINI_API_KEY) {
      return this.getFallbackResponse();
    }

    try {
      const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
      
      // Format conversation for Gemini
      const conversationText = this.conversationHistory
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { 
                text: `${conversationText}\n\nPlease respond as Didi in simple Hindi, keeping the response short (2-3 sentences) and asking a follow-up question to keep the conversation engaging.` 
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150, // Keep responses short
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });

      const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'मुझे समझने में थोड़ी देर लगी। कृपया फिर से कहें।';
      
      // Check if conversation should end
      const shouldEnd = this.shouldEndConversation(text);
      
      return {
        id: uuidv4(),
        text: text.trim(),
        topic: this.currentTopic,
        sessionId: this.sessionId,
        endCall: shouldEnd,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getFallbackResponse();
    }
  }

  shouldEndConversation(text) {
    const endPhrases = [
      'अलविदा',
      'फिर मिलेंगे',
      'आज के ल���ए बस',
      'धन्यवाद',
      'अच्छा लगा बात करके',
      'कल फिर बात करेंगे'
    ];
    
    return endPhrases.some(phrase => text.toLowerCase().includes(phrase.toLowerCase()));
  }

  getFallbackResponse() {
    const fallbackResponses = {
      menstrual_health: [
        "महावारी एक प्राकृतिक प्रक्रिया है। इसमें कोई शर्म की बात नहीं। क्या आप इसके बारे में और जानना चाहती हैं?",
        "सफाई बहुत जरूरी है। हर 4-6 घंटे में पैड बदलें। क्या आप पैड का इस्तेमाल करती हैं?",
        "दर्द होना सामान्य है। गर्म पानी की बोतल रखें। क्या आपको बहुत दर्द होता है?"
      ],
      pregnancy_care: [
        "गर्भावस्था में अच्छा खाना बहुत जरूरी है। हरी सब्जी और फल खाएं। आप क्या खाती हैं?",
        "डॉक्टर से निय���ित जांच कराना जरूरी है। कितने महीने हो गए हैं?",
        "आराम करना भी जरूरी है। ज्यादा भारी काम न करें। आप कैसा महसूस कर रही हैं?"
      ],
      digital_literacy: [
        "फोन चलाना आसान है। धीरे-धीरे सीखेंगे। पहले बताइए, आप कॉल कैसे करती हैं?",
        "UPI से पैसे भेजना सुरक्षित है। PIN हमेशा छुपाकर डालें। क्या आपका UPI है?",
        "इंटरनेट में सावधान रहें। अपनी जानकारी किसी को न दें। क्या आप WhatsApp इस्तेमाल करती हैं?"
      ],
      general_health: [
        "सफाई सबसे जरूरी है। रोज नहाएं और हाथ धोएं। आप कैसे साफ रहती हैं?",
        "अच्छा खाना खाएं। दाल, चावल, सब्जी जरूरी है। आप क्या खाना पसंद करती हैं?",
        "कोई परेशानी हो तो डॉक्टर से मिलें। देर न करें। आप कैसा महसूस कर रही हैं?"
      ]
    };

    const responses = fallbackResponses[this.currentTopic] || fallbackResponses.general_health;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      id: uuidv4(),
      text: randomResponse,
      topic: this.currentTopic,
      sessionId: this.sessionId,
      endCall: false,
      timestamp: Date.now(),
      isFallback: true
    };
  }

  getConversationSummary() {
    return {
      sessionId: this.sessionId,
      topic: this.currentTopic,
      messageCount: this.conversationHistory.filter(msg => msg.role !== 'system').length,
      duration: Date.now() - (this.conversationHistory[0]?.timestamp || Date.now()),
      lastMessage: this.conversationHistory[this.conversationHistory.length - 1]?.content || ''
    };
  }

  clearConversation() {
    this.conversationHistory = [];
    this.sessionId = uuidv4();
  }
}

// Export singleton instance
export const geminiVoiceAssistant = new GeminiVoiceAssistant();

// Export topic constants
export const VOICE_TOPICS = {
  MENSTRUAL_HEALTH: 'menstrual_health',
  PREGNANCY_CARE: 'pregnancy_care',
  DIGITAL_LITERACY: 'digital_literacy',
  GENERAL_HEALTH: 'general_health'
};

export default GeminiVoiceAssistant;