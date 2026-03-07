const OpenAI = require('openai');

const DEFAULT_DIM = 384;
const OPENAI_EMBED_MODEL = 'text-embedding-3-small';

function getProvider() {
  return (process.env.EMBEDDING_PROVIDER || 'local').trim().toLowerCase();
}

function getEmbeddingDim() {
  const value = Number(process.env.EMBEDDING_DIM || DEFAULT_DIM);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_DIM;
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function hashToken(token, seed) {
  let hash = 2166136261 ^ seed;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalize(vec) {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (!norm) {
    return vec;
  }
  return vec.map((v) => v / norm);
}

function createLocalEmbedding(text, dim = getEmbeddingDim()) {
  const vec = new Array(dim).fill(0);
  const tokens = tokenize(text);

  for (const token of tokens) {
    const h1 = hashToken(token, 17);
    const h2 = hashToken(token, 31);
    const i1 = h1 % dim;
    const i2 = h2 % dim;

    vec[i1] += 1;
    vec[i2] -= 0.5;
  }

  return normalize(vec);
}

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing.');
  }

  return new OpenAI({ apiKey });
}

async function createOpenAIEmbedding(text) {
  const client = createOpenAIClient();
  const response = await client.embeddings.create({
    model: OPENAI_EMBED_MODEL,
    input: text,
  });

  const vector = response?.data?.[0]?.embedding;
  if (!vector) {
    throw new Error('Embedding API returned no vector.');
  }

  return vector;
}

async function createEmbedding(text) {
  const provider = getProvider();

  if (provider === 'openai') {
    return createOpenAIEmbedding(text);
  }

  return createLocalEmbedding(text);
}

module.exports = {
  createEmbedding,
  getProvider,
};
