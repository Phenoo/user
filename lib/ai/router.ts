import { SUPPORTED_MODELS, DEFAULT_MODEL_ID, AIModelDefinition, TaskMode } from "./models";

export interface GetModelParams {
  userPlan?: "FREE" | "STUDENT" | "STUDENTPRO";
  mode?: TaskMode;
  requestedModelId?: string;
}

export interface ModelResolution {
  modelId: string;
  definition: AIModelDefinition;
}

export function resolveModel({
  userPlan = "FREE",
  mode = "standard",
  requestedModelId,
}: GetModelParams): ModelResolution {
  if (requestedModelId && SUPPORTED_MODELS[requestedModelId]) {
    const candidate = SUPPORTED_MODELS[requestedModelId];
    if (candidate.availability[userPlan]) {
      return { modelId: candidate.id, definition: candidate };
    }
  }

  if (mode === "deep-reasoning") {
    if (userPlan === "STUDENTPRO" && SUPPORTED_MODELS["deepseek-reasoner"]) {
      return {
        modelId: "deepseek-reasoner",
        definition: SUPPORTED_MODELS["deepseek-reasoner"],
      };
    }
    // Fallback to standard for non-pro
  }

  const defaultDef = SUPPORTED_MODELS[DEFAULT_MODEL_ID];
  return {
    modelId: defaultDef.id,
    definition: defaultDef,
  };
}
