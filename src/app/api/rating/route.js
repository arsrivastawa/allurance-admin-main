
// src/app/api/rating/route.js
import { query } from "../../../utils/database";
import { ine_products_tablename, ine_rating_ModuleID, ine_rating_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_rating_tablename;
const tableName2 = ine_products_tablename;

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.name || !requestData.email || !requestData.description || !requestData.rating_no) {
            return sendResponse({ error: 'All fields must be required', status: false }, 400);
        }

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (user_id, product_id, name, email, description, rating_no) VALUES (?, ?, ?, ?, ?, ?)`, [
            requestData.user_id,
            requestData.product_id,
            requestData.name,
            requestData.email,
            requestData.description,
            requestData.rating_no
        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        await activityLog(ine_rating_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

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
            const results = await getRecordById(id, tableName, 'id');
            if (results.length > 0) {
                return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        let results;
        if (userId) {
            // results = await query(`SELECT * FROM ${tableName} WHERE user_id = ? ORDER BY ID desc`, [userId]);
            results = await query(`SELECT r.*, p.name as product_name 
                FROM ${tableName} r 
                LEFT JOIN ${tableName2} p ON p.id = r.product_id 
                WHERE r.user_id = ? 
                ORDER BY r.id DESC`, [userId]);
        } else {
            results = await getRecordById(null, tableName, 'id');
        }

        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
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

        // Check if the ID exists in the database and retrieve the existing record
        const [existingRecord] = await getRecordById(id, tableName, 'id');

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const { user_id, product_id, name, email, description, rating_no } = await req.json();

        await query(`UPDATE ${tableName} SET product_id = ?, name = ?, email = ?, description = ?, rating_no = ?, updated_at = NOW() WHERE id = ?`, [product_id, name, email, description, rating_no, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_rating_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

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
            activityLog(ine_rating_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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