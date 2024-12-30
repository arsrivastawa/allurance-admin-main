
// src/app/api/mobilemasthead/route.js
import { query } from "../../../utils/database";
import { ine_mobile_masthead_ModuleID, ine_mobile_masthead_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, processDocument, processImageUpload } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_mobile_masthead_tablename;
const mastheadFolderPath = 'public/assets/images/masthead/mmasthead';

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.title || !requestData.image1) {
            return sendResponse({ error: 'Title and Image fields are required', status: false }, 400);
        }

        await processDocument('image1', requestData, mastheadFolderPath);

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (title, button_name, button_link, button_target, image1, description) VALUES (?, ?, ?, ?, ?, ?)`, [
            requestData.title,
            requestData.button_name,
            requestData.button_link,
            requestData.button_target,
            requestData.image1,
            requestData.description,
        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        await activityLog(ine_mobile_masthead_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

        return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// GET METHOD
export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        if (id) {
            const results = await getRecordById(id, tableName, 'id');
            if (results.length > 0) {
                return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const results = await getRecordById(null, tableName, 'id');
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

        const { title, button_name, button_link, button_target, image1, description } = await req.json();

        var image1Data = await processImageUpload('image1', image1, mastheadFolderPath);

        await query(`UPDATE ${tableName} SET title = ?, button_name = ?, button_link = ?, button_target = ?, image1 = ?, description = ?, updated_at = NOW() WHERE id = ?`, [title, button_name, button_link, button_target, image1Data, description, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_mobile_masthead_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

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
            activityLog(ine_mobile_masthead_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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