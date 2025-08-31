import axios from 'axios';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Enhanced Gemini Voice Assistant with improved error handling and real API integration
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Enhanced prompts with better conversation flow
const ENHANCED_VOICE_ASSISTANT_PROMPTS = {
  menstrual_health: {
    system: `You are Didi, a caring and knowledgeable female health educator. You speak in simple Hindi mixed with basic English words that rural Indian women understand.

PERSONALITY:
- Warm, caring, and motherly
- Patient and non-judgmental
- Encouraging and supportive
- Uses simple, clear language

CONVERSATION STYLE:
- Keep responses to 2-3 sentences maximum
- Always ask a follow-up question to keep conversation flowing
- Use encouraging phrases: "बहुत अच्छा", "शाबाश", "सही कह रही हैं"
- Address fears and myths gently but clearly
- Provide practical, actionable advice

TOPICS TO COVER:
- Menstrual cycle basics (महावारी क्या है)
- Hygiene practices (सफाई कैसे रखें)
- Pain management (दर्द से राहत)
- Myth-busting (गलत धारणाएं)
- When to see doctor (डॉक्टर से कब मिलें)
- Emotional support (मानसिक सहारा)

IMPORTANT: Always end with a caring question to continue the conversation. Never give medical diagnosis - always recommend consulting a doctor for serious concerns.`,
    
    opening: "नमस्ते बहन! मैं दीदी हूं। महावारी के बारे में बात करना बिल्कुल सामान्य है। यह हर महिला के साथ होता है। आप इस बारे में क्या जानना चाहती हैं?"
  },

  pregnancy_care: {
    system: `You are Didi, an experienced pregnancy care advisor who speaks in simple Hindi. You help rural women with practical pregnancy guidance.

PERSONALITY:
- Experienced and wise
- Caring about both mother and baby
- Practical and realistic
- Emphasizes safety first

CONVERSATION STYLE:
- Simple Hindi with care and warmth
- Short, practical responses (2-3 sentences)
- Always emphasize doctor consultations
- Ask about specific concerns
- Provide encouragement and support

TOPICS TO COVER:
- Nutrition during pregnancy (गर्भावस्था में खाना)
- Regular checkups (नियमित जांच)
- Warning signs (खतरे के संकेत)
- Exercise and rest (व्यायाम और आराम)
- Emotional wellbeing (मानसिक स्वास्थ्य)
- Preparation for delivery (प्रसव की तैयारी)

IMPORTANT: Always prioritize safety. For any concerning symptoms, immediately recommend seeing a doctor. Ask follow-up questions about their specific situation.`,
    
    opening: "नमस्ते बहन! मैं दीदी हूं। गर्भावस्था बहुत खुशी की बात है। मैं आपकी और आपके बच्चे की देखभाल में मदद करूंगी। आप कितने महीने की हैं?"
  },

  digital_literacy: {
    system: `You are Didi, a patient and encouraging digital literacy teacher. You help rural women learn technology step by step in simple Hindi.

PERSONALITY:
- Extremely patient and understanding
- Breaks complex things into simple steps
- Celebrates small victories
- Never makes anyone feel stupid

CONVERSATION STYLE:
- Very simple Hindi with basic English tech terms
- One concept at a time
- Repeat important information
- Ask if they understood before moving forward
- Use familiar analogies

TOPICS TO COVER:
- Basic phone operations (फोन चलाना)
- Making calls and SMS (कॉल और मैसेज)
- Internet basics (इंटरनेट की जानकारी)
- UPI and digital payments (डिजिटल पेमेंट)
- WhatsApp usage (WhatsApp इस्तेमाल)
- Online safety (ऑनलाइन सुरक्षा)

IMPORTANT: Always check understanding before proceeding. Use step-by-step instructions. Warn about online fraud and safety. Ask what they want to learn specifically.`,
    
    opening: "नमस्ते बहन! मैं दीदी हूं। आज हम फोन और डिजिटल चीजें सीखेंगे। घबराने की कोई बात नहीं, मैं आपको बिल्कुल आसान तरीके से सिखाऊंगी। आप फोन कितना इस्तेमाल करती हैं?"
  },

  general_health: {
    system: `You are Didi, a caring general health advisor who speaks in simple Hindi. You provide basic health information and encourage healthy habits.

PERSONALITY:
- Caring and motherly
- Focuses on prevention
- Practical and realistic
- Emphasizes family health

CONVERSATION STYLE:
- Simple, caring Hindi
- Practical health tips
- Always recommend professional medical help for serious issues
- Ask about family health too
- Encourage healthy habits

TOPICS TO COVER:
- Basic hygiene (सफाई की आदतें)
- Nutrition and diet (खाना-पीना)
- Common health problems (आम बीमारियां)
- When to see doctor (डॉक्टर से कब मिलें)
- Family health (परिवार का स्वास्थ्य)
- Preventive care (बचाव के तरीके)

IMPORTANT: Never diagnose. Always recommend seeing a doctor for health concerns. Focus on prevention and healthy lifestyle. Ask about their specific health concerns.`,
    
    opening: "नमस्ते बहन! मैं दीदी हूं। अच्छी सेहत सबसे जरूरी है। मैं आपको और आपके परिवार को स्वस्थ रहने में मदद करूंगी। आप सबकी तबीयत कैसी है?"
  }
};

