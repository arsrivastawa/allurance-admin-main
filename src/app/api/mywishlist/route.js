
// src/app/api/mywishlist/route.js
import { query } from "../../../utils/database";
import { ine_my_wishlist_ModuleID, ine_my_wishlist_tablename, ine_products_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_my_wishlist_tablename;
const tableName2 = ine_products_tablename;

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.product_id) {
            return sendResponse({ error: 'Product ID is required', status: false }, 400);
        }

        // Check for existing product
        const existingProduct = await query(`
        SELECT * FROM ${tableName}
        WHERE user_id = ? AND product_id = ?
      `, [requestData.user_id, requestData.product_id]);

        if (existingProduct.length > 0) {
            return sendResponse({ error: 'Product already exists in wishlist', status: false }, 409);
        }

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (user_id, product_id) VALUES (?, ?)`, [
            requestData.user_id,
            requestData.product_id
        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id');

        await activityLog(ine_my_wishlist_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

        return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// GET METHOD
export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('user_id');
        const categoryId = url.searchParams.get('category_id');
        const keyword = url.searchParams.get('keyword');

        if (!userId) {
            return sendResponse({ error: 'User ID is required' }, 400);
        }

        // Step 1: Fetch product IDs from wishlist based on user_id
        const wishlistQuery = `SELECT product_id FROM ine_wishlist WHERE user_id = ?`;
        const wishlistResults = await query(wishlistQuery, [userId]);

        if (wishlistResults.length === 0) {
            return sendResponse({ error: 'No products found in wishlist', status: false }, 404);
        }

        const productIds = wishlistResults.map(item => item.product_id);

        // Step 2: Fetch product details based on the product IDs
        let queryStr = `SELECT p.*, 
                               d.id as designer_id,
                               d.model_number, 
                               d.sub_model_number, 
                               c.id as category_id,
                               c.name as category_name, 
                               r.id as resin_id,
                               r.name as resin_name, 
                               s.id as shape_id,
                               s.shape as shape_name,
                               b.id as bezel_material_id,
                               b.name as bezel_material,
                               bc.id as bezel_color_id,
                               bc.name as bezel_color,
                               im.id as inner_material_id,
                               im.name as inner_material_name,
                               iff.id as flower_id,
                               iff.name as flower_name,
                               cs.id as color_id,
                               cs.name as color_name,
                               ia.id as asset_id,
                               ia.meta_key as asset_type,
                               ia.meta_value as asset_url,
                               ia.created_at as asset_created_at
                        FROM ${tableName} w
                        LEFT JOIN ${tableName2} p ON w.product_id = p.id
                        LEFT JOIN ine_designer d ON p.designer_id = d.id
                        LEFT JOIN ine_category c ON d.category_id = c.id
                        LEFT JOIN ine_resin r ON d.resin_id = r.id
                        LEFT JOIN ine_shape s ON d.shape_id = s.id
                        LEFT JOIN ine_bezel_material b ON d.bezel_material_id = b.id
                        LEFT JOIN ine_bezel_color bc ON d.bezel_color_id = bc.id
                        LEFT JOIN ine_inner_material im ON d.inner_material_id = im.id
                        LEFT JOIN ine_flower iff ON d.flower_id = iff.id
                        LEFT JOIN ine_color_shade cs ON d.color_id = cs.id
                        LEFT JOIN ine_assets ia ON p.marketing_id = ia.m_id`;

        const queryParams = [];

        queryStr += ` WHERE p.id IN (${productIds.map(() => '?').join(',')})`;
        queryParams.push(...productIds);

        if (categoryId) {
            queryStr += ` AND c.id = ?`;
            queryParams.push(categoryId);
        } else if (keyword) {
            queryStr += ` AND (p.name LIKE ? OR p.short_description LIKE ? OR p.long_description LIKE ?)`;
            const keywordParam = `%${keyword}%`;
            queryParams.push(keywordParam, keywordParam, keywordParam);
        }

        const results = await query(queryStr, queryParams);

        if (results.length > 0) {
            const responseData = results.reduce((acc, row) => {
                let product = acc.find(item => item.id === row.id);
                if (!product) {
                    product = {
                        id: row.id,
                        designer_id: row.designer_id,
                        weight: row.weight,
                        model_number: row.model_number,
                        sub_model_number: row.sub_model_number,
                        product_name: row.name,
                        shape_id: row.shape_id,
                        shape: row.shape_name,
                        resin_id: row.resin_id,
                        resin: row.resin_name,
                        category_id: row.category_id,
                        category: row.category_name,
                        bezel_material_id: row.bezel_material_id,
                        bezel_material: row.bezel_material,
                        inner_material_id: row.inner_material_id,
                        inner_material_name: row.inner_material_name,
                        flower_id: row.flower_id,
                        flower_name: row.flower_name,
                        bezel_color_id: row.bezel_color_id,
                        bezel_color: row.bezel_color,
                        color_id: row.color_id,
                        color: row.color_name,
                        short_description: row.short_description,
                        long_description: row.long_description,
                        price: row.price,
                        discount_price: row.discount_price,
                        stock: row.stock,
                        coming_soon: row.coming_soon,
                        created_at: row.created_at,
                        status: row.status,
                        images: [],
                        videos: []
                    };
                    acc.push(product);
                }
                if (row.asset_type && row.asset_url) {
                    if (row.asset_type === 'image') {
                        product.images.push({
                            url: row.asset_url,
                            created_at: row.asset_created_at
                        });
                    } else if (row.asset_type === 'video') {
                        product.videos.push({
                            url: row.asset_url,
                            created_at: row.asset_created_at
                        });
                    }
                }
                return acc;
            }, []);

            return sendResponse({
                data: responseData,
                message: ManageResponseStatus('fetched'),
                status: true,
                count: responseData.length
            }, 200);
        }

        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        console.error("Error occurred:", error.message);
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

        const { user_id, product_id } = await req.json();

        await query(`UPDATE ${tableName} SET product_id = ?, updated_at = NOW() WHERE id = ?`, [product_id, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_my_wishlist_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

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
            activityLog(ine_my_wishlist_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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