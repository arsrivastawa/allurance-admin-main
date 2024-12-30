// src/app/api/apply-coupon/route.js
import { query } from "../../../../utils/database";
import { ine_campaign_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse, ManageResponseStatus, getQueryParamId } from "../../../../utils/commonFunction";


const tableName = ine_campaign_tablename
// POST METHOD to apply coupon
export const POST = async (req) => {
    try {
        const requestData = await req.json();
        const couponCode = requestData.couponCode;

        if (!couponCode) {
            return sendResponse({ error: 'Coupon code is required', status: false }, 400);
        }

        // Check if the coupon code exists, is valid, and has not expired
        const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        const results = await query(`SELECT * FROM ${tableName} WHERE coupon_code = ? AND till_date >= ? AND record_status =2`, [couponCode, currentDate]);

        if (results.length > 0) {
            const discountAmount = results[0];
            return sendResponse({ data: { discountAmount }, message: 'Coupon applied successfully', status: true }, 200);
        } else {
            return sendResponse({ error: 'Invalid or expired coupon', status: false }, 404);
        }
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}`, status: false }, 500);
    }
};

// GET METHOD
export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        const currentDate = new Date().toISOString().split('T')[0];
        if (id) {
            const results = await query(`SELECT * FROM ${tableName} WHERE id = ? `, [id])
            if (results.length > 0) {
                return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const results = await query(`SELECT * FROM ${tableName} WHERE till_date >= ? `, [currentDate])
        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
