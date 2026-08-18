import assert from "assert";
import { getRequiredGoogleScopes, hasGoogleScopes } from "../lib/integrations/google/scopes";
import { signOAuthState, verifyOAuthState } from "../lib/integrations/google/state";

export function runGoogleScopeTests() {
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
  });
  const verified = verifyOAuthState(state);
  assert(verified !== null);
  assert.strictEqual(verified?.integration, "classroom");
  assert.strictEqual(verified?.nonce, "test-nonce-12345");

  // Test 6: Reject tampered state token
  const tampered = state.replace("classroom", "calendar");
  assert.strictEqual(verifyOAuthState(tampered), null);

  console.log("✓ All Google OAuth & Scope tests passed successfully!");
}
