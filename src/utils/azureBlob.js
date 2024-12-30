// const { BlobServiceClient } = require('@azure/storage-blob');

// const AZURE_STORAGE_ACCOUNT_URL = process.env.AZURE_STORAGE_ACCOUNT_URL;
// const SAS_TOKEN = "sp=racwdl&st=2024-07-03T05:35:08Z&se=2024-07-03T13:35:08Z&sv=2022-11-02&sr=c&sig=mG1US%2BpCA10U6taLAhk2QTa2e3KPG2StFT%2FbHiNpaTI%3D";

// if (!SAS_TOKEN) {
//     throw new Error('Azure Storage SAS token not found');
// }


// const blobServiceClient = new BlobServiceClient(`${AZURE_STORAGE_ACCOUNT_URL}?${SAS_TOKEN}`);
// const containerName = 'allurancefiles'; // Your container name
// const containerClient = blobServiceClient.getContainerClient(containerName);

// const uploadFileToBlob = async (fileName, fileContent) => {
//     const blockBlobClient = containerClient.getBlockBlobClient(fileName);
//     const uploadBlobResponse = await blockBlobClient.uploadData(fileContent);
//     return uploadBlobResponse;
// };

// module.exports = {
//     uploadFileToBlob,
// };


// import { BlobServiceClient } from "@azure/storage-blob";

// // Azure Blob Storage connection string and container name
// const AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=allurancetest;AccountKey=09jnF91BR+g+GAzzEJ9st2Jjxm5UILigQOeU3hGAXIxGNUTsOkIiKjztdPSLrWylacpevGD57tiI+AStENbbRQ==;EndpointSuffix=core.windows.net';
// const containerName = process.env.AZURE_CONTAINER_NAME;

// // Create BlobServiceClient object using connection string
// const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// // Function to upload file to Azure Blob Storage
// export const uploadFileToBlob = async (filename, buffer, folderPath) => {
//     try {
//         const containerClient = blobServiceClient.getContainerClient(containerName);
//         const blobName = `${folderPath}/${filename}`; // Construct blob name with folder path

//         // Create a blob client using the blob name
//         const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//         // Upload file to Azure Blob Storage
//         const uploadResponse = await blockBlobClient.uploadData(buffer, {
//             blobHTTPHeaders: {
//                 blobContentType: getContentType(filename)
//             }
//         });

//         // Construct and return the blob URL
//         const blobUrl = blockBlobClient.url;
//         return blobUrl;
//     } catch (error) {
//         console.error(`Error uploading file to Azure Blob Storage: ${error.message}`);
//         throw error;
//     }
// };

// // Helper function to determine content type based on file extension
// const getContentType = (filename) => {
//     const extension = filename.split('.').pop().toLowerCase();
//     switch (extension) {
//         case 'png':
//             return 'image/png';
//         case 'jpg':
//         case 'jpeg':
//             return 'image/jpeg';
//         case 'mp4':
//             return 'video/mp4';
//         default:
//             return 'application/octet-stream';
//     }
// };




// export default async function handler(req, res) {
//     if (req.method !== 'POST') {
//         return res.status(405).end();
//     }
//     // Get your connection string from env variables or other secure sources
//     const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
//     const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
//     const containerName = 'allurancefiles';
//     const containerClient = blobServiceClient.getContainerClient(containerName);
//     // Create a blob (file) name
//     const blobName = 'your-blob-name';
//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//     // Upload data to the blob

//     const data = req.body; // Assuming you're sending the data as a buffer or string

//     const uploadBlobResponse = await blockBlobClient.upload(data, data.length);

//     res.status(200).send(`Upload block blob ${blobName} successfully: ${uploadBlobResponse.requestId}`);

// }
