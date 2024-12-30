
// src/app/api/others/sitesetting/route.js
import { query } from "../../../../utils/database";
import { ine_settings_ModuleID, ine_settings_tablename } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getQueryParamId, ManageResponseStatus } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_settings_tablename;

// GET METHOD
export const GET = async (req) => {
    try {

        const query1 = `SELECT * FROM ${tableName} WHERE id = 1;`;
        const results = await query(query1);
        if (results.length > 0) {
            return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
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

        // Retrieve the existing record
        const existingRecordQuery = `SELECT * FROM ${tableName} WHERE id = ?`;
        const [existingRecord] = await query(existingRecordQuery, [id]);

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const { site_title, site_logo, smtp_host, smtp_username, smtp_password, smtp_port } = await req.json();

        await query(`UPDATE ${tableName} SET site_title = ?, site_logo = ?, smtp_host = ?, smtp_username = ?, smtp_password = ?, smtp_port = ?, updated_at = NOW() WHERE id = ?`, [site_title, site_logo, smtp_host, smtp_username, smtp_password, smtp_port, id]);

        // Retrieve the updated record
        const updatedRecord = { ...existingRecord, site_title, site_logo, smtp_host, smtp_username, smtp_password, smtp_port };

        await activityLog(ine_settings_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
