
import { GoogleGenAI, Type } from "@google/genai";
import { AIRecommendationResponse, RecommendationRequest } from "../types";

export const getAIRecommendations = async (req: RecommendationRequest): Promise<AIRecommendationResponse> => {
  // Always use process.env.API_KEY directly and initialize right before use.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Recommend exactly 4 high-quality educational materials for the following request:
  Course: ${req.courseTitle}
  Topic: ${req.topic}
  Difficulty Level: ${req.level}

  Provide a brief summary of why these materials are selected for this specific combination.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      // System instructions moved to config as per recommended practices.
      systemInstruction: "You are an expert academic advisor specializing in curating high-quality educational resources like videos, articles, books, podcasts, and courses.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { 
            type: Type.STRING,
            description: "A summary of the recommendation strategy."
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                author: { type: Type.STRING },
                category: { 
                    type: Type.STRING, 
                    enum: ['Video', 'Article', 'Book', 'Podcast', 'Course'] 
                },
                url: { type: Type.STRING },
                description: { type: Type.STRING },
                relevanceScore: { type: Type.NUMBER },
                tags: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
              },
              required: ["id", "title", "author", "category", "description", "relevanceScore", "tags"]
            }
          }
        },
        required: ["summary", "recommendations"]
      }
    }
  });

  // Accessing response.text as a property, not a method.
  const text = response.text;
  if (!text) {
    throw new Error("No response received from the AI service.");
  }

  try {
    return JSON.parse(text) as AIRecommendationResponse;
  } catch (error) {
    console.error("AI Response Parsing Error:", text);
    throw new Error("Received an invalid response format from the AI.");
  }
};