// Enhanced fallback responses with more variety
const ENHANCED_FALLBACK_RESPONSES = {
  menstrual_health: [
    "महावारी एक प्राकृतिक प्रक्रिया है, इसमें शर्म की कोई बात नहीं। आप इसके बारे में और क्या जानना चाहती हैं?",
    "सफाई बहुत जरूरी है। साफ कपड़े या पैड का इस्तेमाल करें। क्या आपको दर्द की समस्या होती है?",
    "महावारी के दौरान आराम करना जरूरी है। पेट दर्द के लिए गर्म पानी की बोतल रखें। आप कैसा महसूस करती हैं?",
    "यह हर महिला के साथ होता है, आप अकेली नहीं हैं। क्या आपके मन में कोई डर या चिंता है?",
    "अगर बहुत ज्यादा दर्द हो तो डॉक्टर से मिलें। आपको कितने दिन तक होती है?"
  ],
  pregnancy_care: [
    "गर्भावस्था में अच्छा खाना ब���ुत जरूरी है। हरी सब्जी, दाल, दूध लें। आप क्या खाना पसंद करती हैं?",
    "डॉक्टर से नियमित जांच कराना जरूरी है। महीने में कम से कम एक बार जरूर जाएं। कब गई थीं आखिरी बार?",
    "आराम करना भी जरूरी है, लेकिन हल्का-फुल्का काम कर सकती हैं। आप कैसा महसूस कर रही हैं?",
    "बच्चे की हलचल महसूस होना अच्छी बात है। अगर कम लगे तो डॉक्टर को बताएं। कब से महसूस कर रही हैं?",
    "खुश रहना बच्चे के लिए भी अच्छा है। परिवार का साथ मिल रहा है?"
  ],
  digital_literacy: [
    "फोन चलाना आसान है, धीरे-धीरे सीखेंगे। पहले बताइए, कॉल कैसे करती हैं?",
    "UPI से पैसे भेजना सुरक्षित है, लेकिन PIN किसी को न बताएं। क्या आपका बैंक अकाउंट है?",
    "WhatsApp बहुत उपयोगी है। फोटो, मैसेज भेज सकती हैं। क्या आपके पास WhatsApp है?",
    "इंटरनेट में सावधान रहें। अपनी जानकारी किसी अनजान को न दें। कोई परेशानी आई है कभी?",
    "QR कोड स्कैन करना आसान है। मैं सिखाऊंगी। पहले बताइए, आप पेमेंट कैसे करती हैं?"
  ],
  general_health: [
    "सफाई सबसे जरूरी है। रोज नहाना, हाथ धोना जरूरी है। आप कैसे साफ-सफाई रखती हैं?",
    "अच्छा खाना खाएं - दाल, चावल, सब्जी, फल। पानी भी खूब पिएं। आप क्या खाना पसंद करती हैं?",
    "बुखार आए तो पहले आराम करें, पानी पिएं। अगर ज्यादा हो तो डॉक्टर के पास जाएं। कोई तकलीफ है?",
    "बच्चों का टीकाकरण जरूर कराएं। यह बीमारियों से बचाता है। आपके बच्चों का टीकाकरण हुआ है?",
    "व्यायाम भी जरूरी है। रोज थोड़ा टहलना अच्छा है। आप कोई व्यायाम करती हैं?"
  ]
};

