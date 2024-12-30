
// src/app/api/others/searchbar/route.js
import { query } from "../../../../utils/database";
import { ine_products_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse, ManageResponseStatus } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_products_tablename;

// GET METHOD
export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const keywords = url.searchParams.get('keywords');
        
        if (keywords) {
            const results = await query(`SELECT * FROM ${tableName} WHERE name LIKE ? OR short_description LIKE ?`, [`%${keywords}%`, `%${keywords}%`]);
            if (results.length > 0) {
                return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        return sendResponse({ error: 'Keyboard parameter is required', status: false }, 400);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

