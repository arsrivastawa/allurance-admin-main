
// src/app/api/categories/route.js
import { query } from "../../../../utils/database";
import { ine_products_ModuleID, ine_products_tablename } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, processDocument, processImageUpload } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_products_tablename;

export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
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
                        LEFT JOIN ine_assets ia ON p.marketing_id = ia.m_id
                        WHERE p.coming_soon = 1`;
        if (id) {
            queryStr += ` WHERE p.id = ? `;
        }

        const results = await query(queryStr, id ? [id] : []);

        if (results.length > 0) {
            const responseData = results.reduce((acc, row) => {
                let product = acc.find(item => item.id === row.id);
                if (!product) {
                    product = {
                        id: row.id,
                        designer_id: row.designer_id,
                        weight:row.weight,
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
        return sendResponse({ error: `Error occurred: ${error.message} ` }, 500);
    }
};

