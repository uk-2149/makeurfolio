// --------------------------------------------------------------------------
// Gemini Client Factory
// --------------------------------------------------------------------------
// Thin factory for creating GoogleGenAI clients. The provider orchestrates
// multiple clients; this file only handles instantiation.
//
// Future-proof: if we need to support Gemini 3, Flash, Pro, Imagen, or
// configure custom transport options, we change this one file.
// --------------------------------------------------------------------------

import { GoogleGenAI } from "@google/genai";

/**
 * Create a Gemini client for a given API key.
 */
export function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({ apiKey });
}
