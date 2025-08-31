import axios from 'axios';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Simple wrapper to call Gemini via a backend or direct API if available.
// For security, you should proxy this through a lightweight Node/Express server.
// Here we allow both: if GCP_FUNCTION_URL is provided we call it.

const GCP_FUNCTION_URL = process.env.EXPO_PUBLIC_GEMINI_PROXY_URL || '';
const DIRECT_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export async function sendToLLM(history, packId) {
  const userPrompt = history[history.length - 1]?.content || '';
  const systemPrompt = history.find((h) => h.role === 'system')?.content?.system ||
    'You are Didi, a warm Hindi-speaking mentor. Keep responses short and ask small check-in questions.';

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.filter((h) => h.role !== 'system'),
  ];

  // If proxy URL exists, call it
  if (GCP_FUNCTION_URL) {
    const res = await axios.post(GCP_FUNCTION_URL, { messages, packId });
    return res.data;
  }

  // Otherwise attempt direct call to Gemini (model: gemini-1.5-pro)
  if (DIRECT_API_KEY) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + DIRECT_API_KEY;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\nPack: ${packId}` },
            { text: messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n') }
          ]
        }
      ]
    };
    const res = await axios.post(url, payload);
    const text = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Theek hai behen, aage badhte hain.';

    // lightweight heuristic to end a call
    const endCall = /alvida|kal phir|aaj ke liye bas|shabash/i.test(text);
    return { id: uuidv4(), text, endCall };
  }

  // Fallback mock
  const mock = 'Bahut badiya. Ab ek chhota sawaal: mahavari ke dauran safai ke liye kya use karogi? Option 1: saaf kapda, Option 2: jo mile. Option 3: pad ya cup. Bolo option number.';
  return { id: uuidv4(), text: mock, endCall: false };
}
