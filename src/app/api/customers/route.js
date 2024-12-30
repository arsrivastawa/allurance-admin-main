
// src/app/api/customers/route.js
import { query } from "../../../utils/database";
import { ine_customers_ModuleID, ine_users_tablename, ine_users_details_tablename, ine_roles_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, checkEmailExistOrNot, checkPhoneExistOrNot, validatePassword, processDocuments } from "../../../utils/commonFunction";
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_users_tablename;
const tableName2 = ine_users_details_tablename;
const tableName3 = ine_roles_tablename;

const avatarFolderPath = 'public/assets/images/documents/avatar';
// Function to generate a unique user ID with today's date and a random number

const generateUniqueUserId = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(today.getDate()).padStart(2, '0');
    const datePart = `${year}${month}${day}`;

    let randomNumber;
    let userId;
    let userIdExists;

    do {
        // Generate a random number between 1000 and 9999
        randomNumber = Math.floor(Math.random() * 9000) + 1000;
        userId = `${datePart}${randomNumber}`;

        // Check if the generated user ID already exists in the database
        userIdExists = await checkUserIdExists(userId);
        // If the user ID exists, regenerate the random number
    } while (userIdExists);

    return userId;
};

// Function to check if a user ID already exists in the database
const checkUserIdExists = async (userId) => {
    // Perform database query to check if the user ID exists
    // Replace the following line with your database query
    // Example query: const result = await query('SELECT COUNT(*) AS count FROM users WHERE user_id = ?', [userId]);
    const result = await query('SELECT COUNT(*) AS count FROM ine_users WHERE customer_id = ?', [userId]);

    // Extract count from the result
    const count = result[0].count;

    // Return true if the user ID exists, false otherwise
    return count > 0;
};


