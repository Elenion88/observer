/**
 * Native vision labelling using Groq's OpenAI-compatible API.
 * No Python subprocess, no SDK — just fetch.
 *
 * Falls back to OpenRouter + Gemini Flash Lite if Groq fails.
 */
import { readFile } from "node:fs/promises";

const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const FALLBACK_MODEL = "google/gemini-2.5-flash-lite";

const PROMPT =
  "You are an ISO 9001 audit observer. Identify what this photo shows in ONE short label suitable for an audit evidence log. " +
  "Examples: 'Fire extinguisher inspection tag, expiry 2026-08'; 'First aid kit, wall-mounted'; " +
  "'Calibration certificate \\u2014 torque wrench, 2025-03'; 'Employee training log \\u2014 Q3 2025'. " +
  "Reply with the label only, no preamble.";

function mimeFromPath(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  dataUrl: string,
  timeoutMs = 12000
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 80,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`${endpoint} returned ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    const label = data?.choices?.[0]?.message?.content?.trim();
    if (!label) throw new Error("empty label in response");
    return label;
  } finally {
    clearTimeout(timer);
  }
}

export async function labelImageFromPath(absPath: string): Promise<string> {
  const buffer = await readFile(absPath);
  const mime = mimeFromPath(absPath);
  const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;

  const groqKey = process.env.GROQ_API_KEY;
  const orKey = process.env.OPENROUTER_API_KEY;

  // Try Groq first (fastest).
  if (groqKey) {
    try {
      return await callOpenAICompatible(
        "https://api.groq.com/openai/v1/chat/completions",
        groqKey,
        GROQ_MODEL,
        dataUrl
      );
    } catch (err) {
      console.warn("[labelImage] Groq failed, falling back to OpenRouter:", err);
    }
  }

  // Fallback: OpenRouter + Gemini.
  if (!orKey) {
    throw new Error("No GROQ_API_KEY or OPENROUTER_API_KEY available");
  }
  return await callOpenAICompatible(
    "https://openrouter.ai/api/v1/chat/completions",
    orKey,
    FALLBACK_MODEL,
    dataUrl
  );
}
