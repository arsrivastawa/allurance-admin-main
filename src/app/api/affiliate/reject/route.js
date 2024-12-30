
// src/app/api/categories/route.js
import { query } from "../../../../utils/database";
import { user_affiliate_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse, getRecordById, getQueryParamId, ManageResponseStatus } from "../../../../utils/commonFunction";

// Table Name
const tableName = user_affiliate_tablename;

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
        const requestData = await req.json();
        // Define the columns to update and corresponding values
        const columns = [
            'updated_by',
            'updated_at',
            'record_status',
            'rejection_reason'
        ];

        const values = [
            requestData.apihitid || null,
            'NOW()',
            requestData.record_status || null,
            requestData.rejection_reason || null,
        ];
        // Create the query string for the update
        const queryString = `UPDATE ${tableName} SET ${columns.map(col => `${col} = ?`).join(', ')} WHERE id = ?`;
        // Add the id at the end of the values array
        values.push(id);
        // Execute the update query
        await query(queryString, values);
        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');
        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
