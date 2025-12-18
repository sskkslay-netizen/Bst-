
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function extractStudyMaterialFromImage(base64Image: string, mimeType: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: "Extract all the relevant study information from this image. Summarize the key concepts, definitions, and facts into a structured text format that can be used to generate a quiz or matching game. Be as detailed as possible.",
        },
      ],
    });
    return response.text || "Failed to extract text from the image.";
  } catch (err) {
    console.error("Gemini Vision Error:", err);
    return "Error processing the image intel.";
  }
}

export async function generateStudyQuestions(material: string) {
  try {
    const seed = Date.now().toString();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 20 UNIQUE multiple-choice questions based on the following material. 
      Seed: ${seed}. 
      CRITICAL: Do not repeat previous questions. Mix difficulty levels (basic facts, application of concepts, and deep analysis).
      Return them as a JSON array of objects with 'question', 'options' (array of 4), and 'answer' (index of correct option).
      Material: ${material}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.INTEGER }
            },
            required: ["question", "options", "answer"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (err) {
    console.error("Gemini Error:", err);
    return [];
  }
}

export async function generateMatchingGame(material: string) {
  try {
    const seed = Date.now().toString();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract 8 UNIQUE pairs of key terms and their concise definitions from this material for a matching game.
      Seed: ${seed}.
      Focus on different aspects than a standard quiz. Ensure definitions are distinct.
      Return a JSON array of objects with 'term' and 'definition'.
      Material: ${material}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              definition: { type: Type.STRING }
            },
            required: ["term", "definition"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (err) {
    console.error("Gemini Matching Error:", err);
    return [];
  }
}

export async function getCharacterChatResponse(characterName: string, message: string, history: any[], mode: 'normal' | 'debate' = 'normal') {
  try {
    const contents = [
      ...history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const instruction = mode === 'debate' 
      ? `You are ${characterName} from Bungou Stray Dogs. You are challenging the user to a intellectual debate about their study material. Be sharp, witty, and slightly condescending if you are a detective like Ranpo or Dazai. After the user's explanation, rate their answer from 1 to 10 based on accuracy and logic.`
      : `You are ${characterName} from Bungou Stray Dogs. Stay in character. Speak exactly like ${characterName}. If asked about study topics, try to incorporate their personality into the explanation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: instruction
      }
    });
    return response.text || "I'm currently thinking about something else...";
  } catch (err) {
    console.error("Gemini Chat Error:", err);
    return "I'm currently thinking about something else... (API Error)";
  }
}
