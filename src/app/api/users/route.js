
// src/app/api/users/route.js
import { query } from "../../../utils/database";
import { ine_users_ModuleID, ine_users_tablename, ine_users_details_tablename, ine_roles_tablename, ine_my_referral_tablename, ine_settings_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, checkEmailExistOrNot, checkPhoneExistOrNot, validatePassword, processImageUpload, processDocument, processDocuments, isValidDate } from "../../../utils/commonFunction";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_users_tablename;
const tableName2 = ine_users_details_tablename;
const tableName3 = ine_roles_tablename;
const tableName4 = ine_my_referral_tablename;
const tableName5 = ine_settings_tablename;

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.first_name || !requestData.last_name || !requestData.email || !requestData.password || !requestData.role_id) {
            return sendResponse({ error: 'Role, First Name, Last Name, Email and Password field is required', status: false }, 400);
        }

        // Generate PreFix
        const [result1] = await query(`SELECT prefix FROM \`${tableName3}\` WHERE id = ? LIMIT 1`, [requestData.role_id]);
        const rolePrefixName = result1?.prefix || '';
        const [result2] = await query(`SELECT COUNT(*) as count FROM \`${tableName}\` WHERE role_id = ?`, [requestData.role_id]);
        const formattedNumber = String(result2?.count + 1).padStart(4, '0');
        const newPrefix = `${rolePrefixName}A${formattedNumber}`;


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

        const govt_id_upload = await processDocuments(requestData.govt_id_upload); // Government Document
        const pan_upload = await processDocuments(requestData.pan_upload); // Pancard Document
        const avatar = await processDocuments(requestData.avatar); // Avatar Document

        // Generate unique referral code
        const uniqueCode = uuidv4().slice(0, 8); // Generate a short UUID
        const referralCode = `${requestData.first_name}${requestData.last_name}${uniqueCode}`; // Combine first name, last name, and unique code

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (role_id, first_name, last_name, email, phone, password, avatar, prefix_id) VALUES (?,?,?,?,?,?,?,?)`, [
            requestData.role_id, requestData.first_name, requestData.last_name, requestData.email, requestData.phone, hashedPassword, avatar, newPrefix
        ]);

        const insertedRecordId = insertResult.insertId;

        // User Details - Insertion
        await query(`INSERT INTO ${tableName2} (user_id, address, state, district, pincode, govt_id_number, pan_number, govt_id_upload, pan_upload, my_referral_code) VALUES (?,?,?,?,?,?,?,?,?,?)`, [
            insertedRecordId, requestData.address, requestData.state, requestData.district, requestData.pincode, requestData.govt_id_number, requestData.pan_number, govt_id_upload, pan_upload, referralCode,
        ]);


        // Find refer_id if referral_code is provided
        let referId = null;
        if (requestData.referral_code) {
            const [referralUser] = await query(`SELECT id FROM ${tableName2} WHERE my_referral_code = ? LIMIT 1`, [requestData.referral_code]);
            if (referralUser) {
                referId = referralUser.id;
            }
        }

        let referAmt = 0;
        const [settingData] = await query(`SELECT referral_amount FROM ${tableName5} WHERE id = ? LIMIT 1`, [1]);
        if (settingData) {
            referAmt = settingData.referral_amount;
        }

        if (referId) {
            await query(`INSERT INTO ${tableName4} (user_id, refer_id, amount) VALUES (?,?,?)`, [
                insertedRecordId, referId, referAmt
            ]);
        }

        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        // await activityLog(ine_users_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

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
        const baseQuery = `SELECT u.*, ir.name as rolename, ud.date_of_birth, ud.anniversary, ud.gender, ud.address, ud.state, ud.district, ud.pincode, ud.govt_id_number, ud.govt_id_upload, ud.pan_number, ud.pan_upload, ud.my_referral_code FROM \`${tableName}\` as u LEFT JOIN \`${tableName2}\` as ud on ud.user_id = u.id LEFT JOIN \`${tableName3}\` as ir on ir.id = u.role_id where u.status = 1`;

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

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const { role_id, first_name, last_name, email, phone, password, gender, govt_id_number, pan_number, govt_id_upload, pan_upload, avatar, date_of_birth, anniversary, status } = await req.json();

        // Validate request data
        if (!first_name || !last_name || !email || !phone) {
            return sendResponse({ error: 'First Name, Last Name, Email and Phone field is required', status: false }, 400);
        }

        // Validate date_of_birth
        if (date_of_birth && !isValidDate(date_of_birth)) {
            return sendResponse({ error: 'Invalid Date of Birth', status: false }, 400);
        }

        // Validate anniversary
        if (anniversary && !isValidDate(anniversary)) {
            return sendResponse({ error: 'Invalid Anniversary', status: false }, 400);
        }

        // Email Validation
        if (email) {
            const emailExists = await checkEmailExistOrNot(tableName, email, id);
            if (emailExists) {
                return sendResponse({ error: 'Email already exists', status: false }, 409);
            }
        }

        // Phone Validation
        if (phone) {
            const phoneExists = await checkPhoneExistOrNot(tableName, phone, id);
            if (phoneExists) {
                return sendResponse({ error: 'Phone already exists', status: false }, 409);
            }
        }
        // Process image uploads only if imageData is present
        let gimg = govt_id_upload?.imageData ? await processImageUpload(govt_id_upload) : govt_id_upload;
        let pimg = pan_upload?.imageData ? await processImageUpload(pan_upload) : pan_upload;
        let aimg = avatar?.imageData ? await processImageUpload(avatar) : avatar;

        // Build the query and parameter array based on the presence of password value
        let updateQuery = `UPDATE ${tableName} SET role_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, avatar = ?, is_banned=?, updated_at = NOW()`;
        let queryParams = [role_id, first_name, last_name, email, phone, aimg, status];

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

        await query(`UPDATE ${tableName2} SET date_of_birth = ?, anniversary = ?, gender = ?, govt_id_number = ?, pan_number = ?, govt_id_upload = ?, pan_upload = ? WHERE user_id = ?`, [date_of_birth, anniversary, gender, govt_id_number, pan_number, gimg, pimg, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        // await activityLog(ine_users_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// DELETE METHOD (Single or Multiple)
export const DELETE = async (req) => {
    try {
        await authenticateToken(req);
        const id = getQueryParamId(new URL(req.url));
        const deletedIds = id ? [id] : getQueryParamIds(new URL(req.url));

        if (!deletedIds || deletedIds.length === 0) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }

        await Promise.all(deletedIds.map(async (deletedId) => {
            const [currentRecord] = await getRecordById(deletedId, tableName, 'id');
            activityLog(ine_users_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
        }));

        const results = await query(`UPDATE ${tableName} SET status = 2, deleted_at = NOW() WHERE id IN (?)`, [deletedIds]);

        if (results.affectedRows > 0) {
            return sendResponse({ message: ManageResponseStatus('deleted'), status: true }, 200);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};