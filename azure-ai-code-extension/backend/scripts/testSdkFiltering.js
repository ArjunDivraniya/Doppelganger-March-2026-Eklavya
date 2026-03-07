const ragService = require('../src/services/ragService');
const contextAnalyzer = require('../src/services/contextAnalyzer');

async function testSdkFiltering() {
    console.log('=== Testing SDK-Specific Filtering ===\n');

    // Test 1: Blob Storage Query
    console.log('Test 1: Blob Storage Query');
    const blobQuery = 'Upload a file to Azure Blob Storage';
    const blobDocs = await ragService.retrieveRelevantDocs(blobQuery, { 
        sdkType: 'blob-storage',
        maxResults: 3 
    });
    console.log(`  Retrieved ${blobDocs.length} blob-storage docs`);
    console.log(`  Sample: ${blobDocs[0]?.substring(0, 100)}...\n`);

    // Test 2: Cosmos DB Query
    console.log('Test 2: Cosmos DB Query');
    const cosmosQuery = 'Query items from Cosmos DB container';
    const cosmosDocs = await ragService.retrieveRelevantDocs(cosmosQuery, { 
        sdkType: 'cosmos-db',
        maxResults: 3 
    });
    console.log(`  Retrieved ${cosmosDocs.length} cosmos-db docs`);
    if (cosmosDocs.length > 0) {
        console.log(`  Sample: ${cosmosDocs[0]?.substring(0, 100)}...\n`);
    } else {
        console.log(`  Note: No Cosmos DB docs found (expected if dataset only has blob storage)\n`);
    }

    // Test 3: Context Analysis + RAG
    console.log('Test 3: Complete Context Analysis + RAG');
    const context = {
        language: 'typescript',
        imports: ['@azure/storage-blob', '@azure/identity'],
        currentLine: 'const client = ',
        context: 'import { BlobServiceClient } from "@azure/storage-blob";'
    };
    
    const analysis = contextAnalyzer.analyze(context);
    console.log(`  Detected SDK: ${analysis.sdkType}`);
    console.log(`  Detected Intent: ${analysis.intent}`);
    
    const query = `${analysis.sdkType} ${analysis.intent} ${context.currentLine}`;
    const docs = await ragService.retrieveRelevantDocs(query, { 
        sdkType: analysis.sdkType 
    });
    console.log(`  Retrieved ${docs.length} filtered docs`);
    
    // Test 4: Cursor Position (new feature)
    console.log('\nTest 4: Cursor Position Support');
    const contextWithCursor = {
        ...context,
        cursorPosition: { line: 5, character: 17 }
    };
    const analysisWithCursor = contextAnalyzer.analyze(contextWithCursor);
    console.log(`  Cursor position accepted: ${contextWithCursor.cursorPosition ? 'YES' : 'NO'}`);
    console.log(`  Analysis still works: ${analysisWithCursor.sdkType !== 'unknown' ? 'YES' : 'NO'}`);

    console.log('\n=== All Tests Completed ===');
}

testSdkFiltering().catch((error) => {
    console.error(`[ERROR] ${error.message}`);
    process.exitCode = 1;
});
