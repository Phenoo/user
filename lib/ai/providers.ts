import { createOpenAI } from "@ai-sdk/openai";
import { AIProvider } from "./models";

const deepseekProvider = createOpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export function getProviderModel(provider: AIProvider, modelId: string) {
  switch (provider) {
    case "deepseek":
      return deepseekProvider(modelId);
    default:
      return deepseekProvider(modelId);
  }
}
