import assert from "assert";
import { getRequiredGoogleScopes, hasGoogleScopes } from "../lib/integrations/google/scopes";
import { signOAuthState, verifyOAuthState } from "../lib/integrations/google/state";

export function runGoogleScopeTests() {
  process.env.GOOGLE_OAUTH_STATE_SECRET = "google-oauth-test-secret";
  // Test 1: Classroom narrow scopes
  const classroomScopes = getRequiredGoogleScopes("classroom");
  assert.deepStrictEqual(classroomScopes, [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
    "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
  ]);

  // Test 2: Drive narrow scope
  const driveScopes = getRequiredGoogleScopes("drive");
  assert.deepStrictEqual(driveScopes, ["https://www.googleapis.com/auth/drive.file"]);
  assert(!driveScopes.includes("https://www.googleapis.com/auth/drive"));
  assert(!driveScopes.includes("https://www.googleapis.com/auth/drive.readonly"));

  // Test 3: Calendar narrow scope
  const calendarScopes = getRequiredGoogleScopes("calendar");
  assert.deepStrictEqual(calendarScopes, ["https://www.googleapis.com/auth/calendar.events.owned"]);
  assert(!calendarScopes.includes("https://www.googleapis.com/auth/calendar"));

  // Test 4: Scope verification helper
  const granted = [
    "openid",
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
    "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
  ];
  assert.strictEqual(hasGoogleScopes(granted, getRequiredGoogleScopes("classroom")), true);
  assert.strictEqual(hasGoogleScopes(granted, getRequiredGoogleScopes("calendar")), false);

  // Test 5: CSRF State signing and verification
  const state = signOAuthState({
    integration: "classroom",
    nonce: "test-nonce-12345",
    timestamp: Date.now(),
    userId: "test-user-id",
  });
  const verified = verifyOAuthState(state);
  assert(verified !== null);
  assert.strictEqual(verified?.integration, "classroom");
  assert.strictEqual(verified?.nonce, "test-nonce-12345");
  assert.strictEqual(verified?.userId, "test-user-id");

  // Test 6: Reject tampered state token
  const [payload, signature] = state.split(".");
  const tamperedPayload = `${payload.slice(0, -1)}${payload.endsWith("A") ? "B" : "A"}`;
  const tampered = `${tamperedPayload}.${signature}`;
  assert.strictEqual(verifyOAuthState(tampered), null);

  const expiredState = signOAuthState({
    integration: "classroom",
    nonce: "expired-nonce",
    timestamp: Date.now() - 16 * 60 * 1000,
    userId: "test-user-id",
  });
  assert.strictEqual(verifyOAuthState(expiredState), null);

  console.log("✓ All Google OAuth & Scope tests passed successfully!");
}
