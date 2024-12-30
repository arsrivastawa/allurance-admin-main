
// src/app/api/others/COUNTRY/route.js
import { query } from "../../../../utils/database";
import { ine_countries_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse, ManageResponseStatus } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_countries_tablename;

// GET METHOD - Country List
export const GET = async (req) => {
    try {
        const results = await query(`SELECT * FROM \`${tableName}\``);
        if (results.length > 0) {
            return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
        }
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};