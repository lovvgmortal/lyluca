

import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { Chapter, ScriptChunk, PacingPoint } from '../types';

const MODEL_NAME = 'gemini-2.5-pro';
const OPENROUTER_MODEL_NAME = 'google/gemini-2.5-pro';

type Provider = 'gemini' | 'openrouter';

export interface ProviderConfig {
    geminiApiKey: string | null;
    openRouterApiKey: string | null;
    primaryProvider: Provider;
}

// Helper to parse the new YouTube-style timeline format
const parseTimeline = (rawTimeline: string): Chapter[] => {
    const chapters: Chapter[] = [];
    // Regex to match "00:00 – Chapter Title"
    const chapterRegex = /^(\d{2}:\d{2})\s*[–-]\s*(.+)$/;

    const lines = rawTimeline.split('\n').filter(line => line.trim() !== '' && chapterRegex.test(line.trim()));
  
    for (const line of lines) {
      const match = line.trim().match(chapterRegex);
      if (match) {
        chapters.push({
          time: match[1],
          description: match[2].trim(),
        });
      }
    }
    return chapters;
};

// --- Provider-specific API callers ---

const callGemini = async (apiKey: string, contents: any, config: any, isJson: boolean, jsonSchema?: any): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const geminiConfig: any = { ...config };
    if (isJson) {
        geminiConfig.responseMimeType = 'application/json';
        if (jsonSchema) {
          geminiConfig.responseSchema = jsonSchema;
        }
    }
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: contents,
        config: geminiConfig,
    });
    return response.text;
};

