
// src/app/api/mygiftcard/route.js
import { query } from "../../../utils/database";
import { ine_my_giftcard_ModuleID, ine_my_giftcard_tablename, ine_giftcard_generate_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_my_giftcard_tablename;
const tableName2 = ine_giftcard_generate_tablename;

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        if (!requestData.gift_card_number || !requestData.pin_number) {
            return sendResponse({ error: 'Gift card number and PIN number are required', status: false }, 400);
        }

        const results = await query(`SELECT * FROM ${tableName2} WHERE gift_card_number = ? AND pin_number = ?`, [requestData.gift_card_number, requestData.pin_number]);
        if (results && results.length > 0) {
            const giftCard = results[0];

            const existingRecord = await query(`SELECT * FROM ${tableName} WHERE user_id = ? AND giftcard_id = ?`, [requestData.user_id, giftCard.id]);
            if (existingRecord && existingRecord.length > 0) {
                return sendResponse({ error: 'This coupon has already been used', status: false }, 400);
            }

            const insertResult = await query(`INSERT INTO ${tableName} (user_id, giftcard_id) VALUES (?, ?)`, [
                requestData.user_id,
                giftCard.id
            ]);

            const insertedRecordId = insertResult.insertId;
            const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id');

            await activityLog(ine_my_giftcard_ModuleID, null, insertedRecord, 1, 0);

            return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);
        } else {
            return sendResponse({ error: 'Invalid gift card number or PIN number', status: false }, 404);
        }

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}`, status: false }, 500);
    }
};

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

        let results;
        if (userId) {
            results = await query(`SELECT g.*, gg.gift_card_number, gg.pin_number, gg.amount, gg.expiry_date FROM ${tableName} as g 
                LEFT JOIN ${tableName2} as gg on gg.id = g.refer_id WHERE user_id = ? ORDER BY ID desc`, [userId]);
        } else {
            results = await getRecordById(null, tableName, 'id');
        }

        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// DELETE METHOD (Single or Multiple)
export const DELETE = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        const deletedIds = id ? [id] : getQueryParamIds(new URL(req.url));

        if (!deletedIds || deletedIds.length === 0) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }

        await Promise.all(deletedIds.map(async (deletedId) => {
            const [currentRecord] = await getRecordById(deletedId, tableName, 'id');
            activityLog(ine_my_giftcard_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
        }));

        const results = await query(`UPDATE ${tableName} SET status = 2, deleted_at = NOW() WHERE id IN (?)`, [deletedIds]);

        if (results.affectedRows > 0) {
            return sendResponse({ message: ManageResponseStatus('deleted'), status: true }, 200);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
