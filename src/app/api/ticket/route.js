
// src/app/api/ticket/route.js
import { query } from "../../../utils/database";
import { ine_tickets_ModuleID, ine_tickets_tablename, ine_users_tablename, ine_ticket_new_users_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, generateSeriesId } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_tickets_tablename;
const tableName2 = ine_users_tablename;
const tableName3 = ine_ticket_new_users_tablename;

// POST METHOD
export const POST = async (req) => {
    try {

        const requestData = await req.json();
        let newuserRecord = null;
        let user_type = 1;
        let userID = '';

        // Validate request data
        if (!requestData.subject_id || !requestData.title || !requestData.description) {
            return sendResponse({ error: 'Subject, Title and Description fields are required', status: false }, 400);
        }

        if (requestData.email) {
            const existingRecord = await query(`SELECT * FROM ${tableName2} WHERE email = ?`, [requestData.email]);
            if (existingRecord.length === 0) {
                const existingRecord1 = await query(`SELECT * FROM ${tableName3} WHERE email = ?`, [requestData.email]);
                if (existingRecord1.length === 0) {
                    newuserRecord = await query(`INSERT INTO ${tableName3} (first_name, last_name, email, phone) VALUES (?,?,?,?)`, [
                        requestData.first_name,
                        requestData.last_name,
                        requestData.email,
                        requestData.phone,
                    ]);
                    user_type = 2;
                    userID = newuserRecord.insertId;
                } else {
                    userID = existingRecord1[0].id;
                }
            } else {
                userID = existingRecord[0].id;
            }
        }

        var ticketID = generateSeriesId('TKT');

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (ticket_id, subject_id, user_type, user_id, title, description) VALUES (?,?,?,?,?,?)`, [
            ticketID,
            requestData.subject_id,
            user_type,
            userID,
            requestData.title,
            requestData.description,

        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        await activityLog(ine_tickets_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

        return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// GET METHOD
export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('user_id');
        const id = getQueryParamId(url);

        if (id) {
            const results = await query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
            if (results.length > 0) {
                const user = results[0];
                let userData;
                if (user.user_type === 1) {
                    userData = await query(`SELECT first_name, last_name, email FROM ${tableName2} WHERE id = ?`, [user.user_id]);
                } else if (user.user_type === 2) {
                    userData = await query(`SELECT first_name, last_name, email FROM ${tableName3} WHERE id = ?`, [user.user_id]);
                }
                if (userData && userData.length > 0) {
                    const { first_name, last_name, email } = userData[0];
                    return sendResponse({ data: { ...user, first_name, last_name, email }, message: ManageResponseStatus('fetched'), status: true }, 200);
                } else {
                    return sendResponse({ error: ManageResponseStatus('userNotFound'), status: false }, 404);
                }
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        let results;
        if (userId) {
            results = await query(`SELECT * FROM ${tableName} WHERE user_id = ? ORDER BY ID DESC`, [userId]);
        } else {
            results = await query(`SELECT * FROM ${tableName} ORDER BY ID DESC`);
        }

        // Processing data to get user details based on user_type
        const userDataPromises = results.map(async (user) => {
            let userData;
            if (user.user_type === 1) {
                userData = await query(`SELECT first_name, last_name, email FROM ${tableName2} WHERE id = ?`, [user.user_id]);
            } else if (user.user_type === 2) {
                userData = await query(`SELECT first_name, last_name, email FROM ${tableName3} WHERE id = ?`, [user.user_id]);
            }
            return { ...user, ...(userData ? userData[0] : {}) }; // Merge user data with userData
        });

        // Wait for all promises to resolve
        const userData = await Promise.all(userDataPromises);

        return sendResponse({ data: userData, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// PUT METHOD
export const PUT = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));

        if (!id) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }

        const [existingRecord] = await getRecordById(id, tableName, 'id');

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const { title, description } = await req.json();

        await query(`UPDATE ${tableName} SET title = ?, description = ?, updated_at = NOW() WHERE id = ?`, [title, description, id]);

        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_tickets_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

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
            activityLog(ine_tickets_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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