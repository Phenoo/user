import crypto from "crypto";

export interface GoogleCredentialSecrets {
  accessToken?: string;
  refreshToken?: string;
}

const ENVELOPE_VERSION = "v1";

function getEncryptionKey() {
  const keyMaterial =
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY ||
    process.env.GOOGLE_OAUTH_STATE_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET;

  if (!keyMaterial) {
    throw new Error("Google token encryption key is not configured");
  }

  return crypto.createHash("sha256").update(keyMaterial).digest();
}

export function encryptGoogleCredentials(
  credentials: GoogleCredentialSecrets
): string {
  if (!credentials.accessToken && !credentials.refreshToken) {
    throw new Error("At least one Google credential is required");
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const plaintext = JSON.stringify(credentials);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authenticationTag = cipher.getAuthTag();

  return [
    ENVELOPE_VERSION,
    iv.toString("base64url"),
    authenticationTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptGoogleCredentials(
  envelope: string
): GoogleCredentialSecrets {
  const [version, ivValue, tagValue, ciphertextValue] = envelope.split(".");
  if (
    version !== ENVELOPE_VERSION ||
    !ivValue ||
    !tagValue ||
    !ciphertextValue
  ) {
    throw new Error("Unsupported Google credential envelope");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  const parsed = JSON.parse(plaintext) as GoogleCredentialSecrets;

  if (
    (parsed.accessToken !== undefined && typeof parsed.accessToken !== "string") ||
    (parsed.refreshToken !== undefined && typeof parsed.refreshToken !== "string") ||
    (!parsed.accessToken && !parsed.refreshToken)
  ) {
    throw new Error("Invalid Google credential payload");
  }

  return parsed;
}
