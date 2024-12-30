import { NextResponse } from "next/server";
import { query } from "./database";
import { MODULES_MODULE_CHECK_ENDPOINT, UPLOAD_FILE_TO_AZURE, ine_logs_tablename } from "./apiEndPoints";
import fs from 'fs';
import path from 'path';
import { jwtDecode } from "src/auth/context/jwt/utils";
import bwipjs from "bwip-js";
import { uploadFileToBlob } from "./azureBlob";


// Fetch Single ID
export const getQueryParamId = (url) => new URL(url).searchParams.get('id');

// Fetch Multiple IDs
export const getQueryParamIds = (url) => {
    const idsString = url.searchParams.get('ids');
    return idsString ? idsString.split(',').map(id => parseInt(id, 10)) : [];
};
// Fetch Multiple IDs
export const getQueryParamCategoryIds = (url) => {
    const idsString = url.searchParams.get('categories');
    return idsString ? idsString.split(',').map(id => parseInt(id, 10)) : [];
};

export const getRecordById = async (id, tableName, orderBy) => {
    try {
        const condition = id != null ? 'AND id = ?' : '';
        return await query(`SELECT * FROM ${tableName} WHERE status = 1 ${condition} ORDER BY ${orderBy} DESC`, id ? [id] : []);
    } catch (error) {
        throw new Error(`Error fetching record by ID: ${error.message}`);
    }
};
export const getRecordByIdWithoutStatus = async (id, tableName, orderBy) => {
    try {
        const condition = id != null ? 'AND id = ?' : '';
        return await query(`SELECT * FROM ${tableName} WHERE ${condition}`, id ? [id] : []);
    } catch (error) {
        throw new Error(`Error fetching record by ID: ${error.message}`);
    }
};
export const getRecordsByReplicatorId = async (id, tableName, orderBy) => {
    try {
        const condition = id != null ? ' replicator_id = ?' : '';
        return await query(`SELECT * FROM ${tableName} WHERE ${condition} ORDER BY ${orderBy} DESC`, id ? [id] : []);
    } catch (error) {
        throw new Error(`Error fetching records by replicator ID: ${error.message}`);
    }
};

export const getRecordByuserId = async (id, tableName, orderBy) => {
    try {
        const condition = id != null ? 'AND created_by = ?' : '';
        return await query(`SELECT * FROM ${tableName} WHERE status = 1 ${condition} ORDER BY ${orderBy} DESC`, id ? [id] : []);
    } catch (error) {
        throw new Error(`Error fetching record by ID: ${error.message}`);
    }
};

export const getRecordBydesignerId = async (id, tableName, orderBy) => {
    try {
        const condition = id != null ? 'AND model_number = ?' : '';
        return await query(`SELECT * FROM ${tableName} WHERE status = 1 AND record_status = 2 ${condition} ORDER BY ${orderBy} DESC`, id ? [id] : []);
    } catch (error) {
        throw new Error(`Error fetching record by ID: ${error.message}`);
    }
};
export const getRecordByDesignerIdForReplicator = async (designer_id, tableName, orderBy) => {

    try {
        // Use a placeholder for the condition
        const condition = designer_id ? 'WHERE designer_id = ?' : '';
        // Adjust the query to use the correct column name for the condition
        return await query(`SELECT * FROM ${tableName} ${condition} ORDER BY ${orderBy} DESC`, designer_id ? [designer_id] : []);
    } catch (error) {
        throw new Error(`Error fetching record by designer ID: ${error.message}`);
    }
};

// Function to retrieve  records by giftcard_ID
export const getRecordsByGiftcardId = async (id, tableName) => {
    try {
        const condition = id ? 'WHERE giftcard_id = ?' : '';
        return await query(`SELECT * FROM ${tableName}  ${condition} `, id ? [id] : []);
    } catch (error) {
        throw new Error(`Error fetching record by ID: ${error.message}`);
    }
};

