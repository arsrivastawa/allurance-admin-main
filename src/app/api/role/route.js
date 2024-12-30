
// src/app/api/role/route.js
import { query } from "../../../utils/database";
import { ine_roles_ModuleID, ine_roles_tablename, ine_modules_tablename, ine_permissions_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../utils/commonFunction";
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_roles_tablename;
const tableName2 = ine_modules_tablename;
const tableName3 = ine_permissions_tablename;

// POST METHOD
export const POST = async (req) => {
    try {
        await authenticateToken(req);
        const requestData = await req.json();

        // Validate request data
        if (!requestData.name || !requestData.prefix) {
            return sendResponse({ error: 'Name and Prefix fields are required', status: false }, 400);
        }

        const existingPrefix = await query(`SELECT * FROM ${tableName} WHERE prefix = ?`, [requestData.prefix]);
        if (existingPrefix.length > 0) {
            return sendResponse({ error: 'Prefix must be unique', status: false }, 400);
        }

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (name, prefix,created_by) VALUES (?,?,?)`, [
            requestData.name, requestData.prefix, requestData.apihitid
        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        // Add modules based on Role
        const existingData = await query(`SELECT * FROM \`${tableName2}\` WHERE status = ?`, [1]);
        if (existingData && existingData.length > 0) {
            for (const module of existingData) {
                if (existingData.length > 0) {
                    const permissionsData = {
                        role_id: insertedRecordId,
                        module_id: module.id,
                        read_access: module.id === 1 ? 1 : 0,
                        add_access: module.id === 1 ? 1 : 0,
                        update_access: module.id === 1 ? 1 : 0,
                        delete_access: module.id === 1 ? 1 : 0,
                    };

                    await query(
                        `INSERT INTO ${tableName3} (role_id, module_id, read_access, add_access, update_access, delete_access) VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            permissionsData.role_id,
                            permissionsData.module_id,
                            permissionsData.read_access,
                            permissionsData.add_access,
                            permissionsData.update_access,
                            permissionsData.delete_access
                        ]
                    );
                }
            }
        }



        await activityLog(ine_roles_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

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

        const { name, apihitid } = await req.json();

        await query(`UPDATE ${tableName} SET name = ?,updated_by=?, updated_at = NOW() WHERE id = ?`, [name, apihitid, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_roles_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

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
            activityLog(ine_roles_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
        }));

        const results = await query(`UPDATE ${tableName} SET status = 2, deleted_at = NOW() WHERE id IN (?)`, [deletedIds]);
        await query(`UPDATE ${tableName3} SET status = 2, deleted_at = NOW() WHERE role_id IN (?)`, [deletedIds]);

        if (results.affectedRows > 0) {
            return sendResponse({ message: ManageResponseStatus('deleted'), status: true }, 200);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};