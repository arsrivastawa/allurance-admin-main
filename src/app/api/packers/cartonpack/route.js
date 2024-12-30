
// src/app/api/categories/route.js
import { query } from "../../../../utils/database";
import { ine_packers_ModuleID, ine_packers_boxes_tablename, ine_packers_cartons_tablename } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../../utils/commonFunction";
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_packers_cartons_tablename;
const tableName3 = ine_packers_boxes_tablename;
const tableName4 = 'ine_carton_elements'


export const POST = async (req) => {
    try {
        await authenticateToken(req);
        const requestData = await req.json();

        if (!requestData.title) {
            return sendResponse({ error: 'Title field required', status: false }, 400);
        }

        if (!requestData.boxIds || requestData.boxIds.length === 0) {
            return sendResponse({ error: 'At least one box must be selected', status: false }, 400);
        }

        // Insertion into the primary table
        const insertResult = await query(`INSERT INTO ${tableName} (title) VALUES (?)`, [
            requestData.title
        ]);

        const insertedRecordId = insertResult.insertId;

        // Insert box IDs into the secondary table
        for (const boxId of requestData.boxIds) {
            // Insert box ID along with the ID of the inserted record into the secondary table
            await query(`INSERT INTO ${tableName4} (carton_id, box_id) VALUES (?, ?)`, [
                insertedRecordId,
                boxId
            ]);
            await query(`UPDATE ${tableName3} SET is_packed = 2 WHERE id = ?`, [boxId]);
        }

        const insertedRecord = await query(`SELECT * FROM ${tableName} WHERE id=?`, [insertedRecordId]) // Retrieve the inserted record

        await activityLog(ine_packers_ModuleID, null, insertResult, 1, 0); // Maintain Activity Log

        return sendResponse({ data: insertedRecord, message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

export const GET = async (req) => {
    try {
        await authenticateToken(req);
        const id = getQueryParamId(new URL(req.url));

        if (id) {
            const queryWithId = `
                SELECT
                    ip.*,
                    (SELECT COUNT(*) FROM ine_carton_elements WHERE box_id = ?) AS totalCount
                FROM
                    ${tableName} AS ip
                WHERE
                    ip.id = ?;
            `;
            const [resultsWithId] = await query(queryWithId, [id, id]);
            return sendResponse({ data: resultsWithId, message: ManageResponseStatus('fetched'), status: true }, 200);
        }

        const queryWithoutId = `
            SELECT
                ip.*,
                (SELECT COUNT(*) FROM ine_carton_elements WHERE carton_id = ip.id) AS totalCount
            FROM
                ${tableName} AS ip
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