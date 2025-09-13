import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

// Demo Service - Real-time Voice Chat Simulation
class DemoService {
  constructor() {
    this.isRecording = false;
    this.currentRecording = null;
    this.conversationContext = 'greeting';
    this.messageCount = 0;
  }

  // Simulate real-time voice processing for judges
  async startVoiceInteraction(options = {}) {
    const {
      onUserSpeaking = null,
      onProcessing = null,
      onAIResponse = null,
      onError = null,
      language = 'hi-IN'
    } = options;

    try {
      // Step 1: Start recording (visual feedback)
      if (onUserSpeaking) onUserSpeaking(true);
      
      await this.startRecording();
      
      // Simulate user speaking for 2-4 seconds
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
      
      const audioUri = await this.stopRecording();
      if (onUserSpeaking) onUserSpeaking(false);

      // Step 2: Processing phase (show loading)
      if (onProcessing) onProcessing(true);
      
      // Simulate speech-to-text processing
      const userMessage = await this.simulateSTT(audioUri, language);
      
      // Step 3: Generate AI response
      const aiResponse = await this.generateContextualResponse(userMessage, language);
      
      if (onProcessing) onProcessing(false);
      if (onAIResponse) onAIResponse(aiResponse);

      // Step 4: Speak the response
      await this.speakResponse(aiResponse.text, language);

      return {
        success: true,
        userMessage,
        aiResponse
      };

    } catch (error) {
      console.error('Demo voice interaction error:', error);
      if (onError) onError(error.message);
      return { success: false, error: error.message };
    }
  }

