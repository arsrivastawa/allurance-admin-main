
// src/app/api/mywallet/route.js
import { query } from "../../../utils/database";
import { ine_my_wallet_tablename } from "../../../utils/apiEndPoints";
import { sendResponse, getQueryParamId, ManageResponseStatus } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_my_wallet_tablename;

// GET METHOD
export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('user_id');
        const id = getQueryParamId(url);

        if (id) {
            const results = await query(`SELECT * FROM ${tableName} WHERE id = ? ORDER BY ID desc`, [id]); //await getRecordById(id, tableName, 'id');
            if (results.length > 0) {
                return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        let results;
        if (userId) {
            results = await query(`SELECT * FROM ${tableName} WHERE user_id = ? ORDER BY ID desc`, [userId]);
            
        } else {
            results = await query(`SELECT * FROM ${tableName}`);
        }

        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};