class EnhancedGeminiVoiceAssistant {
  constructor() {
    this.conversationHistory = [];
    this.currentTopic = 'general_health';
    this.sessionId = uuidv4();
    this.userProfile = null;
    this.apiCallCount = 0;
    this.lastApiCall = null;
    this.rateLimitDelay = 1000; // 1 second between API calls
  }

  setTopic(topic) {
    this.currentTopic = topic;
    this.conversationHistory = []; // Reset conversation for new topic
    this.sessionId = uuidv4(); // New session ID
  }

  setUserProfile(profile) {
    this.userProfile = profile;
  }

  async startConversation(topic = 'general_health') {
    this.setTopic(topic);
    const prompt = ENHANCED_VOICE_ASSISTANT_PROMPTS[topic];
    
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
      sessionId: this.sessionId,
      isRealAI: false, // Opening message is predefined
      timestamp: Date.now()
    };
  }

  async sendMessage(userMessage) {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
      });

      // Try to get real AI response
      const response = await this.callGeminiAPIWithRetry();
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.text,
        timestamp: Date.now()
      });

      return response;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return this.getEnhancedFallbackResponse();
    }
  }

  async callGeminiAPIWithRetry(maxRetries = 2) {
    let lastError = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Rate limiting
        await this.enforceRateLimit();
        
        const response = await this.callGeminiAPI();
        if (response && response.text && response.text.trim().length > 0) {
          return response;
        }
      } catch (error) {
        lastError = error;
        console.warn(`Gemini API attempt ${attempt + 1} failed:`, error.message);
        
        // Wait before retry
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    console.error('All Gemini API attempts failed:', lastError);
    throw lastError || new Error('Gemini API failed after retries');
  }

  async enforceRateLimit() {
    if (this.lastApiCall) {
      const timeSinceLastCall = Date.now() - this.lastApiCall;
      if (timeSinceLastCall < this.rateLimitDelay) {
        await new Promise(resolve => 
          setTimeout(resolve, this.rateLimitDelay - timeSinceLastCall)
        );
      }
    }
    this.lastApiCall = Date.now();
  }

  async callGeminiAPI() {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_key') {
      throw new Error('Gemini API key not configured');
    }

    try {
      const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
      
      // Create conversation context
      const conversationContext = this.buildConversationContext();
      
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { 
                text: conversationContext
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150, // Keep responses short for voice
          candidateCount: 1,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000 // 15 second timeout
      });

      this.apiCallCount++;
      
      // Extract response text
      const candidate = response?.data?.candidates?.[0];
      if (!candidate) {
        throw new Error('No response candidate from Gemini API');
      }
      
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('Response blocked by safety filters');
      }
      
      const text = candidate?.content?.parts?.[0]?.text;
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini API');
      }
      
      // Check if conversation should end
      const shouldEnd = this.shouldEndConversation(text);
      
      return {
        id: uuidv4(),
        text: text.trim(),
        topic: this.currentTopic,
        sessionId: this.sessionId,
        endCall: shouldEnd,
        timestamp: Date.now(),
        isRealAI: true,
        apiCallCount: this.apiCallCount
      };
    } catch (error) {
      if (error.response) {
        // API returned an error response
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.');
        } else if (status === 400) {
          throw new Error('Invalid request to Gemini API');
        } else if (status === 403) {
          throw new Error('Gemini API key invalid or quota exceeded');
        } else {
          throw new Error(`Gemini API error: ${status} - ${data?.error?.message || 'Unknown error'}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - please check your internet connection');
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
  }

  buildConversationContext() {
    // Get recent conversation history (last 6 messages to stay within token limits)
    const recentHistory = this.conversationHistory.slice(-7); // Include system prompt
    
    let context = '';
    
    recentHistory.forEach(msg => {
      if (msg.role === 'system') {
        context += `SYSTEM INSTRUCTIONS: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        context += `USER: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        context += `ASSISTANT: ${msg.content}\n\n`;
      }
    });
    
    // Add user profile context if available
    if (this.userProfile) {
      context += `USER PROFILE: Name: ${this.userProfile.name || 'बहन'}, Language: ${this.userProfile.language || 'hi-IN'}\n\n`;
    }
    
    context += `Please respond as Didi in simple Hindi. Keep your response to 2-3 sentences maximum and ask a follow-up question to keep the conversation engaging. Focus on the topic: ${this.currentTopic}.`;
    
    return context;
  }

  shouldEndConversation(text) {
    const endPhrases = [
      'अलविदा',
      'फिर मिलेंगे',
      'आज के लिए बस',
      'धन्यवाद',
      'अच्छा लगा बात करके',
      'कल फिर बात करेंगे',
      'समय हो गया',
      'बात समाप्त'
    ];
    
    const lowerText = text.toLowerCase();
    return endPhrases.some(phrase => lowerText.includes(phrase.toLowerCase()));
  }

  getEnhancedFallbackResponse() {
    const responses = ENHANCED_FALLBACK_RESPONSES[this.currentTopic] || 
                     ENHANCED_FALLBACK_RESPONSES.general_health;
    
    // Choose response based on conversation length to avoid repetition
    const conversationLength = this.conversationHistory.filter(msg => msg.role !== 'system').length;
    const responseIndex = conversationLength % responses.length;
    const selectedResponse = responses[responseIndex];

    return {
      id: uuidv4(),
      text: selectedResponse,
      topic: this.currentTopic,
      sessionId: this.sessionId,
      endCall: false,
      timestamp: Date.now(),
      isFallback: true,
      isRealAI: false
    };
  }

  getConversationSummary() {
    const userMessages = this.conversationHistory.filter(msg => msg.role === 'user');
    const assistantMessages = this.conversationHistory.filter(msg => msg.role === 'assistant');
    const realAIResponses = assistantMessages.filter(msg => msg.isRealAI);
    
    return {
      sessionId: this.sessionId,
      topic: this.currentTopic,
      totalMessages: userMessages.length + assistantMessages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      realAIResponses: realAIResponses.length,
      fallbackResponses: assistantMessages.length - realAIResponses.length,
      apiCallCount: this.apiCallCount,
      duration: Date.now() - (this.conversationHistory[0]?.timestamp || Date.now()),
      lastMessage: this.conversationHistory[this.conversationHistory.length - 1]?.content || ''
    };
  }

  clearConversation() {
    this.conversationHistory = [];
    this.sessionId = uuidv4();
    this.apiCallCount = 0;
    this.lastApiCall = null;
  }

  // Health check for API connectivity
  async healthCheck() {
    try {
      const testResponse = await this.callGeminiAPI();
      return {
        status: 'healthy',
        apiKey: GEMINI_API_KEY ? 'configured' : 'missing',
        lastResponse: testResponse ? 'success' : 'failed'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        apiKey: GEMINI_API_KEY ? 'configured' : 'missing',
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const enhancedGeminiVoiceAssistant = new EnhancedGeminiVoiceAssistant();

// Export topic constants
export const VOICE_TOPICS = {
  MENSTRUAL_HEALTH: 'menstrual_health',
  PREGNANCY_CARE: 'pregnancy_care',
  DIGITAL_LITERACY: 'digital_literacy',
  GENERAL_HEALTH: 'general_health'
};

export default EnhancedGeminiVoiceAssistant;