  async startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Microphone permission required');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
      });

      await recording.startAsync();
      this.currentRecording = recording;
      this.isRecording = true;
      
      console.log('🎤 Recording started for demo...');
    } catch (error) {
      console.error('Recording start error:', error);
      throw error;
    }
  }

  async stopRecording() {
    try {
      if (!this.currentRecording || !this.isRecording) {
        return null;
      }

      await this.currentRecording.stopAndUnloadAsync();
      const uri = this.currentRecording.getURI();
      this.currentRecording = null;
      this.isRecording = false;

      console.log('🎤 Recording stopped, processing...');
      return uri;
    } catch (error) {
      console.error('Recording stop error:', error);
      throw error;
    }
  }

  async simulateSTT(audioUri, language = 'hi-IN') {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    // Context-aware user messages for demo
    const demoUserMessages = {
      greeting: [
        'नमस्ते दीदी, कैसी हैं आप?',
        'हैलो, मुझे मदद चाहिए',
        'दीदी, मैं यहां नई हूं',
        'आपसे बात करके अच्छा लगा'
      ],
      health: [
        'मुझे स्वास्थ्य के बारे में जानना है',
        'बच्चों का टीकाकरण कब कराना चाहिए?',
        'पेट दर्द की दवाई क्या लेनी चाहिए?',
        'डॉक्टर के पास कब जाना चाहिए?'
      ],
      education: [
        'बच्चों की पढ़ाई कैसे करवाएं?',
        'स्कूल में एडमिशन कैसे कराते हैं?',
        'ऑनलाइन क्लास कैसे जॉइन करें?',
        'छात्रवृत्ति के लिए कैसे अप्लाई करें?'
      ],
      finance: [
        'बैंक में खाता कैसे खोलते हैं?',
        'UPI से पेमेंट कैसे करते हैं?',
        'पैसे कैसे बचाकर रखें?',
        'लोन के लिए कहां जाना चाहिए?'
      ],
      rights: [
        'महिला हेल्पलाइन नंबर क्या है?',
        'पुलिस में शिकायत कैसे करें?',
        'कानूनी मदद कहां मिलेगी?',
        'घरेलू हिंसा से कैसे बचें?'
      ]
    };

    // Cycle through different contexts for variety
    const contexts = Object.keys(demoUserMessages);
    const currentContext = contexts[this.messageCount % contexts.length];
    this.conversationContext = currentContext;

    const contextMessages = demoUserMessages[currentContext];
    const selectedMessage = contextMessages[Math.floor(Math.random() * contextMessages.length)];

    this.messageCount++;

    return {
      text: selectedMessage,
      context: currentContext,
      confidence: 0.92,
      timestamp: Date.now()
    };
  }

  async generateContextualResponse(userMessage, language = 'hi-IN') {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Context-aware AI responses
    const aiResponses = {
      greeting: [
        'नमस्ते बहन! मैं दीदी हूं, आपकी डिजिटल साथी। आज कैसे मदद कर सकती हूं?',
        'हैलो! मुझे खुशी है कि आप यहां आईं। बताइए क्या जानना चाहती हैं?',
        'नमस्कार! मैं यहां आपकी हर समस्या का समाधान लेकर आई हूं।',
        'आपका स्वागत है! आज हम किस विषय पर बात करेंगे?'
      ],
      health: [
        'स्वास्थ्य बहुत महत्वपूर्ण है बहन। बच्चों का टीकाकरण समय पर कराना जरूरी है। नजदीकी आंगनवाड़ी केंद्र में जाकर टीकाकरण चार्ट ले सकती हैं।',
        'पेट दर्द के लिए पहले घरेलू उपाय करें - अजवाइन का पानी पिएं। अगर दर्द बना रहे तो डॉक्टर से मिलें। कभी भी बिना सलाह दवाई न लें।',
        'डॉक्टर के पास तब जाएं जब बुखार 3 दिन से ज्यादा हो, या सांस लेने में तकलीफ हो। आपातकाल में 108 नंबर डायल करें।',
        'महिलाओं के लिए नियमित चेकअप जरूरी है। गर्भावस्था में हर महीने डॉक्टर से मिलें और आयरन की गोलियां लें।'
      ],
      education: [
        'बच्चों की शिक्षा के लिए सबसे पहले नजदीकी सरकारी स्कूल में जाकर एडमिशन फॉर्म भरें। आधार कार्ड, जन्म प्रमाण पत्र और फोटो की जरूरत होगी।',
        'ऑनलाइन क्लास के लिए स्मार्टफोन में Google Meet या Zoom ऐप डाउनलोड करें। टीचर से क्लास लिंक मांगें और समय पर जॉइन करें।',
        'छात्रवृत्ति के लिए National Scholarship Portal पर जाएं। 12वीं के बाद कई स्कॉलरशिप मिलती हैं। जरूरी दस्तावेज तैयार रखें।',
        'बच्चों को पढ़ाने के लिए रोज एक घंटा निकालें। कहानी-किताबें पढ़ें और उनके सवालों के जवाब दें।'
      ],
      finance: [
        'बैंक खाता खोलने के लिए आधार कार्ड, पैन कार्ड और फोटो लेकर नजदीकी बैंक जाएं। Jan Dhan Yojana के तहत मुफ्त खाता खुलता है।',
        'UPI बहुत आसान है बहन! PhonePe या Google Pay ऐप डाउनलोड करें, मोबाइल नंबर से रजिस्टर करें और UPI PIN बनाएं। फिर QR कोड स्कैन करके पेमेंट करें।',
        'पैसे बचाने के लिए हर महीने कुछ रकम अलग रखें। बैंक में RD खाता खोलें या SIP करें। छोटी-छोटी बचत भी बड़ी रकम बन जाती है।',
        'लोन के लिए पहले अपनी जरूरत समझें। Personal loan की बजाय सरकारी योजनाओं को देखें। Mudra Loan छोटे व्यापार के लिए अच्छा है।'
      ],
      rights: [
        'महिला हेल्पलाइन 1091 है बहन। 24 घंटे उपलब्ध है। किसी भी परेशानी में बेझिझक कॉल करें। आपकी बात गुप्त रखी जाएगी।',
        'पुलिस में शिकायत के लिए नजदीकी थाने जाएं या 100 नंबर डायल करें। महिला पुलिस स्टेशन भी हैं जहां महिला अधिकारी हैं।',
        'कानूनी मदद के लिए Legal Aid Society से संपर्क करें। गरीबों के लिए मुफ्त वकील मिलते हैं। District Legal Services Authority भी मदद करती है।',
        'घरेलू हिंसा बर्दाश्त न करें। Women Protection Act के तहत आपके अधिकार हैं। तुरंत 181 नंबर पर कॉल करें या नजदीकी NGO से मदद लें।'
      ]
    };

    const contextResponses = aiResponses[userMessage.context] || aiResponses.greeting;
    const selectedResponse = contextResponses[Math.floor(Math.random() * contextResponses.length)];

    return {
      text: selectedResponse,
      context: userMessage.context,
      emotion: 'caring',
      timestamp: Date.now(),
      isAI: true
    };
  }

  async speakResponse(text, language = 'hi-IN') {
    try {
      // Configure speech options for natural voice
      const speechOptions = {
        language: language,
        pitch: 1.0,
        rate: 0.8, // Slightly slower for clarity
        voice: undefined // Use system default
      };

      await Speech.speak(text, speechOptions);
      console.log('🔊 AI response spoken');
    } catch (error) {
      console.error('Speech error:', error);
    }
  }

  // Quick demo - pre-scripted conversation
  async runQuickDemo(onUpdate) {
    const demoScript = [
      {
        user: 'नमस्ते दीदी, मुझे UPI के बारे में जानना है',
        ai: 'नमस्ते बहन! UPI बहुत आसान है। PhonePe या Google Pay ऐप डाउनलोड करें और मैं आपको step-by-step सिखाती हूं।'
      },
      {
        user: 'कैसे करते हैं UPI से पेमेंट?',
        ai: 'बहुत सरल है! पहले ऐप खोलें, फिर QR कोड स्कैन करें या मोबाइल नंबर डालें। अमाउंट डालकर UPI PIN डालें। बस हो गया!'
      },
      {
        user: 'क्या ये सुरक्षित है?',
        ai: 'बिल्कुल सुरक्षित है बहन! लेकिन कुछ बातें याद रखें - कभी भी अपना PIN किसी को न बताएं, और केवल trusted QR codes ही स्कैन करें।'
      }
    ];

    for (let i = 0; i < demoScript.length; i++) {
      const { user, ai } = demoScript[i];
      
      // Show user message
      if (onUpdate) onUpdate({ type: 'user', text: user });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show AI processing
      if (onUpdate) onUpdate({ type: 'processing' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show AI response
      if (onUpdate) onUpdate({ type: 'ai', text: ai });
      await this.speakResponse(ai);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export const demoService = new DemoService();
export default demoService;
