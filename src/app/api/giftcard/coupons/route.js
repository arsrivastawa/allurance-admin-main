
// src/app/api/gift_cards/coupons/route.js
import { ine_giftcard_generate_tablename } from "src/utils/apiEndPoints";
import { sendResponse, ManageResponseStatus } from "../../../../utils/commonFunction";
import { query } from "src/utils/database";

const tableName = ine_giftcard_generate_tablename;

export const GET = async (req) => {
    try {
        const url = req.url;
        if (!url) {
            return sendResponse({ error: 'URL is missing', status: false }, 400);
        }
        try {
            const id = new URL(url).searchParams.get('id');
            let condition = id ? 'AND giftcard_id = ?' : '';
            let params = id ? [id] : [];
            const results = await query(`SELECT * FROM ${tableName} WHERE status = 0  ${condition} ORDER BY id DESC`, params);
            if (results.length > 0) {
                return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        } catch (error) {
            return sendResponse({ error: `Error parsing URL: ${error.message}`, status: false }, 400);
        }
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};