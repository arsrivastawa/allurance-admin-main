
// src/app/api/contactus/route.js
import { query } from "../../../utils/database";
import { ine_contact_us_ModuleID, ine_contact_us_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getQueryParamId, ManageResponseStatus } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_contact_us_tablename;

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

        const existingRecordQuery = `SELECT * FROM ${tableName} WHERE id = ?`;
        const [existingRecord] = await query(existingRecordQuery, [id]);

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const { address, email, contact1, contact2, apihitid } = await req.json();

        await query(`UPDATE ${tableName} SET address = ?, email = ?, contact1 = ?, contact2 = ?,updated_by = ?, updated_at = NOW() WHERE id = ?`, [address, email, contact1, contact2, apihitid, id]);

        // Retrieve the updated record
        const updatedRecord = { ...existingRecord, address, email, contact1, contact2 };

        await activityLog(ine_contact_us_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
