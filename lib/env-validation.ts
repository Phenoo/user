/**
 * Environment Variable Validation
 *
 * This module validates that all required environment variables are set
 * at application startup. Import this in your root layout or middleware.
 */

interface EnvConfig {
  /** Variable name */
  name: string;
  /** Whether the variable is required */
  required: boolean;
  /** Description for error messages */
  description?: string;
}

const envVariables: EnvConfig[] = [
  // Convex
  {
    name: "NEXT_PUBLIC_CONVEX_URL",
    required: true,
    description: "Convex deployment URL",
  },

  // Authentication
  {
    name: "CONVEX_AUTH_PRIVATE_KEY",
    required: false,
    description: "Private key for Convex Auth (server-side)",
  },

  // Google OAuth
  {
    name: "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
    required: false,
    description: "Google OAuth Client ID",
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    required: false,
    description: "Google OAuth Client Secret",
  },

  // OpenAI
  {
    name: "OPENAI_API_KEY",
    required: false,
    description: "OpenAI API key for AI features",
  },

  // Polar (Payments)
  {
    name: "POLAR_ACCESS_TOKEN",
    required: false,
    description: "Polar access token for payments",
  },
  {
    name: "POLAR_WEBHOOK_SECRET",
    required: false,
    description: "Polar webhook secret",
  },

  // Resend (Email)
  {
    name: "RESEND_API_KEY",
    required: false,
    description: "Resend API key for sending emails",
  },

  // App URL
  {
    name: "NEXT_PUBLIC_APP_URL",
    required: false,
    description: "Public URL of the application",
  },
];

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate all environment variables
 * @returns Validation result with missing required variables and warnings
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const env of envVariables) {
    const value = process.env[env.name];

    if (!value || value.trim() === "") {
      if (env.required) {
        missing.push(`${env.name}${env.description ? ` (${env.description})` : ""}`);
      } else {
        warnings.push(`${env.name}${env.description ? ` (${env.description})` : ""}`);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Validate environment variables and throw an error if required variables are missing
 * Call this at application startup
 */
export function validateEnvOrThrow(): void {
  const result = validateEnv();

  if (!result.valid) {
    const errorMessage = `Missing required environment variables:\n${result.missing.map((v) => `  - ${v}`).join("\n")}`;
    throw new Error(errorMessage);
  }

  // Log warnings in development
  if (process.env.NODE_ENV === "development" && result.warnings.length > 0) {
    console.warn(
      `[ENV] Optional environment variables not set:\n${result.warnings.map((v) => `  - ${v}`).join("\n")}`
    );
  }
}

/**
 * Get an environment variable with a fallback value
 * @param name - Variable name
 * @param fallback - Fallback value if not set
 */
export function getEnv(name: string, fallback: string = ""): string {
  return process.env[name] || fallback;
}

/**
 * Get a required environment variable, throwing if not set
 * @param name - Variable name
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}
