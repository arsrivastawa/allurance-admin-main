import { query } from "src/utils/database";
import { ine_giftcard_generate_tablename } from "src/utils/apiEndPoints";
import { ManageResponseStatus, getQueryParamId, sendResponse } from "src/utils/commonFunction";

// Table Names
const tableName = ine_giftcard_generate_tablename;

// GET METHOD
export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));

        if (id) {
            const results = await query(`SELECT * FROM ${tableName} WHERE gift_card_number = ?`, [id]);

            if (results.length > 0) {
                return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const results = await query(`SELECT * FROM ${tableName}`);
        if (results.length > 0) {
            return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};