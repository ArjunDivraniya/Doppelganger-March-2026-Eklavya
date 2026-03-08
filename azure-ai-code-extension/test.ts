const { BlockBlobClient } = require('@azure/storage-blob');
const { ContainerClient } = require('@azure/storage-blob');
import { DefaultAzureCredential } from "@azure/identity";
// azure identity 
// Default Azure Identity
const credential = new DefaultAzureCredential();
// Automatically tries: Environment Variables → Managed Identity → VS Code → Azure CLI
// Use this instead of connection strings for production security.const credential = new DefaultAzureCredential();
const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
const credential = new DefaultAzureCredential();
const storageClient = new StorageClient(credential, process.env.AZURE_STORAGE_ACCOUNT_NAME);
const { BlobServiceClient } = require("@azure/storage-blob");
const { StorageClient } = require("@azure/storage-blob");
const blobServiceClient = new BlobServiceClient(`https://${storageAccountName}.blob.core.windows.net`, credential);
const containerClient = blobServiceClient.getContainerClient(containerName);
// [AzureAI Suggest]
// Make sure to install: npm install @azure/storage-blob @azure/identity
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  new DefaultAzureCredential()
);
const blobName = "myblob";
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadBlobResponse = await blockBlobClient.download();
  const blobContent = await streamToString(downloadBlobResponse_readableStream);
  console.log(blobContent); 
  function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
        chunks.push(data.toString());
      });
      readableStream.on("end", () => {
        resolve(chunks.join(""));
      });
      readableStream.on("error", reject);
    });
  }
  