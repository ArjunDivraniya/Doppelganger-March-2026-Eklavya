const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

const { ChromaClient } = require('chromadb');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), override: true });

const ROOT_DIR = path.resolve(__dirname, '..');
const CHUNKS_FILE = path.join(ROOT_DIR, 'dataset', 'chunks.json');
const COLLECTION_NAME = 'azure_docs';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 50;

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing.');
  }

  return new OpenAI({ apiKey });
}

function createChromaClient() {
  const configured = (process.env.CHROMA_DB_PATH || '').trim();
  const fallbackUrl = 'http://localhost:8000';
  const chromaUrl = /^https?:\/\//i.test(configured) ? configured : fallbackUrl;

  if (configured && chromaUrl === fallbackUrl && configured !== fallbackUrl) {
    console.warn(
      `[warn] CHROMA_DB_PATH="${configured}" is not a URL. Using ${fallbackUrl}. ` +
      'Set CHROMA_DB_PATH to your Chroma server endpoint.'
    );
  }

  const parsed = new URL(chromaUrl);
  const ssl = parsed.protocol === 'https:';
  const port = parsed.port ? Number(parsed.port) : ssl ? 443 : 8000;

  return new ChromaClient({
    host: parsed.hostname,
    port,
    ssl,
  });
}

async function loadChunks() {
  const raw = await fs.readFile(CHUNKS_FILE, 'utf8');
  const chunks = JSON.parse(raw);

  if (!Array.isArray(chunks)) {
    throw new Error(`Invalid chunks file format: ${CHUNKS_FILE}`);
  }

  return chunks;
}

async function getOrCreateCollection(chroma) {
  return chroma.getOrCreateCollection({ name: COLLECTION_NAME });
}

async function getIndexedIds(collection) {
  try {
    const result = await collection.get({ include: [] });
    return new Set(result?.ids || []);
  } catch (error) {
    console.warn(`[warn] Unable to load existing IDs, continuing without duplicate pre-check: ${error.message}`);
    return new Set();
  }
}

async function createEmbedding(openai, text) {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });

  const vector = response?.data?.[0]?.embedding;
  if (!vector) {
    throw new Error('Embedding API returned no vector.');
  }

  return vector;
}

function toBatches(items, size) {
  const batches = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

async function indexBatch({ batch, openai, collection, indexedIds }) {
  const ids = [];
  const documents = [];
  const metadatas = [];
  const embeddings = [];

  for (const chunk of batch) {
    if (!chunk?.id || !chunk?.text) {
      continue;
    }

    if (indexedIds.has(chunk.id)) {
      continue;
    }

    try {
      const embedding = await createEmbedding(openai, chunk.text);

      ids.push(chunk.id);
      documents.push(chunk.text);
      metadatas.push({
        source: chunk.source || 'unknown',
        type: chunk.type || 'documentation',
      });
      embeddings.push(embedding);
    } catch (error) {
      console.error(`[error] Failed embedding for chunk ${chunk.id}: ${error.message}`);
    }
  }

  if (!ids.length) {
    return { inserted: 0, skipped: batch.length };
  }

  await collection.add({
    ids,
    embeddings,
    documents,
    metadatas,
  });

  for (const id of ids) {
    indexedIds.add(id);
  }

  return { inserted: ids.length, skipped: batch.length - ids.length };
}

async function embedChunks() {
  console.log('[start] Embedding ingestion started');

  const chunks = await loadChunks();
  console.log(`[info] Loaded chunks: ${chunks.length}`);

  const openai = createOpenAIClient();
  const chroma = createChromaClient();
  const collection = await getOrCreateCollection(chroma);
  const indexedIds = await getIndexedIds(collection);

  console.log(`[info] Existing vectors in collection "${COLLECTION_NAME}": ${indexedIds.size}`);

  const batches = toBatches(chunks, BATCH_SIZE);
  let totalInserted = 0;

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    const { inserted } = await indexBatch({ batch, openai, collection, indexedIds });
    totalInserted += inserted;

    console.log(`[batch ${i + 1}/${batches.length}] Inserted ${inserted} vectors`);
  }

  console.log(`[done] Ingestion complete. Newly indexed: ${totalInserted}`);
}

if (require.main === module) {
  embedChunks().catch((error) => {
    console.error(`[fatal] Embedding ingestion failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  embedChunks,
};
