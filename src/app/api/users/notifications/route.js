
// src/app/api/user/notifications/route.js
import { query } from "../../../../utils/database";
import { ine_ecomm_meta_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse, getRecordById, getQueryParamId, ManageResponseStatus } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_ecomm_meta_tablename;

// POST METHOD
export const POST = async (req) => {
    try {
        const userId = getQueryParamId(new URL(req.url));
        
        if (!userId) {
            return sendResponse({ error: 'User ID must be required', status: false }, 400);
        }
        
        const { notification_new_order_email, notification_order_shipping_email, notification_order_delivery_email } = await req.json();

        const notifications = [
            { key: 'notification_new_order_email', value: notification_new_order_email || 'Off' },
            { key: 'notification_order_shipping_email', value: notification_order_shipping_email || 'Off' },
            { key: 'notification_order_delivery_email', value: notification_order_delivery_email || 'Off' }
        ];

        // Construct the update query
        const updateQuery = `UPDATE ${tableName} SET meta_value = ?, updated_at = NOW() WHERE user_id = ? AND meta_key = ?`;

        for (const notification of notifications) {
            const { affectedRows } = await query(updateQuery, [notification.value, userId, notification.key]);
            if (affectedRows === 0) {
                await query(`INSERT INTO ${tableName} (user_id, meta_key, meta_value, created_at) VALUES (?, ?, ?, NOW())`, [userId, notification.key, notification.value]);
            }
        }

        return sendResponse({ data: notifications, message: ManageResponseStatus('updated'), status: true }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// GET METHOD
export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('user_id');
        
        let results;
        if (userId) {
            results = await query(`SELECT * FROM ${tableName} WHERE user_id = ?`, [userId]);
        } else {
            results = await getRecordById(null, tableName, 'id');
        }

        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};