const callOpenRouter = async (apiKey: string, contents: any, config: any, isJson: boolean): Promise<string> => {
    const body: any = {
        model: OPENROUTER_MODEL_NAME,
        messages: [{ role: 'user', content: contents }],
        temperature: config?.temperature,
    };
    if (isJson) {
         body.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Script Assistant',
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
        throw new Error(`OpenRouter API error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};


// --- Core Fallback Logic ---

async function executeWithFallback(
    providerConfig: ProviderConfig,
    params: { contents: any, config?: any, isJson?: boolean, jsonSchema?: any }
): Promise<string> {
    const { geminiApiKey, openRouterApiKey, primaryProvider } = providerConfig;
    const { contents, config = {}, isJson = false, jsonSchema } = params;

    const providersInOrder: Provider[] = primaryProvider === 'gemini' 
        ? ['gemini', 'openrouter'] 
        : ['openrouter', 'gemini'];

    let lastError: Error | null = null;

    for (const provider of providersInOrder) {
        try {
            console.log(`Attempting to use provider: ${provider}`);
            if (provider === 'gemini') {
                if (!geminiApiKey) throw new Error("Google Gemini API key is not configured.");
                return await callGemini(geminiApiKey, contents, config, isJson, jsonSchema);
            } else if (provider === 'openrouter') {
                if (!openRouterApiKey) throw new Error("OpenRouter API key is not configured.");
                return await callOpenRouter(openRouterApiKey, contents, config, isJson);
            }
        } catch (error) {
            console.error(`Error with ${provider}:`, error);
            lastError = error as Error;
        }
    }

    throw new Error(`Both AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
}


export const generateTitleSummaryAndTimeline = async (providerConfig: ProviderConfig, script: string): Promise<{ aiTitle: string, summary: string, timeline: Chapter[] }> => {
  try {
    const wordCount = script.trim().split(/\s+/).filter(Boolean).length;

    const titlePrompt = `You are an expert YouTube title optimizer specializing in creating high-performing, click-worthy titles.

TASK: Analyze the provided script and generate ONE optimized title.

MANDATORY REQUIREMENTS:
- Must start with: "Ukrainian Drones"
- Maximum length: 80 characters (including spaces)
- Include the main keyword/topic from the script
- Use compelling, action-oriented language that drives clicks

OPTIMIZATION GUIDELINES:
- Use power words (destroys, reveals, strikes, targets, etc.)
- Create curiosity or urgency when possible
- Ensure accuracy to the script content
- Avoid clickbait or misleading information

OUTPUT FORMAT:
Provide only the title, nothing else.


🧾 Source Script:
${script}`;

    const summaryPrompt = `You are a script summarizer for any type of content across all topics and genres.
Your task is to write a concise summary of the script below.
✅ Output Requirements:

Output only one summary paragraph
The summary must be no more than 120 words
Use clear, neutral language appropriate for the content type
Focus on main events, key points, timeline, and significance
Do not include quotes, dialogue, or minor details
Do not mention the existence of a script or that this is a summary

🔐 Must Preserve:

Key event(s) or main topic
Who/what was involved
Where and when it happened (if applicable)
What the outcome or significance was
Adapt these elements based on content type (news, education, entertainment, business, etc.)

📌 Expected Output:
A single paragraph of up to 120 words summarizing the script's key content, structured like a video description or intro narration.

🧾 Source Script:
${script}`;

    const timelinePrompt = `
    You are a YouTube script analyst and chapter timeline editor.
Your task is to read the script below and generate a clean YouTube chapter timeline.
🕒 Output Format:
🕒 Chapters Timeline
00:00 – Intro
01:40 – [Chapter Title 2]
04:20 – [Chapter Title 3]
...
📝 Rules:

Calculate video duration: ~160-165 words per minute of speech
Create 4-8 chapters maximum (including intro)
Base chapters on major story beats or topic shifts, not minor details
Use concise, descriptive titles (4-8 words max)
Always start with "00:00 – Intro"
Output only the timeline, no explanations

Total script length: ${wordCount} words
Now, generate the YouTube chapter timeline for this script:
${script}`;

    const commonConfig = {
      temperature: 0,
    };

    const titlePromise = executeWithFallback(providerConfig, { contents: titlePrompt, config: commonConfig });
    const summaryPromise = executeWithFallback(providerConfig, { contents: summaryPrompt, config: commonConfig });
    const timelinePromise = executeWithFallback(providerConfig, { contents: timelinePrompt, config: commonConfig });

    const [aiTitle, summary, rawTimeline] = await Promise.all([
      titlePromise,
      summaryPromise,
      timelinePromise,
    ]);

    const timeline = parseTimeline(rawTimeline);

    return { aiTitle: aiTitle.trim(), summary: summary.trim(), timeline };

  } catch (error) {
    console.error("Error generating details:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Could not generate details for the script.");
  }
};

export const rewriteScript = async (providerConfig: ProviderConfig, originalScript: string, stylePrompt?: string): Promise<string> => {
  const instruction = stylePrompt || 'Rewrite the following script to improve its pacing, dialogue, and engagement. Keep the main plot and characters.';
  const contents = `${instruction}\n\nReturn only the rewritten script content.\n\nORIGINAL SCRIPT:\n${originalScript}`;
  
  try {
    return await executeWithFallback(providerConfig, {
      contents,
      config: { temperature: 0 }
    });
  } catch (error) {
    console.error("Error rewriting script:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Could not rewrite the script.");
  }
};


export const generateOutline = async (providerConfig: ProviderConfig, prompt: string): Promise<string> => {
  try {
    return await executeWithFallback(providerConfig, {
        contents: prompt,
        config: { temperature: 0 }
    });
  } catch (error) {
    console.error("Error generating outline:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Could not generate the outline.");
  }
};


export const generateScriptFromOutline = async (providerConfig: ProviderConfig, outline: string, prompt: string): Promise<string> => {
  const contents = `OUTLINE:\n${outline}\n${prompt}`;
  try {
    return await executeWithFallback(providerConfig, {
        contents,
        config: { temperature: 0 }
    });
  } catch (error) {
    console.error("Error generating script from outline:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Could not generate the script from the outline.");
  }
};

export const generateKeywordsAndSplitScript = async (providerConfig: ProviderConfig, script: string, stylePrompt?: string): Promise<ScriptChunk[]> => {
  try {
    const instruction = stylePrompt || `Split this military script into 1-2 sentence chunks. For each chunk, generate military keywords following these rules:

KEYWORDS:
- Use FULL equipment names: "F-35 LIGHTNING II, F-22 RAPTOR" (not "aircraft")
- Multiple keywords separated by commas: "M1A2 ABRAMS, HULL-DOWN"
- Military terms: "AIR SUPREMACY" (not "air superiority"), "CLOSE AIR SUPPORT", "RECON"
- Equipment: "UH-60 BLACK HAWK", "M4A1 CARBINE", "FGM-148 JAVELIN"
- Units: "NAVY SEALS", "RANGERS", "MARINES", "AIRBORNE"
- UPPERCASE format always
- Maximum 2 keywords per chunk to maintain focus
EXAMPLES:
Text: "F-35s and F-22s deployed" → Keywords: "F-35 LIGHTNING II, F-22 RAPTOR"
Text: "Abrams in hull-down positions" → Keywords: "M1A2 ABRAMS, HULL-DOWN"
Text: "establish air superiority" → Keywords: "AIR SUPREMACY"`;

    const contents = `${instruction}\n\nReturn JSON array: [{"content": "chunk text", "keyword": "KEYWORDS"}]\n\nSCRIPT:\n${script}`;
    const jsonSchema = {
      type: Type.ARRAY,
      description: "An array of military script chunks, each with content and a single military-themed keyword.",
      items: {
        type: Type.OBJECT,
        properties: {
          content: {
            type: Type.STRING,
            description: "The content of the script chunk (1-2 sentences)."
          },
          keyword: {
            type: Type.STRING,
            description: "Military keywords in UPPERCASE, comma-separated"
          }
        },
        required: ['content', 'keyword']
      }
    };

    const jsonString = await executeWithFallback(providerConfig, {
      contents,
      config: { temperature: 0 },
      isJson: true,
      jsonSchema
    });

    if (!jsonString) {
        return [];
    }
    const result = JSON.parse(jsonString);
    
    // Type validation
    if (!Array.isArray(result)) {
        console.error("AI did not return an array for script analysis.");
        return [];
    }

    const validatedChunks: ScriptChunk[] = result.filter((chunk: any) => 
        chunk &&
        typeof chunk.content === 'string' &&
        typeof chunk.keyword === 'string'
    );

    return validatedChunks;
  } catch (error)
 {
    console.error("Error generating military keywords and splitting script:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Could not analyze the script.");
  }
};

export const analyzeScriptPacing = async (providerConfig: ProviderConfig, script: string): Promise<PacingPoint[]> => {
    try {
        const prompt = `You are a script pacing analyst. Your task is to analyze the provided script and map its emotional and action intensity over time.
1.  Divide the script into 10-15 meaningful chunks based on distinct beats or scenes.
2.  For each chunk, assign an "intensity" score from 1 to 10.
    - 1: Very low intensity (e.g., quiet exposition, setup).
    - 5: Medium intensity (e.g., rising tension, important dialogue).
    - 10: Peak intensity (e.g., climax, major action sequence, emotional peak).
3.  Return the actual content of the script chunk, not a summary.

Return a JSON array of objects with "chunk" (the full content of the script chunk) and "intensity" (the score).

SCRIPT:
${script}`;
        
        const jsonSchema = {
            type: Type.ARRAY,
            description: "An array of script pacing points, each with the script chunk content and an intensity score.",
            items: {
                type: Type.OBJECT,
                properties: {
                    chunk: {
                        type: Type.STRING,
                        description: "The actual content of the script chunk."
                    },
                    intensity: {
                        type: Type.NUMBER,
                        description: "An intensity score from 1 to 10."
                    }
                },
                required: ['chunk', 'intensity']
            }
        };

        const jsonString = await executeWithFallback(providerConfig, {
            contents: prompt,
            config: { temperature: 0 },
            isJson: true,
            jsonSchema
        });

        if (!jsonString) {
            return [];
        }
        const result = JSON.parse(jsonString);
        
        if (!Array.isArray(result)) {
            console.error("AI did not return an array for pacing analysis.");
            return [];
        }

        const validatedPacingPoints: PacingPoint[] = result.filter((point: any) => 
            point &&
            typeof point.chunk === 'string' &&
            typeof point.intensity === 'number' &&
            point.intensity >= 1 && point.intensity <= 10
        );

        return validatedPacingPoints;
    } catch (error) {
        console.error("Error analyzing script pacing:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Could not analyze the script's pacing.");
    }
};
