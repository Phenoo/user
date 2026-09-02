export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = "AIError";
  }
}

export class AIEntitlementError extends AIError {
  constructor(message: string = "Feature not permitted under current subscription plan") {
    super(message, "AI_ENTITLEMENT_ERROR", 403);
  }
}

export class AIAuthenticationError extends AIError {
  constructor(message: string = "You must be signed in to use AI features") {
    super(message, "AI_AUTHENTICATION_REQUIRED", 401);
  }
}

export class AICreditLimitError extends AIError {
  constructor(message: string = "Monthly AI credits quota exceeded") {
    super(message, "AI_CREDIT_LIMIT_EXCEEDED", 429);
  }
}

export class AIProviderError extends AIError {
  constructor(message: string = "Upstream AI provider error occurred") {
    super(message, "AI_PROVIDER_ERROR", 502);
  }
}

export function getUserFacingAIError(error: unknown) {
  if (error instanceof AIError) {
    return {
      message: error.message,
      code: error.code,
      status: error.statusCode,
    };
  }

  return {
    message: error instanceof Error ? error.message : "An unexpected AI service error occurred",
    code: "INTERNAL_SERVER_ERROR",
    status: 500,
  };
}
