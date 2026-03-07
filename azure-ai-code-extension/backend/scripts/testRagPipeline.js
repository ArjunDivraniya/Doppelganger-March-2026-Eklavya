const ragService = require('../src/services/ragService');
const promptBuilder = require('../src/services/promptBuilder');
const llmService = require('../src/services/llmService');

const TEST_QUERY = 'Upload a file to Azure Blob using DefaultAzureCredential';

function validateSuggestion(suggestion) {
  const required = ['BlobServiceClient', 'DefaultAzureCredential', 'containerClient', 'upload'];
  const missing = required.filter((term) => !suggestion.toLowerCase().includes(term.toLowerCase()));

  return {
    ok: missing.length === 0,
    missing,
  };
}

async function runTest() {
  console.log(`[test] Query: ${TEST_QUERY}`);

  const docs = await ragService.retrieveRelevantDocs(TEST_QUERY);
  console.log(`[test] Retrieved docs: ${docs.length}`);

  const prompt = promptBuilder.buildPrompt({
    userCode: '// Need code to upload a file to Blob Storage',
    retrievedDocs: docs,
  });

  const suggestion = await llmService.generate(`${prompt}\n\nUser Query: ${TEST_QUERY}`);

  const result = validateSuggestion(suggestion);
  if (!result.ok) {
    console.error(`[test] FAILED. Missing terms: ${result.missing.join(', ')}`);
    console.log('\nGenerated suggestion:\n');
    console.log(suggestion);
    process.exitCode = 1;
    return;
  }

  console.log('[test] PASSED. Suggestion contains required Azure SDK terms.');
  console.log('\nGenerated suggestion:\n');
  console.log(suggestion);
}

runTest().catch((error) => {
  console.error(`[test] ERROR: ${error.message}`);
  process.exitCode = 1;
});
