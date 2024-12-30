
// src/app/api/categories/route.js
import { query } from "../../../utils/database";
import { ine_Logs_ModuleID, ine_logs_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../utils/commonFunction";
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_logs_tablename;

// POST METHOD
export const POST = async (req) => {
    try {
        await authenticateToken(req);
        const requestData = await req.json();

        // Validate request data
        if (!requestData.name || !requestData.code) {
            return sendResponse({ error: 'Name and code fields are required', status: false }, 400);
        }
        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (name, description, code, pair) VALUES (?, ?, ?, ?)`, [
            requestData.name,
            requestData.description || null, // Use null for optional fields
            requestData.code,
            requestData.pair || 'No'
        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        // await activityLog(ine_Logs_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

        return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

export const GET = async (req) => {
    try {
        await authenticateToken(req);
        const sqlQuery = `
        SELECT
            t.*,
            im.name AS module_name,
            u.username AS operation_by_username,
            u.email AS operation_by_email
        FROM
            ${tableName} t
        LEFT JOIN
            ine_modules im ON t.module_id = im.id
        LEFT JOIN
            ine_users u ON t.operation_by = u.id
        ORDER BY
            t.created_at DESC
        `;

        // Execute the SQL query
        const results = await query(sqlQuery); // Adjust this function according to your backend setup

        // Return the response based on the query results
        if (results && results.length > 0) {
            return sendResponse({ data: results, message: 'Data fetched successfully', status: true, count: results.length }, 200);
        } else {
            return sendResponse({ error: 'No data found', status: false }, 404);
        }
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

        const { name, description, code, pair } = await req.json();

        await query(`UPDATE ${tableName} SET name = ?, description = ?, code = ?, pair = ?, updated_at = NOW() WHERE id = ?`, [name, description, code, pair, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        // await activityLog(ine_Logs_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

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
            activityLog(ine_Logs_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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