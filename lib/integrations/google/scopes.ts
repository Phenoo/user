export const GOOGLE_SCOPES = {
  identity: [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ],

  classroom: [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
    "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
  ],

  drive: [
    "https://www.googleapis.com/auth/drive.file",
  ],

  calendar: [
    "https://www.googleapis.com/auth/calendar.events.owned",
  ],
} as const;

export type GoogleIntegrationType = "classroom" | "drive" | "calendar";

/**
 * Returns the exact minimum required scopes for a given Google integration.
 */
export function getRequiredGoogleScopes(
  integration: GoogleIntegrationType
): readonly string[] {
  switch (integration) {
    case "classroom":
      return GOOGLE_SCOPES.classroom;
    case "drive":
      return GOOGLE_SCOPES.drive;
    case "calendar":
      return GOOGLE_SCOPES.calendar;
    default:
      throw new Error(`Unsupported integration type: ${integration}`);
  }
}

/**
 * Determines whether a set of granted scopes satisfies all required scopes for an integration.
 */
export function hasGoogleScopes(
  grantedScopes: string[] = [],
  requiredScopes: readonly string[] = []
): boolean {
  if (!grantedScopes.length || !requiredScopes.length) return false;
  return requiredScopes.every((scope) => grantedScopes.includes(scope));
}
