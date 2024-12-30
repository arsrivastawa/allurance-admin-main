
// src/app/api/categories/route.js
import { query } from "../../../utils/database";
import { ine_category_ModuleID, ine_users_checkout_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, processDocument, processImageUpload } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_users_checkout_tablename;

// POST METHOD
export const POST = async (req) => {
    try {

        const requestData = await req.json();

        // Validate request data
        if (!requestData.taxamount) {
            return sendResponse({ error: ' taxamount fields are required', status: false }, 400);
        }
        let existingRecord;
        let queryResult;
        if (requestData.mock_Id) {
            existingRecord = await query(
                `SELECT * FROM ${tableName} WHERE mock_id = ?`,
                [requestData.mock_Id]
            );

            if (existingRecord.length > 0) {
                queryResult = await query(
                    `UPDATE ${tableName} SET taxamount = ?, CGST=?, SGST=?, IGST=?, subtotal = ?, totalamount = ?, updated_by = ?, affiliate_id = ?, updated_at = NOW() WHERE mock_id = ?`,
                    [
                        requestData.taxamount,
                        requestData.CGST,
                        requestData.SGST,
                        requestData.IGST,
                        requestData.subtotal,
                        requestData.totalamount || 0,
                        requestData.mock_Id,
                        requestData.affiliate_id || null,
                        requestData.mock_Id,
                    ]
                );
            } else {
                queryResult = await query(
                    `INSERT INTO ${tableName} (mock_id, taxamount, CGST, SGST, IGST, subtotal, totalamount, created_at, affiliate_id, created_by ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
                    [
                        requestData.mock_Id,
                        requestData.taxamount,
                        requestData.CGST,
                        requestData.SGST,
                        requestData.IGST,
                        requestData.subtotal,
                        requestData.totalamount || 0,
                        requestData.affiliate_id || null,
                        requestData.mock_Id,
                    ]
                );
            }
        }

        if (requestData.user_id) {
            existingRecord = await query(
                `SELECT * FROM ${tableName} WHERE user_id = ?`,
                [requestData.user_id]
            );

            if (existingRecord.length > 0) {
                queryResult = await query(
                    `UPDATE ${tableName} SET taxamount = ?, CGST=?, SGST=?, IGST=?, subtotal = ?, totalamount = ?, updated_by = ?, affiliate_id = ?, updated_at = NOW() WHERE user_id = ?`,
                    [
                        requestData.taxamount,
                        requestData.CGST,
                        requestData.SGST,
                        requestData.IGST,
                        requestData.subtotal,
                        requestData.totalamount || 0,
                        requestData.user_id,
                        requestData.affiliate_id || null,
                        requestData.user_id,
                    ]
                );
            } else {
                queryResult = await query(
                    `INSERT INTO ${tableName} (user_id, taxamount, CGST, SGST, IGST,subtotal, totalamount, created_at, affiliate_id, created_by ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
                    [
                        requestData.user_id,
                        requestData.taxamount,
                        requestData.CGST,
                        requestData.SGST,
                        requestData.IGST,
                        requestData.subtotal,
                        requestData.totalamount || 0,
                        requestData.affiliate_id || null,
                        requestData.user_id,
                    ]
                );
            }
        }


        return sendResponse({ data: queryResult, message: ManageResponseStatus(existingRecord.length > 0 ? 'updated' : 'created'), status: true }, 201);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// GET METHOD
export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const id = getQueryParamId(new URL(req.url));
        const userId = url.searchParams.get('user_id');
        const mockId = url.searchParams.get('mock_id');
        let results;
        if (id) {
            results = await getRecordById(id, tableName, 'id');
            if (results.length > 0) {
                return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }
        else if (userId) {
            results = await query(`SELECT * FROM ${tableName} WHERE user_id = ?`, [userId]);
            return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
        }
        else if (mockId) {
            results = await query(`SELECT * FROM ${tableName} WHERE mock_id = ?`, [mockId]);
            return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
        }
        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

export const DELETE = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        const deletedIds = id ? [id] : getQueryParamIds(new URL(req.url));

        if (!deletedIds || deletedIds.length === 0) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }

        await Promise.all(deletedIds.map(async (deletedId) => {
            const [currentRecord] = await getRecordById(deletedId, tableName, 'id');
            activityLog(ine_category_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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