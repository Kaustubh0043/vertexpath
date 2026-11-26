import type { Env } from '../types';

export interface AiOptions {
  maxTokens?: number;
  temperature?: number;
}

export async function callGemini(
  prompt: string,
  env: Env,
  jsonMode: boolean = false,
  systemInstruction?: string,
  options?: AiOptions
): Promise<string> {
  const apiKey = env.GEMINI_API_KEY?.trim();
  const groqKey = env.GROQ_API_KEY?.trim();
  const maxTokens = options?.maxTokens || 1024;
  const temp = options?.temperature ?? 0.2;

  // Try Gemini first if key available
  if (apiKey) {
    const models = ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash'];
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload: Record<string, unknown> = {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: temp,
            maxOutputTokens: maxTokens,
            ...(jsonMode ? { responseMimeType: 'application/json' } : {})
          }
        };

        if (systemInstruction) {
          payload.systemInstruction = {
            parts: [{ text: systemInstruction }]
          };
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = (await res.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          const errText = await res.text();
          console.warn(`Gemini model ${model} failed (${res.status}):`, errText);
        }
      } catch (e) {
        console.warn(`Gemini model ${model} request failed:`, e);
      }
    }
  }

  // Fallback to Groq if key available
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: maxTokens,
          temperature: temp,
          messages: [
            ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
            { role: 'user', content: prompt }
          ],
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
        })
      });

      if (res.ok) {
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (e) {
      console.warn('Groq request failed:', e);
    }
  }

  throw new Error('AI generation failed: No valid API key configured or upstream request failed.');
}

export async function generateJson<T>(
  prompt: string,
  env: Env,
  systemInstruction?: string,
  options?: AiOptions
): Promise<T> {
  const raw = await callGemini(prompt, env, true, systemInstruction, options);
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    const lines = cleaned.split('\n');
    if (lines[0].startsWith('```')) lines.shift();
    if (lines[lines.length - 1].startsWith('```')) lines.pop();
    cleaned = lines.join('\n').trim();
  }
  return JSON.parse(cleaned) as T;
}

