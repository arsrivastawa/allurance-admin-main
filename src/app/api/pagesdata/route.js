
// src/app/api/pagesata/route.js
import { query } from "../../../utils/database";
import { ine_pages_ModuleID, ine_pages_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, ManageResponseStatus } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_pages_tablename;

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

        const { title, description } = await req.json();

        await query(`UPDATE ${tableName} SET title = ?, description = ?, updated_at = NOW() WHERE id = ?`, [title, description, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_pages_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
