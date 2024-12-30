
// src/app/api/categories/route.js
import { query } from "../../../utils/database";
import { ine_packers_cartons_tablename, ine_warehouse_ModuleID, ine_warehouse_racks_tablename, ine_warehouse_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../utils/commonFunction";
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_warehouse_tablename;
const tableName2 = ine_warehouse_racks_tablename;
const tableName3 = ine_packers_cartons_tablename;

// POST METHOD
export const POST = async (req) => {
    try {
        await authenticateToken(req);
        const requestData = await req.json();

        // Validate request data
        if (!requestData.rack_title || !requestData.rack_code || !requestData.cartons) {
            return sendResponse({ error: 'Rack title, rack code, and cartons are required', status: false }, 400);
        }

        // Insert rack details into the main table
        const insertRackResult = await query(`INSERT INTO ${tableName} (rack_title, rack_code, created_by) VALUES (?, ?, ?)`, [
            requestData.rack_title,
            requestData.rack_code,
            requestData.apihitid
        ]);

        const insertedRackId = insertRackResult.insertId;

        // Insert associations between rack and cartons into the linking table
        for (const cartonId of requestData.cartons) {
            await query(`INSERT INTO ${tableName2} (rack_id, carton_id ,created_by) VALUES (?, ?, ?)`, [
                insertedRackId,
                cartonId,
                requestData.apihitid
            ]);

            // Update tablename3 to set rack_status with the rack_id for the specified box_id
            await query(`UPDATE ${tableName3} SET rack_status = ?, updated_by= ? WHERE id = ?`, [
                insertedRackId,
                requestData.apihitid,
                cartonId,
            ]);
        }

        return sendResponse({ data: insertRackResult, message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};


export const GET = async (req) => {
    try {
        await authenticateToken(req);
        const id = getQueryParamId(new URL(req.url));

        if (id) {
            // Fetch a specific record by ID
            const results = await query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
            if (results.length > 0) {
                const record = results[0];

                // Fetch count of shipped records and relevant ids from tableName2 where rack_id is the current record's id and is_deleted = 0
                const [countResult] = await query(`
                    SELECT COUNT(*) AS shipped_count, GROUP_CONCAT(carton_id) AS box_ids 
                    FROM ${tableName2} 
                    WHERE is_shipped = 0 AND is_deleted = 0 AND rack_id = ?`, [id]);

                const shippedCount = countResult.shipped_count || 0;
                const cartons = countResult.box_ids ? countResult.box_ids.split(',') : [];

                // Include the shipped count and box_ids in the response
                return sendResponse({
                    data: { ...record, count: shippedCount, cartons },
                    message: ManageResponseStatus('fetched'),
                    status: true
                }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        // Fetch all records if no ID is provided
        const results = await query(`
            SELECT t.*, COALESCE(c.count, 0) AS count 
            FROM ${tableName} t
            LEFT JOIN (SELECT rack_id, COUNT(*) AS count 
                       FROM ${tableName2} 
                       WHERE is_shipped = 0 AND is_deleted = 0
                       GROUP BY rack_id) c 
            ON t.id = c.rack_id`);

        return sendResponse({
            data: results,
            message: ManageResponseStatus('fetched'),
            status: true,
            count: results.length
        }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// PUT METHOD
export const PUT = async (req) => {
    try {
        await authenticateToken(req);
        const requestData = await req.json();

        // Validate request data
        if (!requestData.rack_title || !requestData.rack_code || !requestData.cartons) {
            return sendResponse({ error: 'Rack title, rack code, and cartons are required', status: false }, 400);
        }
        const id = getQueryParamId(new URL(req.url));
        if (id) {
            // Update and insert records based on carton_id
            for (const cartonId of requestData.cartons) {

                await query(`UPDATE ${tableName2} SET is_deleted = 1 ,updated_by = ? WHERE carton_id = ?`, [requestData.apihitid, cartonId]);

                // Insert new association between rack and carton into tableName2
                await query(`INSERT INTO ${tableName2} (rack_id, carton_id, created_by, is_deleted) VALUES (?, ?, ?, 0)`, [
                    id,
                    cartonId,
                    requestData.apihitid
                ]);

                // Update tableName3 to set rack_status with the rack_id for the specified box_id
                await query(`UPDATE ${tableName3} SET rack_status = ?,updated_by=?  WHERE id = ?`, [
                    id,
                    requestData.apihitid,
                    cartonId
                ]);
            }
            const updatedRackRecord = await query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
            return sendResponse({ data: updatedRackRecord, message: ManageResponseStatus('updated'), status: true }, 200);
        }
        return sendResponse({ error: 'Rack ID is required in the URL', status: false }, 400);
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
            activityLog(ine_warehouse_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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