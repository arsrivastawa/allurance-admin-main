
// src/app/api/categories/route.js
import { query } from "../../../utils/database";
import { ine_products_ModuleID, ine_products_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, processDocument, processImageUpload } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_products_tablename;
const categoriesFolderPath = 'public/assets/images/categories';

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.name || !requestData.code) {
            return sendResponse({ error: 'Name and code fields are required', status: false }, 400);
        }

        await processDocument('image1', requestData, categoriesFolderPath);
        await processDocument('image2', requestData, categoriesFolderPath);

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (name, description, code, pair, image1, image2) VALUES (?, ?, ?, ?, ?, ?)`, [
            requestData.name,
            requestData.description || null, // Use null for optional fields
            requestData.code,
            requestData.pair || 'No',
            requestData.image1,
            requestData.image2,
        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        await activityLog(ine_products_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

        return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const id = getQueryParamId(url);
        const categoryId = url.searchParams.get('category_id');
        const keyword = url.searchParams.get('keyword');

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
                        FROM ${tableName} p
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

        if (id) {
            queryStr += ` WHERE p.id = ?`;
            queryParams.push(id);
        } else if (categoryId) {
            queryStr += ` WHERE c.id = ?`;
            queryParams.push(categoryId);
        } else if (keyword) {
            queryStr += ` WHERE p.name LIKE ? OR p.short_description LIKE ? OR p.long_description LIKE ?`;
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

        const { name, description, code, pair, image1, image2 } = await req.json();

        var image1Data = await processImageUpload('image1', image1, categoriesFolderPath);
        var image2Data = await processImageUpload('image2', image2, categoriesFolderPath);

        await query(`UPDATE ${tableName} SET name = ?, description = ?, code = ?, pair = ?, image1 = ?, image2 = ?, updated_at = NOW() WHERE id = ?`, [name, description, code, pair, image1Data, image2Data, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_products_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

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
            activityLog(ine_products_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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