// POST METHOD
export const POST = async (req) => {
    try {
        await authenticateToken(req);
        const requestData = await req.json();

        // Validate request data
        if (!requestData.first_name || !requestData.last_name || !requestData.email || !requestData.phone || !requestData.password) {
            return sendResponse({ error: 'First Name, Last Name, Email, Phone and Password field is required', status: false }, 400);
        }

        // Email Validation
        if (requestData.email) {
            const emailExists = await checkEmailExistOrNot(tableName, requestData.email);
            if (emailExists) {
                return sendResponse({ error: 'Email already exists', status: false }, 409);
            }
        }

        // Phone Validation
        if (requestData.phone) {
            if (requestData.phone.length !== 10) {
                return sendResponse({ error: 'Phone number must be 10 digits', status: false }, 400);
            }
            const phoneExists = await checkPhoneExistOrNot(tableName, requestData.phone);
            if (phoneExists) {
                return sendResponse({ error: 'Phone number already exists', status: false }, 409);
            }
        }

        // Password Validation
        if (!validatePassword(requestData.password)) {
            return sendResponse({ error: 'Password must be at least 9 characters long and contain at least one uppercase letter, one lowercase letter and one special character.', status: false }, 400);
        }

        // Hash the password
        const hashedPassword = requestData.password ? await bcrypt.hash(requestData.password, 10) : undefined;

        // await processDocument('avatar', requestData, avatarFolderPath); // Avatar Document
        requestData.avatar = await processDocuments(requestData.avatar); // Avatar Document

        requestData.record_status = requestData.record_status === 'active' ? 1 : 2;

        // Generate Customer ID
        const customerId = await generateUniqueUserId();

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (role_id, first_name, customer_id, last_name, email, phone, password, avatar, status) VALUES (?,?,?,?,?,?,?,?,?)`, [
            9, requestData.first_name, customerId, requestData.last_name, requestData.email, requestData.phone, hashedPassword, requestData.avatar, requestData.record_status
        ]);

        const insertedRecordId = insertResult.insertId;



        // User Details - Insertion
        await query(`INSERT INTO ${tableName2} (user_id, address, state, district, pincode, date_of_birth, anniversary) VALUES (?,?,?,?,?,?,?)`, [
            insertedRecordId, requestData.address, requestData.state, requestData.district, requestData.pincode, requestData.date_of_birth, requestData.anniversary,
        ]);

        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        // await activityLog(ine_customers_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

        return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// GET METHOD
export const GET = async (req) => {
    try {
        await authenticateToken(req);
        const id = getQueryParamId(new URL(req.url));
        const baseQuery = `SELECT u.*, u.status as record_status, ir.name as rolename, ud.date_of_birth, ud.anniversary, ud.gender, ud.address, ud.state, ud.district, ud.pincode, ud.govt_id_number, ud.govt_id_upload, ud.pan_number, ud.pan_upload FROM \`${tableName}\` as u LEFT JOIN \`${tableName2}\` as ud on ud.user_id = u.id LEFT JOIN \`${tableName3}\` as ir on ir.id = u.role_id where u.role_id = 9`;

        if (id) {
            const query1 = `${baseQuery} AND u.id = ? ORDER BY u.id DESC`;
            const results = await query(query1, [id]);

            if (results.length > 0) {
                return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const query2 = `${baseQuery} ORDER BY u.id DESC`;
        const results = await query(query2);

        if (results.length > 0) {
            return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
        }

        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// PUT METHOD
export const PUT = async (req) => {
    try {
        await authenticateToken(req);
        const id = getQueryParamId(new URL(req.url));

        if (!id) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }

        // Check if the ID exists in the database and retrieve the existing record
        const [existingRecord] = await getRecordById(id, tableName, 'id');

        /*if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }*/

        const { first_name, last_name, email, phone, password, address, state, district, pincode, avatar, date_of_birth, anniversary, record_status } = await req.json();

        // Validate request data
        if (!first_name || !last_name || !email || !phone) {
            return sendResponse({ error: 'First Name, Last Name, Email and Phone field is required', status: false }, 400);
        }

        if (email) {
            const emailExists = await checkEmailExistOrNot(tableName, email, id);
            if (emailExists) {
                return sendResponse({ error: 'Email already exists', status: false }, 409);
            }
        }

        // Phone Validation
        if (phone) {
            if (phone.length !== 10) {
                return sendResponse({ error: 'Phone number must be 10 digits', status: false }, 400);
            }
            const phoneExists = await checkPhoneExistOrNot(tableName, phone, id);
            if (phoneExists) {
                return sendResponse({ error: 'Phone number already exists', status: false }, 409);
            }
        }

        // var aimg = await processImageUpload('avatar', avatar, avatarFolderPath);
        var aimg = await processDocuments(avatar); // Avatar Document

        var rstatus = record_status;
        if (rstatus) {
            if (rstatus == 'active') {
                rstatus = 1;
            } else {
                rstatus = 2;
            }
        }

        // Build the query and parameter array based on the presence of password value
        let updateQuery = `UPDATE ${tableName} SET first_name = ?, last_name = ?, email = ?, phone = ?, avatar = ?, status = ?, updated_at = NOW()`;
        let queryParams = [first_name, last_name, email, phone, aimg, rstatus];

        // Check if the password field has a value, if yes, include it in the update query
        if (password !== undefined && password !== "") {

            // Password Validation
            if (!validatePassword(password)) {
                return sendResponse({ error: 'Password must be at least 9 characters long and contain at least one uppercase letter, one lowercase letter and one special character.', status: false }, 400);
            }

            // Hash the password
            const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

            updateQuery += `, password = ?`;
            queryParams.push(hashedPassword);
        }

        updateQuery += ` WHERE id = ?`;
        queryParams.push(id);

        await query(updateQuery, queryParams);

        await query(`UPDATE ${tableName2} SET address = ?, state = ?, district = ?, pincode = ?, date_of_birth = ?, anniversary = ? WHERE user_id = ?`, [address, state, district, pincode, date_of_birth, anniversary, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_customers_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// DELETE METHOD (Single or Multiple)
export const DELETE = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        const deletedIds = id ? [id] : getQueryParamIds(new URL(req.url));

        if (!deletedIds || deletedIds.length === 0) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }

        await Promise.all(deletedIds.map(async (deletedId) => {
            const [currentRecord] = await getRecordById(deletedId, tableName, 'id');
            activityLog(ine_customers_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
        }));

        const results = await query(`UPDATE ${tableName} SET status = 3, deleted_at = NOW() WHERE id IN (?)`, [deletedIds]);

        if (results.affectedRows > 0) {
            return sendResponse({ message: ManageResponseStatus('deleted'), status: true }, 200);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// Create - Image Process
async function processDocument(documentType, requestData, folderPath) {
    if (requestData && requestData[documentType] && requestData[documentType].imgData) {
        var fileName = `${documentType}_${Date.now().toString()}.png`;
        await writeImageToFile(fileName, requestData[documentType].imgData, folderPath);
        requestData[documentType] = fileName;
    }
}

// Updte - Image Process
async function processImageUpload(documentType, uploadData, folderPath) {
    if (uploadData && uploadData.imgData) {
        var fileName = `${documentType}_${Date.now().toString()}.png`;
        await writeImageToFile(fileName, uploadData.imgData, folderPath);
        return fileName;
    } else {
        return uploadData;
    }
}

// Store Image
const writeImageToFile = async (filename, imageData, folderPath) => {
    try {
        const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
        const fullPath = path.join(folderPath, filename);
        await fs.promises.writeFile(fullPath, base64Data, 'base64');
    } catch (error) {
        console.error(`Error writing image to file ${fullPath}: ${error.message}`);
    }
};