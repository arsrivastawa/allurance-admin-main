
// src/app/api/sizeforshape/route.js
import { query } from "../../../utils/database";
import { ine_size_for_shape_ModuleID, ine_size_for_shape_tablename, ine_shape_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../utils/commonFunction";
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_size_for_shape_tablename;
const tableName2 = ine_shape_tablename;

// POST METHOD
export const POST = async (req) => {
    try {
        await authenticateToken(req);
        const requestData = await req.json();

        // Validate request data
        if (!requestData.length || !requestData.breadth || !requestData.shape_id) {
            return sendResponse({ error: 'Shape ID, Length and Breadth fields are required', status: false }, 400);
        }

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (length, description, breadth, shape_id,created_by) VALUES (?, ?, ?, ?,?)`, [
            requestData.length,
            requestData.description || null, // Use null for optional fields
            requestData.breadth,
            requestData.shape_id,
            requestData.apihitid
        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        await activityLog(ine_size_for_shape_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

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
        const baseQuery = `SELECT sfs.*, s.sequence_number, s.shape as shape_name FROM \`${tableName}\` as sfs LEFT JOIN \`${tableName2}\` as s on s.id = sfs.shape_id WHERE sfs.status = 1`;

        if (id) {
            const query1 = `${baseQuery} AND sfs.id = ? ORDER BY sfs.id DESC`;
            const results = await query(query1, [id]);

            if (results.length > 0) {
                return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const query2 = `${baseQuery} ORDER BY sfs.id DESC`;
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

        const { length, description, breadth, shape_id, apihitid } = await req.json();

        await query(`UPDATE ${tableName} SET length = ?, description = ?, breadth = ?, shape_id = ?,updated_by=?, updated_at = NOW() WHERE id = ?`, [length, description, breadth, shape_id, apihitid, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_size_for_shape_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

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
            activityLog(ine_size_for_shape_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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