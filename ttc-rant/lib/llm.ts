import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../prompts/systemPrompt';

// Initialize OpenAI client.
// Note: This will throw if OPENAI_API_KEY is missing and we try to use it,
// but we handle that in the function.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

export interface TranslatedPost {
  headline: string;
  body: string;
  tags: string[];
}

export async function translateAlert(rawAlert: string): Promise<TranslatedPost> {
  // Fallback to mock if no API key is set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key') {
    console.warn("No valid OPENAI_API_KEY found. Returning mock data.");
    return mockTranslation(rawAlert);
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: rawAlert }
      ],
      model: 'gpt-4o',
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content from LLM");

    return JSON.parse(content) as TranslatedPost;
  } catch (error) {
    console.error("LLM Error:", error);
    // Fallback to mock on error
    return mockTranslation(rawAlert);
  }
}

function mockTranslation(alert: string): TranslatedPost {
  // Simple deterministic mock based on keywords
  const lowerAlert = alert.toLowerCase();

  if (lowerAlert.includes("line 1") || lowerAlert.includes("yonge")) {
    return {
      headline: "Line 1 is Dead (Again)",
      body: "Oh look, Line 1 is broken. What a surprise. Grab a coffee and prepare to age 5 years waiting for a shuttle bus. " + alert,
      tags: ["#Line1Sucks", "#TTCFail", "#ShuttleBusYoga"]
    };
  } else if (lowerAlert.includes("line 2") || lowerAlert.includes("bloor")) {
    return {
      headline: "Line 2: The Sauna Experience",
      body: "Free sauna service on Line 2 today! Also, the trains aren't moving. Enjoy the heat. " + alert,
      tags: ["#Line2Sweat", "#NoAC", "#BloorDanforthDoom"]
    };
  } else if (lowerAlert.includes("streetcar") || lowerAlert.includes("504") || lowerAlert.includes("501")) {
     return {
      headline: "Short Turn: The Movie",
      body: "Your streetcar has decided to turn back because it just didn't feel like going to the end of the line. Get out and walk. " + alert,
      tags: ["#ShortTurn", "#StreetcarDespair"]
    };
  } else {
    return {
      headline: "General Transit Misery",
      body: `The TTC has rolled the dice and you lost. ${alert}. Good luck getting home!`,
      tags: ["#WhyTTC", "#MysteryDelay", "#TTC"]
    };
  }
}
