# Azure Docs Scraper Guide

This document explains the dataset scraper used for the RAG pipeline.

## Script

- Path: `backend/scripts/scrapeDocs.js`
- Runtime: Node.js
- Dependencies: `axios`, `cheerio`, built-in `fs`, `path`, `readline`, `crypto`

## Purpose

The scraper reads Azure documentation URLs, extracts useful documentation text and code snippets, and writes two datasets:

1. Raw page-level documents (`rawDocs.json`)
2. Chunk-level documents (`chunks.json`) for embeddings/vector storage

## Input URL File

The script checks URL files in this order:

1. `backend/dataset/urls.txt` (preferred)
2. `backend/src/dataset/urls.txt` (fallback)

Notes:
- URLs are read line-by-line.
- Empty lines and `#` comment lines are ignored.
- Duplicate URLs are removed.

## Output Files

The script creates `backend/dataset` if it does not exist and writes:

- `backend/dataset/rawDocs.json`
- `backend/dataset/chunks.json`

## Raw Record Format

Each page is stored as:

```json
{
  "url": "https://learn.microsoft.com/...",
  "title": "Page title",
  "content": "cleaned documentation text from <main>",
  "code_snippets": [
    "code example 1",
    "code example 2"
  ]
}
```

## Chunk Record Format

Content is chunked to about 500 characters per chunk and stored as:

```json
{
  "id": "a1b2c3d4e5f6-1",
  "text": "chunk text",
  "source": "https://learn.microsoft.com/...",
  "type": "documentation"
}
```

## Extraction Behavior

- Fetches each URL with `axios`.
- Parses HTML using `cheerio`.
- Extracts content from `<main>`.
- Removes noisy elements (`script`, `style`, `nav`, `header`, `footer`, `aside`, etc.).
- Extracts code snippets from `<pre>` and `<code>` blocks.
- Cleans whitespace for stable indexing.

## Chunking Strategy

- Target chunk size: ~500 characters.
- Tries to split on sentence boundaries or spaces when possible.
- Includes page title + content in chunk source text.
- Chunk ID format is a stable URL hash + sequence index.

## Error Handling and Logging

- If one URL fails, the script logs the error and continues.
- Console logs include:
  - start
  - total URLs loaded
  - per-URL progress
  - save locations
  - success/failure summary

## Run

From `backend` folder:

```bash
node scripts/scrapeDocs.js
```

## Optional NPM Script

You can add this to `backend/package.json` if you want a shortcut:

```json
{
  "scripts": {
    "scrape:docs": "node scripts/scrapeDocs.js"
  }
}
```
