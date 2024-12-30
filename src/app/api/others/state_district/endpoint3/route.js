
// src/app/api/others/state_district/endpoint3/route.js
import { query } from "../../../../../utils/database";
import { ine_state_district_tablename } from "../../../../../utils/apiEndPoints";
import { sendResponse, ManageResponseStatus } from "../../../../../utils/commonFunction";

// Table Name
const tableName = ine_state_district_tablename;

// POST METHOD - Pincode List
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.District) {
            return sendResponse({ error: 'District fields are required', status: false }, 400);
        }

        const results = await query(`SELECT * FROM \`${tableName}\` WHERE District = ?`, [requestData.District]);
        if (results.length > 0) {
            return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
        }
        return sendResponse({ message: ManageResponseStatus('notFound'), status: false }, 400);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};