import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

const INSIGHT_PROMPT = `You are "Astro Noctum", a premium astrology observatory AI.
You synthesize Western astrology (zodiac positions, planetary aspects, house placements)
with Chinese metaphysics (BaZi pillars, Wu Xing five-element balance) into a unified reading.

Style: scholarly yet poetic, using the language of celestial mechanics.
Tone: "Quiet Luxury" — measured, precise, no hype. Use German astronomical terms where fitting.
Length: 3-5 sentences.

Given the following chart data and fusion analysis, provide a personalized insight:

CHART DATA:
{chartData}

FUSION ANALYSIS:
{fusionData}

Respond with a single cohesive insight paragraph. Do not use bullet points or headers.`;

export async function generateInsight(
  chartData: Record<string, unknown>,
  fusionData: Record<string, unknown>,
): Promise<{ text: string; model: string; tokensUsed: number }> {
  const prompt = INSIGHT_PROMPT
    .replace('{chartData}', JSON.stringify(chartData, null, 2))
    .replace('{fusionData}', JSON.stringify(fusionData, null, 2));

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  const text = response.text ?? '';
  const tokensUsed =
    (response.usageMetadata?.totalTokenCount) ?? 0;

  return { text, model: 'gemini-2.0-flash', tokensUsed };
}
