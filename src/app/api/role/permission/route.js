
// src/app/api/role/permission/route.js
import { query } from "../../../../utils/database";
import { ine_permissions_tablename, ine_modules_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse, getQueryParamId, ManageResponseStatus } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_permissions_tablename;
const tableName2 = ine_modules_tablename;

// GET METHOD
export const GET = async (req) => {
    try {
        const role_id = getQueryParamId(new URL(req.url));
        const baseQuery = `SELECT ip.*, im.name FROM \`${tableName}\` as ip LEFT JOIN \`${tableName2}\` as im on im.id = ip.module_id WHERE ip.status = 1`;

        if (role_id) {
            const query1 = `${baseQuery} AND ip.role_id = ? ORDER BY ip.id ASC`;
            const results = await query(query1, [role_id]);
            if (results.length > 0) {
                return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const query2 = `${baseQuery} ORDER BY ip.id ASC`;
        const results = await query(query2);

        if (results.length > 0) {
            return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
        }

        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        for (const item of requestData) {
            const { id, read_access, add_access, update_access, delete_access } = item;
            const existingData = await query(`SELECT * FROM \`${tableName}\` WHERE id = ?`, [id]);
            if (existingData) {
                existingData.read_access = read_access;
                existingData.add_access = add_access;
                existingData.update_access = update_access;
                existingData.delete_access = delete_access;
                await query(`UPDATE \`${tableName}\` SET read_access = ?, add_access = ?, update_access = ?, delete_access = ? WHERE id = ?`, [read_access, add_access, update_access, delete_access, id]);
            }
        }

        return sendResponse({ message: ManageResponseStatus('updated'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
