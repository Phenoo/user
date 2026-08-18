import { createOpenAI } from "@ai-sdk/openai";

export const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export { getProviderModel } from "./ai/providers";
