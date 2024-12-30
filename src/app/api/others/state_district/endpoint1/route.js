
// src/app/api/others/state_district/endpoint1/route.js
import { query } from "../../../../../utils/database";
import { ine_state_district_tablename } from "../../../../../utils/apiEndPoints";
import { sendResponse, ManageResponseStatus } from "../../../../../utils/commonFunction";

// Table Name
const tableName = ine_state_district_tablename;

// GET METHOD - State List
export const GET = async (req) => {
    try {
        const results = await query(`SELECT * FROM \`${tableName}\` GROUP BY StateName`);
        if (results.length > 0) {
            return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
        }
        return sendResponse({ message: ManageResponseStatus('notFound'), status: false }, 400);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
