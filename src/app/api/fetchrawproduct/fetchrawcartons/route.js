
// src/app/api/categories/route.js
import { query } from "../../../../utils/database";
import { ine_packers_ModuleID, ine_packers_boxes_tablename, ine_packers_carton_element_tablename, ine_packers_cartons_tablename, ine_replicator_tablename } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, ManageResponseStatus } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_packers_cartons_tablename;

export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        if (id) {
            const queryWithId = `SELECT * FROM ${tableName} WHERE rack_status = 0 OR rack_status = ?`;
            const resultsWithId = await query(queryWithId, [id]);
            return sendResponse({
                data: resultsWithId,
                message: ManageResponseStatus('fetched'),
                status: true
            }, 200);
        } else {
            // Fetch all records with rack_status = 0
            const queryWithoutId = `SELECT * FROM ${tableName} WHERE rack_status = 0`;
            const resultsWithoutId = await query(queryWithoutId);
            return sendResponse({
                data: resultsWithoutId,
                message: ManageResponseStatus('fetched'),
                status: true,
                count: resultsWithoutId.length
            }, 200);
        }
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
        const requestData = await req.json();
        const { title, status } = requestData;
        const [existingRecord] = await getRecordById(id, tableName, 'id');
        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }
        await query(`UPDATE ${tableName} SET title = ?, status = ?, updated_at = NOW() WHERE id = ?`, [title, status, id]);
        const [updatedRecord] = await getRecordById(id, tableName, 'id');
        await activityLog(ine_packers_ModuleID, existingRecord, updatedRecord, 2, 0);
        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

