
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getSmartReply = async (messages: string[]): Promise<string[]> => {
  if (!process.env.API_KEY) return ["Nice!", "I agree", "Cool"];
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given these recent messages in a chat, suggest 3 short, contextual, and natural-sounding quick replies: ${messages.join(" | ")}`,
      config: {
        maxOutputTokens: 100,
        responseMimeType: "application/json",
      },
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Okay", "Sounds good", "Wait"];
  }
};

export const summarizeConversation = async (messages: string[]): Promise<string> => {
  if (!process.env.API_KEY) return "Conversation history is encrypted.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following chat transcript concisely: ${messages.join("\n")}`,
      config: { maxOutputTokens: 150 }
    });
    return response.text || "Summary unavailable.";
  } catch (error) {
    return "Failed to summarize chat.";
  }
};
