// Import necessary modules and helper functions
import { query } from "../../../../../utils/database";
import { getRecordById, sendResponse, checkEmailExistOrNot, checkPhoneExistOrNot, getQueryParamId, ManageResponseStatus } from "../../../../../utils/commonFunction";
import { ine_campaign_tablename } from "../../../../../utils/apiEndPoints";

// Table Names
const tableName = ine_campaign_tablename;

export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        if (id) {
            const results = await query(`SELECT * FROM ${tableName} WHERE coupon_code = ? AND offline_channel = 1`, [id]);
            if (results.length > 0) {
                return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }
        const results = await query(`SELECT * FROM ${tableName} WHERE show_in_section = 2 AND record_status = 2 AND offline_channel = 1 AND till_date >= NOW()`);
        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};



