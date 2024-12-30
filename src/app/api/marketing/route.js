
// src/app/api/designer/route.js
import { query } from "../../../utils/database";
import { ine_marekting_ModuleID, ine_designer_tablename, ine_manage_request_tablename, ine_marekting_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, writeVideoToFile, writeImageToFile } from "../../../utils/commonFunction";
import path from 'path';

// Table Name
const tableName = ine_designer_tablename;
const tableName2 = ine_marekting_tablename;
const module_id = ine_marekting_ModuleID;
const governmentFolderPath = 'public/assets/images/documents/government';

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();
        const insertResult = await query(
            `INSERT INTO ${tableName2} 
            (similar_options, designer_id, title, base_price, retail_price, bulk_price, weight, description, collection, record_status, created_by, created_at, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [
                requestData.similar_options,
                requestData.designer_id,
                requestData.name,
                requestData.base_price,
                requestData.retail_price,
                requestData.bulk_price,
                requestData.weight,
                requestData.description,
                requestData.collection,
                1, // Assuming default record status is 'pending'
                requestData.user_id, // Assuming created_by is the designer_id
                1 // Assuming default status is 'Active'
            ]
        );
        const insertedRecordId = insertResult.insertId;
        const fileRecords = [];
        for (const file of requestData.files || []) {
            try {
                if (file && file.preview && file.imageData) {
                    const extension = (file.path && path.extname(file.path).toLowerCase()) || '';
                    const fileName = `${Date.now().toString()}${extension}`;
                    if (extension === '.mp4' || extension === '.mov') {
                        // Process video file
                        const video = await writeVideoToFile(file.imageData);
                        fileRecords.push({ type: 'video', path: video });
                    } else if (extension === '.png' || extension === '.jpg' || extension === '.jpeg') {
                        // Process image file
                        const image = await writeImageToFile(file.imageData);
                        fileRecords.push({ type: 'image', path: image });
                    } else {
                        console.warn(`Unsupported file format: ${extension}`);
                        continue; // Skip processing if the file format is not supported
                    }
                }
            } catch (error) {
                console.error(`Error processing file: ${error.message}`);
                throw error;
            }
        }
        for (const fileRecord of fileRecords) {
            await insertMetaData(insertedRecordId, fileRecord.type, fileRecord.path); // Use file type ('image' or 'video') as the meta_key
        }
        await insertMetaData(insertedRecordId, 'create', 1);
        for (const [key, value] of Object.entries(requestData)) {
            // Exclude designer_id, user_id, and files
            if (key !== 'designer_id' && key !== 'user_id' && key !== 'files') {
                await insertMetaData(insertedRecordId, key, value);
            }
        }
        await query(`INSERT INTO ${ine_manage_request_tablename} (module_id, row_id, request_status, comments, created_by) VALUES (?,?,?,?,?)`, [
            module_id, insertedRecordId, 1, null, 1
        ]);
        return sendResponse({ data: { id: insertedRecordId }, message: 'Data inserted successfully', status: true }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// Define a reusable function to insert meta data
const insertMetaData = async (mId, metaKey, metaValue) => {
    await query(
        `INSERT INTO ine_marketing_meta 
                (m_id, meta_key, meta_value, created_at) 
                VALUES (?, ?, ?, NOW())`,
        [mId, metaKey, metaValue]
    );
};

// Define a reusable function to insert image into ine_assets table
export const insertImageIntoAssetsTable = async (mId, metaKey, metaValue) => {
    try {
        const insertResult = await query(
            `INSERT INTO ine_assets (m_id, meta_key, meta_value, created_at) VALUES (?, ?, ?, NOW())`,
            [mId, metaKey, metaValue]
        );
    } catch (error) {
        console.error(`Error inserting image path into ine_assets table: ${error.message}`);
    }
};

// GET METHOD
export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        const baseQuery = `
            SELECT 
                t1.*, 
                COALESCE(t2.record_status, 0) AS marketing_product_record_status,
                t3.name AS category_name,
                t4.name AS resin_name,
                t5.shape AS shape_name,
                t6.length AS size_length,
                t6.breadth AS size_breadth,
                t7.name AS bezel_material_name,
                t8.name AS bezel_color_name,
                t9.name AS inner_material_name,
                t10.name AS flower_name,
                t11.name AS color_name
            FROM ${tableName} t1
            LEFT JOIN ${tableName2} t2 ON t1.id = t2.designer_id
            LEFT JOIN ine_category t3 ON t1.category_id = t3.id
            LEFT JOIN ine_resin t4 ON t1.resin_id = t4.id
            LEFT JOIN ine_shape t5 ON t1.shape_id = t5.id
            LEFT JOIN ine_size_for_shape t6 ON t1.size_id = t6.id
            LEFT JOIN ine_bezel_material t7 ON t1.bezel_material_id = t7.id
            LEFT JOIN ine_bezel_color t8 ON t1.bezel_color_id = t8.id
            LEFT JOIN ine_inner_material t9 ON t1.inner_material_id = t9.id
            LEFT JOIN ine_flower t10 ON t1.flower_id = t10.id
            LEFT JOIN ine_color_shade t11 ON t1.color_id = t11.id
            WHERE t1.record_status = 2 AND t1.status = 1`;
        if (id) {
            const query1 = `SELECT * from ${tableName2} where designer_id = ? ORDER BY id DESC `;
            const results = await query(query1, [id]);
            if (results.length > 0) {
                const foundRecord = results[0]; // Assuming only one record is found, otherwise iterate over results
                const marketingId = foundRecord.id;
                // Query ine_marketing_meta to fetch metadata
                // const metaQuery = `SELECT meta_key, meta_value FROM ine_marketing_meta WHERE m_id = ? ORDER BY created_at DESC`;
                // const metaResults = await query(metaQuery, [marketingId]);
                const query2 = `SELECT * from ine_marketing_meta where m_id = ? AND created_at = (
                    SELECT MAX(created_at) 
                    FROM ine_marketing_meta 
                    WHERE m_id = ? AND meta_key = 'image')`;
                const metaResults = await query(query2, [marketingId, marketingId]);
                // Extract metadata and add it to the found record
                metaResults.forEach(result => {
                    foundRecord[result.meta_key] = result.meta_value;
                });
                // Query ine_assets to fetch image paths
                const imageQuery = `
                SELECT meta_value 
                FROM ine_marketing_meta 
                WHERE m_id = ? 
                  AND (meta_key = 'image' OR meta_key = 'video')
                  AND created_at = (
                    SELECT MAX(created_at) 
                    FROM ine_marketing_meta 
                    WHERE m_id = ? 
                      AND (meta_key = 'image' OR meta_key = 'video')
                  )`;
                const imageResults = await query(imageQuery, [marketingId, marketingId]);
                const imagePaths = imageResults.map(result => result.meta_value);
                if (imagePaths.length > 0) {
                    foundRecord.images = imagePaths;
                }
                return sendResponse({ data: foundRecord, message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }
        const query2 = `${baseQuery} ORDER BY id DESC`;
        const results = await query(query2);
        if (results.length > 0) {
            return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// PUT METHOD
export const PUT = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        const requestData = await req.json();
        const fileRecords = [];
        for (const file of requestData.files || []) {
            try {
                if (file && file.preview && file.imageData) {
                    // Determine the file type based on the preview URL or imageData
                    const fileType = determineFileType(file);

                    if (fileType === 'video') {
                        const videoUrl = await writeVideoToFile(file.imageData);
                        fileRecords.push({ type: 'video', url: videoUrl });
                    } else if (fileType === 'image') {
                        const imageUrl = await writeImageToFile(file.imageData);
                        fileRecords.push({ type: 'image', url: imageUrl });
                    } else {
                        console.warn(`Unsupported file format for file: ${file.preview}`);
                        continue; // Skip processing if the file format is not supported
                    }
                }
            } catch (error) {
                console.error(`Error processing file: ${error.message}`);
                throw error;
            }
        }
        for (const fileRecord of fileRecords) {
            await insertMetaData(id, fileRecord.type, fileRecord.url); // Use file type ('image' or 'video') as the meta_key
        }
        await insertMetaData(id, 'update', 1);
        for (const [key, value] of Object.entries(requestData)) {
            if (key !== 'designer_id' && key !== 'user_id' && key !== 'files' && key !== 'id') {
                await insertMetaData(id, key, value);
            }
        }
        await query(`UPDATE ${tableName2} SET record_status = ? WHERE id = ? `, [1, id]);
        await query(`INSERT INTO ${ine_manage_request_tablename} (module_id, row_id, request_status, comments, created_by) VALUES (?,?,?,?,?)`, [
            module_id, id, 1, null, 1
        ]);
        return sendResponse({ message: 'Data updated successfully', status: true }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// Function to determine the file type based on the file preview URL or data
function determineFileType(file) {
    if (file.preview && file.preview.includes('.mp4')) {
        return 'video';
    } else if (file.preview && (file.preview.includes('.png') || file.preview.includes('.jpg') || file.preview.includes('.jpeg'))) {
        return 'image';
    } else if (file.imageData) {
        // You can implement more sophisticated checks here based on the imageData content
        return 'image'; // Assume it's an image if no other matches found
    } else {
        return null; // File type cannot be determined
    }
}

export const DELETE = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        const deletedIds = id ? [id] : getQueryParamIds(new URL(req.url));
        if (!deletedIds || deletedIds.length === 0) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }
        await Promise.all(deletedIds.map(async (deletedId) => {
            const [currentRecord] = await getRecordById(deletedId, tableName, 'id');
            activityLog(ine_marekting_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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