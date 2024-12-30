
// src/app/api/others/ecommmeta/route.js
import { query } from "../../../../utils/database";
import { ine_ecomm_meta_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse, getQueryParamId, ManageResponseStatus } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_ecomm_meta_tablename;

// GET METHOD
export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        
        if (id) {
            const results = await query(`SELECT * FROM ${tableName} WHERE user_id = ?`, [id]);
            if (results.length > 0) {
                const data = results.map(result => ({
                    key: result.meta_key,
                    value: result.meta_value.toLowerCase()
                }));
                return sendResponse({ data, message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        return sendResponse({ error: 'ID parameter is required', status: false }, 400);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

