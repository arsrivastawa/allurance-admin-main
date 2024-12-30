import { query } from "../../../utils/database";
import { ine_campaign_ModuleID, ine_campaign_tablename, ine_manage_request_tablename, ine_marekting_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, ManageResponseStatus, processDocuments } from "../../../utils/commonFunction";
import { authenticateToken } from "src/utils/authMiddleware";


const tableName = ine_campaign_tablename;
const tableName2 = ine_marekting_tablename;

export const POST = async (req) => {
    try {
        await authenticateToken(req);
        const requestData = await req.json();

        // Validate request data
        const requiredFields = ['campaign_name', 'start_date', 'till_date'];
        const missingFields = requiredFields.filter(field => !(field in requestData));
        if (missingFields.length > 0) {
            return sendResponse({ error: `Missing required fields: ${missingFields.join(', ')}`, status: false }, 400);
        }
        const image = await processDocuments(requestData?.image1);
        const categories = requestData.categories ? requestData.categories.join(',') : null;
        const products = requestData.products ? requestData.products.join(',') : null;

        // Values to be inserted
        const values = [
            requestData.campaign_name,
            image,
            requestData.start_date,
            requestData.till_date,
            requestData.online_channel,
            requestData.offline_channel || null,
            requestData.number_of_redemptions || 0,
            requestData.number_of_redemptions_single_user || 0,
            requestData.discount_percentage || 0,
            requestData.min_cart_value || 0,
            requestData.min_cart_products || 0,
            requestData.max_discount_in_price || 0,
            categories,
            products,
            requestData.show_in_section || 1,
            requestData.first_order_validity || 0,
            requestData.campaign_url || null,
            requestData.coupon_code || "",
            requestData.description || "",
            requestData.record_status || 1,
            new Date(), // created_at
            requestData.status || 1,
            requestData.created_by || 0
        ];

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (
            campaign_name, banner_img, start_date, till_date, online_channel, offline_channel, 
            number_of_redemptions, number_of_redemptions_single_user, discount_percentage, 
            min_cart_value, min_cart_products, max_discount_in_price, categories, products, 
            show_in_section, first_order_validity, campaign_url, coupon_code, 
            description, record_status, created_at, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`, values);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        await query(`INSERT INTO ${ine_manage_request_tablename} (module_id, row_id, request_status, comments, created_by) VALUES (?,?,?,?,?)`, [
            ine_campaign_ModuleID, insertedRecordId, 1, null, 1
        ]);
        await activityLog(ine_campaign_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log
        return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};



export const PUT = async (req) => {
    try {
        await authenticateToken(req);
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
        const requiredFields = ['campaign_name', 'start_date', 'till_date', 'online_channel'];
        const missingFields = requiredFields.filter(field => !(field in requestData));
        if (missingFields.length > 0) {
            return sendResponse({ error: `Missing required fields: ${missingFields.join(', ')}`, status: false }, 400);
        }

        const {
            campaign_name, start_date, till_date, online_channel, offline_channel,
            number_of_redemptions, number_of_redemptions_single_user, discount_percentage,
            min_cart_value, min_cart_products, max_discount_in_price, categories, products,
            show_in_section, first_order_validity, campaign_url, coupon_code,
            description, status, apihitid
        } = requestData;
        const image = await processDocuments(requestData?.image1);

        // Convert categories and products arrays to comma-separated strings
        const updatedCategories = categories ? categories.join(',') : null;
        const updatedProducts = products ? products.join(',') : null;

        await query(`UPDATE ${tableName} SET 
            campaign_name = ?,banner_img =?, start_date = ?, till_date = ?, online_channel = ?, offline_channel = ?, 
            number_of_redemptions = ?, number_of_redemptions_single_user = ?, discount_percentage = ?, 
            min_cart_value = ?, min_cart_products = ?, max_discount_in_price = ?, categories = ?, products = ?, 
            show_in_section = ?, first_order_validity = ?, campaign_url = ?, coupon_code = ?, 
            description = ?, status = ?, updated_at = NOW(), record_status = 1 ,updated_by = ?
            WHERE id = ?`,
            [
                campaign_name, image, start_date, till_date, online_channel, offline_channel || null,
                number_of_redemptions || 0, number_of_redemptions_single_user || 0, discount_percentage || 0,
                min_cart_value || 0, min_cart_products || 0, max_discount_in_price || 0, updatedCategories, // Use updatedCategories instead of categories
                updatedProducts, // Use updatedProducts instead of products
                show_in_section || 1, first_order_validity || 0, campaign_url || null,
                coupon_code || "", description || "", status || 1, apihitid || 0, id
            ]);

        // Make a request in the ine_request_table
        await query(`INSERT INTO ${ine_manage_request_tablename} (module_id, row_id, request_status, comments, created_by) VALUES (?, ?, ?, ?, ?)`, [
            ine_campaign_ModuleID, id, 1, null, 1
        ]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_campaign_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

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

