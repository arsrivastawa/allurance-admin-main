
// src/app/api/others/state_district/endpoint2/route.js
import { query } from "../../../../../utils/database";
import { ine_state_district_tablename } from "../../../../../utils/apiEndPoints";
import { sendResponse, ManageResponseStatus } from "../../../../../utils/commonFunction";

// Table Name
const tableName = ine_state_district_tablename;

// POST METHOD - District List
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.StateName) {
            return sendResponse({ error: 'StateName fields are required', status: false }, 400);
        }

        const results = await query(`SELECT * FROM \`${tableName}\` WHERE StateName = ? GROUP BY District`, [requestData.StateName]);
        if (results.length > 0) {
            return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
        }
        return sendResponse({ message: ManageResponseStatus('notFound'), status: false }, 400);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};