// Handle Response
export const sendResponse = (data, status, count = undefined, headers = { 'Content-Type': 'application/json' }) => {
    if (data.error) {
        return new NextResponse(JSON.stringify({ error: data.error, status: false }), { status, headers }); // If error is present in data, create a response with error message
    }

    const responseData = {
        ...data,
        ...(count && { count }), // Include count only if it is truthy
    };
    return new NextResponse(JSON.stringify(responseData), { status, headers });
};

// Manage API Response Status
export function ManageResponseStatus(action) {
    const defaultTitles = {
        created: 'Record Successfully Created',
        updated: 'Record Successfully Updated',
        deleted: 'Record Successfully Deleted',
        fetched: 'Record Successfully Fetched',
        alreadyDeleted: 'Record Already Deleted',
        notFound: 'Sorry, Record Not Found',
        error: 'Something Went Wrong!',
        exist: 'Record Already Exist!',
        RowIdRequired: 'RowID must be required',
    };
    return defaultTitles[action];
}

// Manange API Operations
export const ManageAPIsData = async (apiUrl, fetchMethod, data = {}, accessToken = '') => {
    const requestOptions = {
        method: fetchMethod,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` // Add the Authorization header
        },
    };

    // Only include the body for non-GET and non-DELETE requests
    if (fetchMethod !== 'GET' && fetchMethod !== 'DELETE') {
        requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(apiUrl, requestOptions);
    return response;
}
export const ManageAPIsDataWithHeader = async (apiUrl, fetchMethod, data = {}) => {
    let { headers, ...bodyData } = data;
    headers = {
        'Content-Type': 'application/json',
        ...headers
    };
    const requestOptions = {
        method: fetchMethod,
        headers: headers
    };
    if (data.headers) {
        delete data.headers;
    }
    // Only include the body for non-GET and non-DELETE requests
    if (fetchMethod !== 'GET' && fetchMethod !== 'DELETE') {
        requestOptions.body = JSON.stringify(bodyData);
    }
    const response = await fetch(apiUrl, requestOptions);
    return response;
}

export const ManageAPIsDataWithFile = async (apiUrl, fetchMethod, data = {}) => {
    const formData = new FormData();
    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            if (data[key] instanceof File) {
                formData.append(key, data[key]);
            } else {
                formData.append(key, data[key]);
            }
        }
    }

    // Debug: Log the FormData entries
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }
    
    const requestOptions = {
        method: fetchMethod,
        body: formData,
        credentials: 'include'
    };
    // Only include the body for non-GET and non-DELETE requests
    /* if (fetchMethod !== 'GET' && fetchMethod !== 'DELETE') {
        //requestOptions.body = JSON.stringify(bodyData);
        requestOptions.body = formData
    } */
    const response = await fetch(apiUrl, requestOptions);
    return response;
}

export const ManageAPIsDataWithHeaderWithFiles = async (apiUrl, fetchMethod, formData = {}) => {
    const requestOptions = {
        method: fetchMethod,
        body: formData
    };
    try {
        const response = await fetch(apiUrl, requestOptions);
        return response;
    } catch (error) {
        console.error('Error making API request:', error);
        throw error;
    }
}



// Manage activity Log
export const activityLog = async (moduleID, prevData, newData, Operation, OperationBy) => {
    try {
        const pDataJson = prevData ? JSON.stringify(prevData) : null;
        const nDataJson = newData ? JSON.stringify(newData) : null;
        await query(`
            INSERT INTO ${ine_logs_tablename}
            (module_id, prev_data, new_data, operation, operation_by)
            VALUES (?,?,?,?,?)`,
            [moduleID, pDataJson, nDataJson, Operation, OperationBy]
        );
    } catch (error) {
        throw new Error(`Error logging activity: ${error.message}`);
    }
}

// Check email exists or not
export const checkEmailExistOrNot = async (tableName, email, ID = null) => {
    try {
        let sql = 'SELECT * FROM ' + tableName + ' WHERE email = ?';
        const values = [email];

        if (ID !== null) {
            sql += ' AND id != ?';
            values.push(ID);
        }

        const rows = await query(sql, values);
        return !!rows.length; // Returns true if email exists, false otherwise
    } catch (error) {
        console.error('Error occurred while checking email:', error);
        throw new Error('Failed to check email existence');
    }
}

// Check phone exists or not
export const checkPhoneExistOrNot = async (tableName, phone, ID = null) => {
    try {
        let sql = 'SELECT * FROM ' + tableName + ' WHERE phone = ?';
        const values = [phone];

        if (ID !== null) {
            sql += ' AND id != ?';
            values.push(ID);
        }

        const rows = await query(sql, values);
        return !!rows.length; // Returns true if phone exists, false otherwise
    } catch (error) {
        console.error('Error occurred while checking phone:', error);
        throw new Error('Failed to check phone existence');
    }
}

// Password validation - Password must be at least 9 characters long and contain at least one uppercase letter, one lowercase letter and one special character.
export function validatePassword(password) {
    // Minimum length check
    if (password.length < 9) {
        return false;
    }

    // Uppercase, lowercase, and special characters check
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const specialCharactersRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    const hasUppercase = uppercaseRegex.test(password);
    const hasLowercase = lowercaseRegex.test(password);
    const hasSpecialCharacters = specialCharactersRegex.test(password);

    // Check if all conditions are met
    return hasUppercase && hasLowercase && hasSpecialCharacters;
}

// // Store Video
// // Update - Image Process
// export async function processImageUpload(documentType, uploadData, folderPath) {
//     if (uploadData && uploadData.imgData) {
//         var fileName = `${documentType}_${Date.now().toString()}.png`;
//         await writeImageToFile(fileName, uploadData.imgData, folderPath);
//         return fileName;
//     } else {
//         return uploadData;
//     }
// }
// // DOCUMENTS PROCESS
// export async function processDocuments(image, folderPath) {
//     try {
//         if (image && image.preview && image.imageData) {
//             const fileName = `${Date.now().toString()}.png`;
//             await writeImageToFiles(fileName, image.imageData, folderPath);
//             return fileName;
//         }
//     } catch (error) {
//         console.error(`Error processing image: ${error.message}`);
//         throw error;
//     }
// }
// // Create - Image Process
// export async function processDocument(documentType, requestData, folderPath) {
//     if (requestData && requestData[documentType] && requestData[documentType].imgData) {
//         var fileName = `${documentType}_${Date.now().toString()}.png`;
//         await writeImageToFile(fileName, requestData[documentType].imgData, folderPath);
//         requestData[documentType] = fileName;
//     }
// }
// // Store Image
// export const writeImageToFile = async (filename, imageData, folderPath) => {
//     const fullPath = path.join(folderPath, filename);
//     try {
//         const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
//         await fs.promises.writeFile(fullPath, base64Data, 'base64');
//     } catch (error) {
//         console.error(`Error writing image to file ${fullPath}: ${error.message}`);
//     }
// };
// // Store Image
// export const writeImageToFiles = async (filename, imageData, folderPath) => {
//     const fullPath = path.join(folderPath, filename);
//     try {
//         const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
//         await fs.promises.writeFile(fullPath, base64Data, 'base64');
//         console.log(`Image successfully written to ${fullPath}`);
//         console.log("fullPathfullPathfullPath", fullPath)
//         return fullPath;
//     } catch (error) {
//         console.error(`Error writing image to file ${fullPath}: ${error.message}`);
//         throw error;
//     }
// };
// // Store Video
// export const writeVideoToFiles = async (filename, videoData, folderPath) => {
//     try {
//         const base64Data = videoData.replace(/^data:video\/\w+;base64,/, '');
//         const fullPath = path.join(folderPath, filename);
//         await fs.promises.writeFile(fullPath, base64Data, 'base64');
//         console.log(`Video successfully written to ${fullPath}`);
//         return fullPath;
//     } catch (error) {
//         console.error(`Error writing video to file ${fullPath}: ${error.message}`);
//         throw error;
//     }
// };
// Create - Image Process

// UPLOAD ON THE AZURE
// export async function processDocument(documentType, requestData) {
//     if (requestData && requestData[documentType] && requestData[documentType].imgData) {
//         const fileName = `${documentType}_${Date.now().toString()}.png`;
//         const blobUrl = await writeImageToFile(fileName, requestData[documentType].imgData);
//         requestData[documentType] = blobUrl;
//     }
// }


// export async function processDocuments(image) {
//     try {
//         if (image && image.preview && image.imageData) {
//             const fileName = `${Date.now().toString()}.png`;
//             const blobUrl = await writeImageToFile(fileName, image.imageData);
//             console.log("Blob URL:", blobUrl);
//             return blobUrl;
//         }
//     } catch (error) {
//         console.error(`Error processing image: ${error.message}`);
//         throw error;
//     }
// }


// export const writeVideoToFiles = async (filename, videoData) => {
//     try {
//         const base64Data = videoData.replace(/^data:video\/\w+;base64,/, '');
//         const buffer = Buffer.from(base64Data, 'base64');
//         const blobUrl = await uploadFileToBlob(filename, buffer);
//         console.log(`Video successfully uploaded to Azure Blob Storage: ${blobUrl}`);
//         return blobUrl;
//     } catch (error) {
//         console.error(`Error uploading video to Azure Blob Storage: ${filename}: ${error.message}`);
//         throw error;
//     }
// };

// export async function processImageUpload(documentType, uploadData) {
//     if (uploadData && uploadData.imgData) {
//         const fileName = `${documentType}_${Date.now().toString()}.png`;
//         const blobUrl = await writeImageToFile(fileName, uploadData.imgData);
//         return blobUrl;
//     } else {
//         return uploadData;
//     }
// }

// // Store Image
// export const writeImageToFile = async (filename, imageData) => {
//     try {
//         const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
//         const buffer = Buffer.from(base64Data, 'base64');
//         const blobUrl = await uploadFileToBlob(filename, buffer);
//         console.log(`Image successfully uploaded to Azure Blob Storage: ${blobUrl}`);
//         return blobUrl;
//     } catch (error) {
//         console.error(`Error uploading image to Azure Blob Storage: ${filename}: ${error.message}`);
//         throw error;
//     }
// };

// // Store Video
// export const writeVideoToFile = async (filename, videoData) => {
//     try {
//         const base64Data = videoData.replace(/^data:video\/\w+;base64,/, '');
//         const buffer = Buffer.from(base64Data, 'base64');
//         const blobUrl = await uploadFileToBlob(filename, buffer);
//         console.log(`Video successfully uploaded to Azure Blob Storage: ${blobUrl}`);
//         return blobUrl;
//     } catch (error) {
//         console.error(`Error uploading video to Azure Blob Storage: ${filename}: ${error.message}`);
//         throw error;
//     }
// };


// Function to upload file to Azure via API


// const uploadFileToAzureAPI = async (base64Data) => {
//     try {
//         const response = await fetch(UPLOAD_FILE_TO_AZURE, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ base64Data })
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         return data.blobUrl;
//     } catch (error) {
//         console.error(`Error uploading file to Azure via API: ${error.message}`);
//         throw error;
//     }
// };

const uploadFileToAzureAPI = async (base64Data) => {
    try {
        // Check if base64Data is already wrapped in an object with the imageData key
        const payload = typeof base64Data === 'object' && base64Data.imageData
            ? { base64Data }
            : { base64Data: { imageData: base64Data } };
        const response = await fetch(UPLOAD_FILE_TO_AZURE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.blobUrl;
    } catch (error) {
        console.error(`Error uploading file to Azure via API: ${error.message}`);
        throw error;
    }
};


// Store Image
export const writeImageToFile = async (imageData) => {
    try {
        const blobUrl = await uploadFileToAzureAPI(imageData);
        return blobUrl;
    } catch (error) {
        console.error(`Error uploading image to Azure Blob Storage: ${error.message}`);
        throw error;
    }
};

// Store Video
export const writeVideoToFile = async (videoData) => {
    try {
        const blobUrl = await uploadFileToAzureAPI(videoData);
        return blobUrl;
    } catch (error) {
        console.error(`Error uploading video to Azure Blob Storage: ${error.message}`);
        throw error;
    }
};

export const writeVideoToFiles = async (filename, videoData) => {
    try {
        // const base64Data = videoData.replace(/^data:video\/\w+;base64,/, '');
        const buffer = Buffer.from(videoData, 'base64');
        const blobUrl = await uploadFileToAzureAPI(buffer);
        return blobUrl;
    } catch (error) {
        console.error(`Error uploading video to Azure Blob Storage: ${filename}: ${error.message}`);
        throw error;
    }
};

export const writeImageToFiles = async (filename, imageData, folderPath) => {
    const fullPath = path.join(folderPath, filename);
    try {
        const blobUrl = await uploadFileToAzureAPI(imageData);
        return blobUrl;
    } catch (error) {
        console.error(`Error writing image to file ${imageData}: ${error.message}`);
        throw error;
    }
};

// Process Document
export async function processDocument(documentType, requestData) {
    if (requestData && requestData[documentType] && requestData[documentType].imageData) {
        const blobUrl = await writeImageToFile(requestData[documentType].imageData);
        requestData[documentType] = blobUrl;
    }
}

// Process Documents
export async function processDocuments(image) {
    try {
        if (image && image.preview && image.imageData) {
            const blobUrl = await writeImageToFile(image.imageData);
            return blobUrl;
        }
    } catch (error) {
        console.error(`Error processing image: ${error.message}`);
        throw error;
    }
}

// Process Image Upload
export async function processImageUpload(uploadData) {
    if (uploadData && uploadData.imageData) {
        // const fileName = `${documentType}_${Date.now().toString()}.png`;
        const blobUrl = await writeImageToFile(uploadData.imageData);
        return blobUrl;
    } else {
        return uploadData;
    }
}


// Frontend: Generic function to fetch data from API
export const fetchDataFromApi = async (apiUrl, method, data) => {
    try {
        const response = await ManageAPIsData(apiUrl, method, data);

        if (!response.ok) {
            console.error("Error fetching data:", response.statusText);
            return null;
        }

        const responseData = await response.json();
        return responseData.data || [];
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

// Frontend: Image convert in base64
export const createImageOption = async (data, fieldName) => {
    try {
        if (data && data[fieldName]) {
            const readableStream = data[fieldName].stream();
            const reader = readableStream.getReader();
            const chunks = [];
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                chunks.push(value);
            }
            const imageData = new Blob(chunks);
            const base64ImageData = await blobToBase64(imageData);
            return base64ImageData;
        } else {
            return '';
        }
    } catch (error) {
        console.error("Error in createImageOption:", error);
        return ''; // or handle the error in an appropriate way
    }
};

// Frontend: Image convert in base64
export const createImageOptions = async (image) => {
    try {
        console.log('reacjhing here',image);
        const response = await fetch(image.preview); // Fetch image data
        const blob = await response.blob(); // Convert response to Blob
        //const base64ImageData = await blobToBase64(blob); // Convert Blob to base64
        // Include both the image data and the path/preview in the returned object
        const file = new File([blob], 'image-file', { type: blob.type });
        return file;

        return {
            imageData: base64ImageData,
            path: image.path,
            preview: image.preview
        };
    } catch (error) {
        console.error("Error in createImageOptions:", error);
        return {}; // or handle the error in an appropriate way
    }
};

export const createFileOptions = async (file) => {

    try {
        const response = await fetch(file.preview); // Fetch file data
        const blob = await response.blob(); // Convert response to Blob
        const base64FileData = await blobToBase64(blob); // Convert Blob to base64
        return {
            imageData: base64FileData,
            path: file.path,
            preview: file.preview
        };
    } catch (error) {
        console.error("Error in createFileOptions:", error);
        return {}; // or handle the error in an appropriate way
    }
};

const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            // Ensure the reader result is a data URL
            if (typeof reader.result === 'string' && reader.result.startsWith('data')) {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert blob to base64: invalid result.'));
            }
        };

        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// // Frontend: Utility function to convert Blob to base64
// const blobToBase64 = (blob) => {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.onerror = reject;
//         reader.readAsDataURL(blob);
//     });
// };

// Frontend: Utility function to convert Blob to base64



export const getStatusLabelColor = (recordStatus) => {
    switch (recordStatus) {
        case 1:
            return 'secondary';
        case 2:
            return 'success';
        case 3:
            return 'error';
        default:
            return 'default';
    }
};

export const getStatusLabelText = (recordStatus) => {
    switch (recordStatus) {
        case 1:
            return 'Pending';
        case 2:
            return 'Approved';
        case 3:
            return 'Rejected';
        default:
            return 'Unknown';
    }
};

// Set local storage
export const setItemLocalStorage = (key, value) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// Get local storage
export const getItemLocalStorage = (key) => {
    if (typeof window !== 'undefined') {
        const storedItem = localStorage.getItem(key);
        return storedItem ? JSON.parse(storedItem) : null;
    }
    return null;
};

export const getModulePermissions = async (moduleId) => {
    const apiUrl = MODULES_MODULE_CHECK_ENDPOINT;
    try {
        let RoleID;
        const STORAGE_KEY = 'accessToken';
        let accessToken;

        // Check if sessionStorage is available before trying to access it
        if (typeof sessionStorage !== 'undefined') {
            accessToken = sessionStorage.getItem(STORAGE_KEY);
            // Check if accessToken is not undefined before decoding
        } else {
            console.error("sessionStorage is not available in this environment.");
        }
        let decoded;
        if (accessToken != null && accessToken !== undefined) {
            decoded = jwtDecode(accessToken);
            RoleID = decoded.data.role_id;
        } else {
            // console.error("accessToken is undefined. Cannot decode.");
        }
        const body = { role_id: RoleID }; // Construct the body object
        const responseData = await fetchDataFromApi(`${apiUrl}?id=${moduleId}`, 'POST', body);
        if (responseData && responseData.length > 0) {
            const firstElement = responseData[0];
            const { read_access, add_access, update_access, delete_access } = firstElement;
            return { read_access, add_access, update_access, delete_access }; // Return access permissions from the first element
        } else {
            return { read_access: 0, add_access: 0, update_access: 0, delete_access: 0 };
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// Slug - Function to generate a unique slug
export async function generateUniqueSlug(modelName, name, ID) {
    let slug = formatName(name);
    let count = 1;

    while (await checkSlugExistence(modelName, slug, ID)) {
        slug = `${formatName(name)}-${count}`;
        count++;
    }

    return slug;
}

// Slug = Remove space, special characters (Regex)
export function formatName(name) {
    return name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
}

// Slug - Function to check if the slug exists in the database
export async function checkSlugExistence(modelName, slug, ID = null) {
    try {
        let condition = 'WHERE slug = ?';
        const params = [slug];

        if (ID !== null) {
            condition += ' AND id <> ?';
            params.push(ID);
        }

        const sql = `SELECT * FROM ${modelName} ${condition}`;
        const data = await query(sql, params);

        return !!data.length; // Returns true if slug exists, false otherwise
    } catch (error) {
        throw new Error(`Error checking slug existence: ${error.message}`);
    }
}

// Generate Order ID
export function generateSeriesId(series) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${series}-${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Generate OTP
export function generateOTP(digits) {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
}



export function generateOrderId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `ORD-${year}${month}${day}${hours}${minutes}${seconds}`;
}


export const generateBarcodeUrl = (data) => {
    try {
        let svg = bwipjs.toSVG({
            bcid: 'code128',       // Barcode type
            text: data,            // Text to encode
            height: 12,            // Bar height, in millimeters
            includetext: true,     // Show human-readable text
            textxalign: 'center',  // Text alignment
            textsize: 12,          // Text size, in points
            textcolor: 'ff0000',   // Text color
        });
        return svg;
    } catch (e) {
        console.error("Error generating barcode:", e);
        return null;
    }
};

export const convertSvgToPng = async (svg) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const image = new Image();

        image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);

            canvas.toBlob((blob) => {
                resolve(URL.createObjectURL(blob));
            }, 'image/png');
        };

        image.onerror = (error) => {
            reject(error);
        };

        image.src = 'data:image/svg+xml;base64,' + btoa(svg);
    });
};

export const getUserByPhoneNumber = async (phoneNumber, tableName) => {
    try {
        // Query to fetch user details by phone number
        return await query(`SELECT prefix_id ,id,customer_id ,first_name ,last_name ,email ,phone FROM ${tableName} WHERE phone = ?`, [phoneNumber]);
    } catch (error) {
        throw new Error(`Error fetching user by phone number: ${error.message}`);
    }
};

export const insertUser = async (user, tableName) => {
    const { first_name, last_name, email, phone_number } = user;
    const insertQuery = `
        INSERT INTO ${tableName} (first_name, last_name, email, phone)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [first_name, last_name, email, phone_number];

    try {
        const res = await query(insertQuery, values);
        return res.rows[0];
    } catch (err) {
        console.error('Error inserting user:', err);
        throw err;
    }
};


export const insertOrUpdateRecordintoFrontend = async (targetTableName, fetchedData) => {
    const {
        id,
        designer_id,
        title,
        retail_price,
        description,
    } = fetchedData;

    // Check if the record exists in the target table
    const existingRecord = await query(`SELECT * FROM ${targetTableName} WHERE marketing_id = ?`, [id]);

    if (existingRecord.length === 0) {
        // Record does not exist, perform INSERT
        const insertResult = await query(
            `INSERT INTO ${targetTableName} (marketing_id, designer_id, name, price, short_description, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [id, designer_id, title, retail_price, description]
        );
        return { data: insertResult, message: "Inserted into frontend", status: 201 };
    } else {
        // Record exists, perform UPDATE
        const updateResult = await query(
            `UPDATE ${targetTableName} SET 
             designer_id = ?, 
             name = ?, 
             price = ?, 
             short_description = ?, 
             updated_at = NOW() 
             WHERE marketing_id = ?`,
            [designer_id, title, retail_price, description, id]
        );
        return { data: updateResult, message: "Updated in frontend", status: 200 };
    }
};


export const FetchUserDetail = async () => {
    const STORAGE_KEY = 'accessToken';
    const accessToken = sessionStorage.getItem(STORAGE_KEY);
    if (!accessToken) {
        return;
    }
    try {
        const decoded = jwtDecode(accessToken);
        const userdata = decoded?.data;
        if (userdata) {
            return userdata
        } else {
            console.error("User ID not logged in.");
        }
    } catch (error) {
        console.error("Error decoding token:", error);
    }
};

// Validate the Date Format
export const isValidDate = (dateString) => {
    // Check if the date format is correct (YYYY-MM-DD)
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
        return false;
    }

    // Parse the date parts to integers
    const parts = dateString.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // months are 0-11 in JavaScript
    const day = parseInt(parts[2], 10);

    // Check if the date is valid
    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
        return false;
    }

    // Check if the date is in the past
    const today = new Date();
    if (date > today) {
        return false;
    }

    // Check if the date is within a reasonable range (e.g., not more than 120 years ago)
    const minYear = today.getFullYear() - 120;
    if (year < minYear) {
        return false;
    }

    return true;
};

// Validate the date while fetching 
export const fetchFormatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Get the timezone offset in milliseconds
    const localDate = new Date(date.getTime() - timezoneOffset); // Adjust the date
    return localDate.toISOString().split('T')[0]; // Get the date part in YYYY-MM-DD format
};

