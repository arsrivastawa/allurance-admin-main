// src/app/api/ticket/route.js
import { query } from "../../../../utils/database";
import { ine_tickets_ModuleID, ine_tickets_tablename } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, ManageResponseStatus } from "../../../../utils/commonFunction";

const tableName2 = ine_tickets_tablename;

// PUT METHOD
export const PUT = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));

        if (!id) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }

        // Check if the ID exists in the database and retrieve the existing record
        const [existingRecord] = await getRecordById(id, tableName2, 'id');

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const { operate_by, assign_by } = await req.json();

        await query(`UPDATE ${tableName2} SET operate_by = ?, assign_by = ?, updated_at = NOW() WHERE id = ?`, [operate_by, assign_by, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName2, 'id');

        await activityLog(ine_tickets_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
