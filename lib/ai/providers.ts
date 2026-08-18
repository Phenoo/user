import { createOpenAI } from "@ai-sdk/openai";
import { AIProvider } from "./models";

const deepseekProvider = createOpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function getProviderModel(provider: AIProvider, modelId: string) {
  switch (provider) {
    case "openai":
      return openaiProvider(modelId);
    case "deepseek":
      return deepseekProvider(modelId);
    default:
      if (modelId.startsWith("gpt-")) {
        return openaiProvider(modelId);
      }
      return deepseekProvider(modelId);
  }
}
