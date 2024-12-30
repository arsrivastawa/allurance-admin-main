
// src/app/api/myreferral/route.js
import { query } from "../../../utils/database";
import { ine_my_referral_tablename, ine_users_tablename } from "../../../utils/apiEndPoints";
import { sendResponse, getRecordById, getQueryParamId, ManageResponseStatus } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_my_referral_tablename;
const tableName2 = ine_users_tablename;

// GET METHOD
export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('user_id');
        const id = getQueryParamId(url);

        if (id) {
            const results = await getRecordById(id, tableName, 'id');
            if (results.length > 0) {
                return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        let results, totalAmount;
        if (userId) {
            results = await query(`SELECT r.*, u.first_name as fname, u.last_name as lname, u.email FROM ${tableName} as r LEFT JOIN ${tableName2} as u on u.id = r.user_id WHERE refer_id = ? ORDER BY ID desc`, [userId]);
            const totalResult = await query(`SELECT SUM(amount) as totalAmount FROM ${tableName} WHERE refer_id = ?`, [userId]);
            totalAmount = totalResult[0].totalAmount || 0;
        } else {
            results = await getRecordById(null, tableName, 'id');
            const totalResult = await query(`SELECT SUM(amount) as totalAmount FROM ${tableName}`);
            totalAmount = totalResult[0].totalAmount || 0;
        }

        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length, total_amt: totalAmount }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
