
// src/app/api/categories/route.js
import { query } from "../../../utils/database";
import { ine_replicator_moduleID, ine_replicator_tablename, ine_manage_request_tablename, ine_serial_number, ine_designer_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, getRecordsByReplicatorId, getRecordBydesignerId } from "../../../utils/commonFunction";
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_replicator_tablename;
const tableName2 = ine_manage_request_tablename;
const tableName3 = ine_serial_number;
const tableName4 = ine_designer_tablename


export const POST = async (req) => {
    try {
        await authenticateToken(req);
        const requestData = await req.json();

        // Validate request data
        if (!requestData.designer_id || !requestData.quantity) {
            return sendResponse({ error: 'Model Id and quantity fields are required', status: false }, 400);
        }

        const insertedRecord = await getRecordBydesignerId(requestData?.designer_id, tableName4, 'id');

        // Check if a record exists in tableName4
        if (insertedRecord != [] && !insertedRecord.length > 0) {
            return sendResponse({ error: 'Model ID does not exist or is not approved yet', status: false }, 404);
        }

        // Generate a 10-character batch number
        const batch_number = generateRandomBatchNumber(10);

        // Insert a record into tableName if a record exists in tableName4
        const insertResult = await query(`
            INSERT INTO ${tableName} (designer_id, quantity, created_by) 
            VALUES (?, ?, ?)`, [
            requestData.designer_id,
            requestData.quantity,
            requestData.created_by
            // batch_number, // Insert the generated batch number
        ]);

        // Retrieve the inserted record
        const insertedRecordId = insertResult.insertId;
        const insertedRecordDetails = await getRecordById(insertedRecordId, tableName, 'id');

        // Check if the insertion was successful
        if (insertResult) {
            // Insert a record into tableName2 with the generated batch number
            await query(`
                INSERT INTO ${tableName2} (module_id, row_id, request_status, comments, created_by) 
                VALUES (?, ?, ?, ?, ?)`, [
                ine_replicator_moduleID,
                insertedRecordId,
                1, // Assuming 1 represents a successful request status
                null,
                1, // Assuming 1 represents the ID of the user who created the record
                // Insert the generated batch number
            ]);
        }

        // Maintain Activity Log
        await activityLog(ine_replicator_moduleID, null, insertedRecordDetails, 1, 0);

        return sendResponse({ data: insertedRecordDetails[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
}

export const GET = async (req) => {
    try {
        await authenticateToken(req);
        const id = getQueryParamId(new URL(req.url));
        if (id) {
            const results = await getRecordById(id, tableName, 'id');
            if (results.length > 0) {
                // Check if record_status is 2
                if (results[0].record_status === 2) {
                    // Execute raw SQL query to fetch serial numbers
                    const approvedrecords = await getRecordsByReplicatorId(id, tableName3, 'id');
                    if (approvedrecords.length > 0) {
                        results[0].approvedrecords = approvedrecords;
                    }
                }
                return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        // const results = await getRecordById(null, tableName, 'id');
        // const results = await query(`SELECT * FROM ${tableName}`)
        const results = await query(`
            SELECT 
              a.*, 
              ine_users.first_name as created_by_first_name, 
              ine_users.last_name as created_by_last_name
            FROM ${tableName} AS a
            LEFT JOIN ine_users ON a.created_by = ine_users.id
          `);

        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
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
            awaitactivityLog(ine_replicator_moduleID, currentRecord, null, 3, 0); // Maintain Activity Log
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