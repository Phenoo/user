import assert from "assert";

import {
  decryptGoogleCredentials,
  encryptGoogleCredentials,
} from "../lib/integrations/google/crypto";

export function runGoogleCredentialTests() {
  const originalKey = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = "google-credential-test-key";

  try {
    const credentials = {
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
    };
    const encrypted = encryptGoogleCredentials(credentials);

    assert(!encrypted.includes(credentials.accessToken));
    assert(!encrypted.includes(credentials.refreshToken));
    assert.deepStrictEqual(decryptGoogleCredentials(encrypted), credentials);

    const lastCharacter = encrypted.at(-1);
    const tampered = `${encrypted.slice(0, -1)}${lastCharacter === "A" ? "B" : "A"}`;
    assert.throws(() => decryptGoogleCredentials(tampered));

    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = "different-test-key";
    assert.throws(() => decryptGoogleCredentials(encrypted));
  } finally {
    if (originalKey === undefined) {
      delete process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
    } else {
      process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = originalKey;
    }
  }
}
