const EMBEDDING_DIMENSIONS = 128;

function normalizeToken(token: string) {
  return token
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function tokenizeForEmbedding(text: string) {
  return text
    .split(/\s+/)
    .map(normalizeToken)
    .filter((token) => token.length >= 2);
}

function hashToken(token: string) {
  let hash = 2166136261;

  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash);
}

export function createDeterministicEmbedding(text: string) {
  const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
  const tokens = tokenizeForEmbedding(text);

  if (tokens.length === 0) {
    return vector;
  }

  for (const token of tokens) {
    const hash = hashToken(token);
    const bucket = hash % EMBEDDING_DIMENSIONS;
    const sign = (hash >> 1) % 2 === 0 ? 1 : -1;
    vector[bucket] += sign;
  }

  const magnitude = Math.sqrt(
    vector.reduce((sum, value) => sum + value * value, 0)
  );

  if (magnitude === 0) {
    return vector;
  }

  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

export function cosineSimilarity(a: number[] = [], b: number[] = []) {
  if (!a.length || !b.length || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / Math.sqrt(normA * normB);
}
