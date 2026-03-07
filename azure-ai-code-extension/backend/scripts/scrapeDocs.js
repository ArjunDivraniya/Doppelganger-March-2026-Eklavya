const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const axios = require('axios');
const cheerio = require('cheerio');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATASET_DIR = path.join(ROOT_DIR, 'dataset');
const DEFAULT_URLS_FILE = path.join(DATASET_DIR, 'urls.txt');
const LEGACY_URLS_FILE = path.join(ROOT_DIR, 'src', 'dataset', 'urls.txt');
const RAW_OUTPUT_FILE = path.join(DATASET_DIR, 'rawDocs.json');
const CHUNKS_OUTPUT_FILE = path.join(DATASET_DIR, 'chunks.json');

const CHUNK_SIZE = 500;

async function fileExists(filePath) {
	try {
		await fsp.access(filePath, fs.constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

async function resolveUrlsFilePath() {
	if (await fileExists(DEFAULT_URLS_FILE)) {
		return DEFAULT_URLS_FILE;
	}

	if (await fileExists(LEGACY_URLS_FILE)) {
		console.warn(
			`[warn] Using fallback URLs file: ${LEGACY_URLS_FILE}. Create ${DEFAULT_URLS_FILE} if you want the new layout.`
		);
		return LEGACY_URLS_FILE;
	}

	throw new Error(
		`URLs file not found. Expected one of:\n- ${DEFAULT_URLS_FILE}\n- ${LEGACY_URLS_FILE}`
	);
}

async function readUrlsLineByLine(filePath) {
	const urls = [];
	const seen = new Set();

	const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
	const reader = readline.createInterface({
		input: stream,
		crlfDelay: Infinity,
	});

	for await (const line of reader) {
		const value = line.trim();
		if (!value || value.startsWith('#')) {
			continue;
		}

		if (!seen.has(value)) {
			seen.add(value);
			urls.push(value);
		}
	}

	return urls;
}

function cleanWhitespace(text) {
	return text
		.replace(/\u00a0/g, ' ')
		.replace(/[\t\r\n]+/g, ' ')
		.replace(/\s{2,}/g, ' ')
		.trim();
}

function extractCodeSnippets($, $main) {
	const snippets = [];
	const seen = new Set();

	$main.find('pre, code').each((_, element) => {
		const code = $(element).text();
		const cleaned = code.replace(/\r\n/g, '\n').trim();

		if (!cleaned) {
			return;
		}

		// Skip tiny inline fragments that are rarely useful in retrieval.
		if (cleaned.length < 20 && !cleaned.includes('\n')) {
			return;
		}

		if (!seen.has(cleaned)) {
			seen.add(cleaned);
			snippets.push(cleaned);
		}
	});

	return snippets;
}

function extractMainContent($, $main) {
	const $contentRoot = $main.clone();

	// Strip common noisy blocks before text extraction.
	$contentRoot
		.find('script, style, noscript, nav, header, footer, aside, .feedback-section')
		.remove();

	// Keep code snippets separately; remove from prose content.
	$contentRoot.find('pre, code').remove();

	return cleanWhitespace($contentRoot.text());
}

function parseDocument(html, url) {
	const $ = cheerio.load(html);
	const title = cleanWhitespace($('title').first().text()) || url;
	const $main = $('main').first();

	if (!$main.length) {
		return {
			url,
			title,
			content: '',
			code_snippets: [],
			warning: 'No <main> element found',
		};
	}

	const codeSnippets = extractCodeSnippets($, $main);
	const content = extractMainContent($, $main);

	return {
		url,
		title,
		content,
		code_snippets: codeSnippets,
	};
}

async function fetchPage(url) {
	const response = await axios.get(url, {
		timeout: 30000,
		headers: {
			'User-Agent': 'AzureDocsRAGScraper/1.0 (+hackathon)',
			Accept: 'text/html,application/xhtml+xml',
		},
	});

	return response.data;
}

function chunkText(text, chunkSize = CHUNK_SIZE) {
	const normalized = cleanWhitespace(text);
	if (!normalized) {
		return [];
	}

	const chunks = [];
	let cursor = 0;

	while (cursor < normalized.length) {
		let end = Math.min(cursor + chunkSize, normalized.length);

		if (end < normalized.length) {
			const lastSentenceBreak = Math.max(
				normalized.lastIndexOf('. ', end),
				normalized.lastIndexOf('? ', end),
				normalized.lastIndexOf('! ', end)
			);
			const lastSpace = normalized.lastIndexOf(' ', end);

			if (lastSentenceBreak > cursor + Math.floor(chunkSize * 0.6)) {
				end = lastSentenceBreak + 1;
			} else if (lastSpace > cursor + Math.floor(chunkSize * 0.6)) {
				end = lastSpace;
			}
		}

		const piece = normalized.slice(cursor, end).trim();
		if (piece) {
			chunks.push(piece);
		}

		cursor = end;
	}

	return chunks;
}

function buildChunkId(url, chunkIndex) {
	const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 12);
	return `${hash}-${chunkIndex + 1}`;
}

function buildChunks(records, chunkSize = CHUNK_SIZE) {
	const chunks = [];

	for (const record of records) {
		const textToChunk = [record.title, record.content].filter(Boolean).join('\n\n');
		const pieces = chunkText(textToChunk, chunkSize);

		pieces.forEach((piece, index) => {
			chunks.push({
				id: buildChunkId(record.url, index),
				text: piece,
				source: record.url,
				type: 'documentation',
			});
		});
	}

	return chunks;
}

async function saveJson(filePath, payload) {
	await fsp.mkdir(path.dirname(filePath), { recursive: true });
	await fsp.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

async function scrapeDocs() {
	console.log('[start] Azure docs scraping started');

	const urlsFilePath = await resolveUrlsFilePath();
	const urls = await readUrlsLineByLine(urlsFilePath);

	if (!urls.length) {
		throw new Error(`No URLs found in ${urlsFilePath}`);
	}

	console.log(`[info] URLs loaded: ${urls.length}`);

	const records = [];
	let successCount = 0;
	let failCount = 0;

	for (let i = 0; i < urls.length; i += 1) {
		const url = urls[i];
		const prefix = `[${i + 1}/${urls.length}]`;

		try {
			console.log(`${prefix} Fetching ${url}`);
			const html = await fetchPage(url);
			const record = parseDocument(html, url);

			records.push(record);
			successCount += 1;

			console.log(
				`${prefix} Done | title="${record.title}" | chars=${record.content.length} | snippets=${record.code_snippets.length}`
			);
		} catch (error) {
			failCount += 1;
			console.error(`${prefix} Failed ${url}`);
			console.error(`       Reason: ${error.message}`);
		}
	}

	await saveJson(RAW_OUTPUT_FILE, records);
	console.log(`[save] Raw docs -> ${RAW_OUTPUT_FILE} (${records.length} records)`);

	const chunks = buildChunks(records, CHUNK_SIZE);
	await saveJson(CHUNKS_OUTPUT_FILE, chunks);
	console.log(`[save] Chunks -> ${CHUNKS_OUTPUT_FILE} (${chunks.length} chunks)`);

	console.log(`[done] Success=${successCount}, Failed=${failCount}`);
}

if (require.main === module) {
	scrapeDocs().catch((error) => {
		console.error('[fatal] Scraping failed:', error.message);
		process.exitCode = 1;
	});
}

module.exports = {
	scrapeDocs,
	readUrlsLineByLine,
	parseDocument,
	buildChunks,
	chunkText,
};
