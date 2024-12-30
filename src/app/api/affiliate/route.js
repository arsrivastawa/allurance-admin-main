
// src/app/api/categories/route.js
import { query } from "../../../utils/database";
import { ine_category_ModuleID, user_affiliate_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, processDocument, processImageUpload, processDocuments } from "../../../utils/commonFunction";

// Table Name
const tableName = user_affiliate_tablename;


// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.user_name || !requestData.insta_profile_url) {
            return sendResponse({ error: 'user name and insta profile url fields are required', status: false }, 400);
        }

        const image = await processDocuments(requestData?.image1);
        const image2 = await processDocuments(requestData?.image2);


        // Define the columns and corresponding values
        const columns = [
            'user_id',
            'affiliate_name',
            'user_name',
            'insta_username',
            'insta_followers',
            'insta_profile_url',
            'aadhar_card_image',
            'pan_card_image',
            'aadhar_card_number',
            'pan_card_number',
            'commission',
            'affiliate_url',
            'affiliate_start_date',
            'affiliate_end_date',
            'created_by',
            'record_status'
        ];

        const values = [
            requestData.user_id || null,
            requestData.affiliate_name || null,
            requestData.user_name,
            requestData.insta_username || null,
            requestData.insta_followers || null,
            requestData.insta_profile_url,
            image,
            image2,
            requestData.aadhar_card_number || null,
            requestData.pan_card_number || null,
            requestData.commission || null,
            requestData.affiliate_url || null,
            requestData.affiliate_start_date || null,
            requestData.affiliate_end_date || null,
            requestData.apihitid || null,
            requestData.record_status || null,
        ];

        // Create the query string
        const queryString = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;

        // Execute the query
        const insertResult = await query(queryString, values);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// GET METHOD
export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        if (id) {
            const results = await getRecordById(id, tableName, 'id');
            if (results.length > 0) {
                return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const results = await getRecordById(null, tableName, 'id');
        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};


// PUT METHOD
export const PUT = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));

        if (!id) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }

        // Check if the ID exists in the database and retrieve the existing record
        const [existingRecord] = await getRecordById(id, tableName, 'id');

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const requestData = await req.json();

        // Validate request data
        if (!requestData.user_name || !requestData.insta_profile_url) {
            return sendResponse({ error: 'user name and insta profile url fields are required', status: false }, 400);
        }

        const image = await processDocuments(requestData?.image1);
        const image2 = await processDocuments(requestData?.image2);

        // Define the columns to update and corresponding values
        const columns = [
            'user_id',
            'affiliate_name',
            'user_name',
            'insta_username',
            'insta_followers',
            'insta_profile_url',
            'aadhar_card_image',
            'pan_card_image',
            'aadhar_card_number',
            'pan_card_number',
            'commission',
            'affiliate_url',
            'affiliate_start_date',
            'affiliate_end_date',
            'updated_by',
            'updated_at',
            'record_status'
        ];

        const values = [
            requestData.user_id || null,
            requestData.affiliate_name || null,
            requestData.user_name,
            requestData.insta_username || null,
            requestData.insta_followers || null,
            requestData.insta_profile_url,
            image,
            image2,
            requestData.aadhar_card_number || null,
            requestData.pan_card_number || null,
            requestData.commission || null,
            requestData.affiliate_url || null,
            requestData.affiliate_start_date || null,
            requestData.affiliate_end_date || null,
            requestData.apihitid || null,
            'NOW()',
            requestData.record_status || null,
        ];

        // Create the query string for the update
        const queryString = `UPDATE ${tableName} SET ${columns.map(col => `${col} = ?`).join(', ')} WHERE id = ?`;

        // Add the id at the end of the values array
        values.push(id);

        // Execute the update query
        await query(queryString, values);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

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