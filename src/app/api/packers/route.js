
// src/app/api/categories/route.js
import { query } from "../../../utils/database";
import { ine_packers_ModuleID, ine_packers_tablename, ine_replicator_tablename, ine_serial_number } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_packers_tablename;
const tableName2 = ine_replicator_tablename;
const tableName3 = ine_serial_number;

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.title || !requestData.status) {
            return sendResponse({ error: 'Title and status fields are required', status: false }, 400);
        }

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (title, status) VALUES (?, ?)`, [
            requestData.title,
            requestData.status
        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        await activityLog(ine_packers_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

        return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));

        if (id) {
            const queryWithId = `
                SELECT
                    ip.*,
                    r.designer_id AS model_number,
                    r.batch_number,
                    r.quantity
                FROM
                    ${tableName} AS ip
                LEFT JOIN
                    ${tableName2} AS r ON ip.replicator_id = r.id
                WHERE
                    ip.id = ?;
            `;
            const [resultsWithId] = await query(queryWithId, [id]);
            if (resultsWithId) {
                // Fetch data from tableName3 for the provided id
                const queryTable3 = `
                    SELECT *
                    FROM ${tableName3} 
                    WHERE replicator_id = ? AND is_packed =1;
                `;
                const resultsTable3 = await query(queryTable3, [resultsWithId?.replicator_id]);

                // Add results from tableName3 to resultsWithId
                resultsWithId.serialnumbers = resultsTable3;
                return sendResponse({ data: resultsWithId, message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const queryWithoutId = `
            SELECT
                ip.*,
                r.designer_id AS model_number,
                r.batch_number,
                r.quantity
            FROM
                ${tableName} AS ip
            LEFT JOIN
                ${tableName2} AS r ON ip.replicator_id = r.id;
        `;
        const resultsWithoutId = await query(queryWithoutId);
        return sendResponse({ data: resultsWithoutId, message: ManageResponseStatus('fetched'), status: true, count: resultsWithoutId.length }, 200);
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

        // Check if the ID exists in the database and retrieve the existing record
        const [existingRecord] = await getRecordById(id, tableName, 'id');

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        // Update the record with the provided data
        await query(`UPDATE ${tableName} SET title = ?, status = ?, updated_at = NOW() WHERE id = ?`, [title, status, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        // Maintain Activity Log
        await activityLog(ine_category_ModuleID, existingRecord, updatedRecord, 2, 0);

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
            activityLog(ine_category_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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