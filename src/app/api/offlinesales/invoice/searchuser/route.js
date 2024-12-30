
/// src/app/api/designer/route.js
import { query } from "../../../../../utils/database";
import { ine_designer_ModuleID, ine_offline_sales_ModuleID, ine_manage_request_tablename, ine_marekting_tablename, ine_users_tablename } from "../../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, writeImageToFiles, writeVideoToFiles, getUserByPhoneNumber } from "../../../../../utils/commonFunction";

// Table Names
const tableName = ine_users_tablename;
const tableName2 = ine_marekting_tablename;
const module_id = ine_offline_sales_ModuleID;
const tableName3 = "ine_assets";

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();
        if (!requestData.phone_number) {
            return sendResponse({ error: 'Phone number is required', status: false }, 400);
        }
        const user = await getUserByPhoneNumber(requestData.phone_number, tableName);
        if (user[0]) {
            return sendResponse({ data: user[0], message: 'User found', status: true }, 200);
        }
        // Return response with user details if found
        return sendResponse({ error: 'User not found', status: false }, 404);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}`, status: false }, 500);
    }
};

export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        let results;

        if (id) {
            results = await query(`
                SELECT m.*, d.model_number, d.sub_model_number, d.in_pair
                FROM ${tableName2} m
                JOIN ${tableName} d ON m.designer_id = d.id
                WHERE m.record_status=2 AND m.status = 1 AND m.id = ?
            `, [id]);
        } else {
            results = await query(`
                SELECT m.*, d.model_number, d.sub_model_number, d.in_pair 
                FROM ${tableName2} m
                JOIN ${tableName} d ON m.designer_id = d.id
                WHERE m.record_status=2 AND m.status = 1
            `);
        }
        if (results.length > 0) {
            const enhancedResults = await Promise.all(results.map(async (record) => {
                const assetRecords = await query(`
                    SELECT *
                    FROM ${tableName3}
                    WHERE m_id = ? AND created_at = (
                        SELECT MAX(created_at) 
                        FROM ${tableName3} 
                        WHERE m_id = ? AND meta_key IN ('video', 'image')
                    )
                `, [record.id, record.id]);
                // Initialize arrays for images and videos
                record.images = [];
                record.videos = [];
                // Populate images and videos arrays
                assetRecords.forEach(asset => {
                    if (asset.meta_key === 'image') {
                        record.images.push(asset.meta_value);
                    } else if (asset.meta_key === 'video') {
                        record.videos.push(asset.meta_value);
                    }
                });
                return record;
            }));
            if (id) {
                return sendResponse({ data: enhancedResults[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            } else {
                return sendResponse({ data: enhancedResults, message: ManageResponseStatus('fetched'), status: true, count: enhancedResults.length }, 200);
            }
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

export const PUT = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        const requestData = await req.json();
        const fileRecords = [];
        for (const file of requestData.files || []) {
            try {
                if (file && file.preview && file.fileData) {
                    // Determine the file type based on the preview URL or fileData
                    const fileType = determineFileType(file);

                    if (fileType === 'video') {
                        // Process video file
                        const fileName = `${Date.now().toString()}.mp4`; // Assuming it's a video file
                        const videoUrl = await writeVideoToFiles(fileName, file.fileData);
                        fileRecords.push({ type: 'video', url: videoUrl });
                    } else if (fileType === 'image') {
                        // Process image file
                        const fileName = `${Date.now().toString()}.jpeg`; // Assuming it's an image file
                        const imageUrl = await writeImageToFiles(fileName, file.fileData);
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
    } else if (file.fileData) {
        // You can implement more sophisticated checks here based on the fileData content
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
            activityLog(ine_designer_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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