
// src/app/api/designer/route.js
import { query } from "../../../utils/database";
import { ine_designer_ModuleID, ine_designer_tablename, ine_manage_request_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, processDocument, processImageUpload } from "../../../utils/commonFunction";
import { getDesignerDetail } from './designerDetail';

// Table Name
const tableName = ine_designer_tablename;

const governmentFolderPath = 'public/assets/images/documents/government';

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();
        // Validate request data
        if (!requestData.title || !requestData.category_id || !requestData.resin_id || !requestData.shape_id || !requestData.size_id || !requestData.bezel_material_id || !requestData.bezel_color_id || !requestData.Inner_material_id || !requestData.flower_id || !requestData.color_id) {
            return sendResponse({ error: 'Title, Category, Resin, Shape, Size, Bezel Material, Bezel Color, Inner Material, Manufacturing Pieces, Flower and Color fields is required', status: false }, 400);
        }

        await processDocument('image1', requestData, governmentFolderPath); // Image1
        await processDocument('image2', requestData, governmentFolderPath); // Image2
        await processDocument('image3', requestData, governmentFolderPath); // Image3
        await processDocument('image4', requestData, governmentFolderPath); // Image4
        await processDocument('image5', requestData, governmentFolderPath); // Image5
        await processDocument('image6', requestData, governmentFolderPath); // Image6

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (title,created_by, category_id, resin_id, shape_id, size_id, bezel_material_id, bezel_color_id, Inner_material_id, flower_id, color_id, image1, image2, image3, image4, image5, image6,in_pair) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
            requestData.title, requestData.apihitid, requestData.category_id, requestData.resin_id, requestData.shape_id, requestData.size_id, requestData.bezel_material_id, requestData.bezel_color_id, requestData.Inner_material_id, requestData.flower_id, requestData.color_id, requestData.image1, requestData.image2, requestData.image3, requestData.image4, requestData.image5, requestData.image6, requestData.in_pair
        ]);

        const insertedRecordId = insertResult.insertId;

        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        await query(`INSERT INTO ${ine_manage_request_tablename} (module_id, row_id, request_status, comments, created_by) VALUES (?,?,?,?,?)`, [
            ine_designer_ModuleID, insertedRecordId, 1, null, requestData.apihitid
        ]);

        // await activityLog(ine_designer_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

        return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// GET METHOD
export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        return await getDesignerDetail(id);
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

        const { title, category_id, resin_id, shape_id, size_id, bezel_material_id, bezel_color_id, Inner_material_id, flower_id, color_id, image1, image2, image3, image4, image5, image6, in_pair, apihitid } = await req.json();

        // Validate request data
        if (!title || !category_id || !resin_id || !shape_id || !size_id || !bezel_material_id || !bezel_color_id || !Inner_material_id || !flower_id || !color_id || !in_pair) {
            return sendResponse({ error: 'Title, Category, Resin, Shape, Size, Bezel Material, Bezel Color, Inner Material, Flower,Pair and Color fields are required', status: false }, 400);
        }

        // Process image uploads only if imageData is present
        let image1Data = image1?.imageData ? await processImageUpload(image1) : image1;
        let image2Data = image2?.imageData ? await processImageUpload(image2) : image2;
        let image3Data = image3?.imageData ? await processImageUpload(image3) : image3;
        let image4Data = image4?.imageData ? await processImageUpload(image4) : image4;
        let image5Data = image5?.imageData ? await processImageUpload(image5) : image5;
        let image6Data = image6?.imageData ? await processImageUpload(image6) : image6;

        // Update record in the database
        await query(`UPDATE ${tableName} SET title = ?, updated_by = ?, category_id = ?, resin_id = ?, shape_id = ?, size_id = ?, bezel_material_id = ?, bezel_color_id = ?, Inner_material_id = ?, flower_id = ?, color_id = ?, image1 = ?, image2 = ?, image3 = ?, image4 = ?, image5 = ?, image6 = ?,in_pair=?, updated_at = NOW() WHERE id = ?`, [title, apihitid, category_id, resin_id, shape_id, size_id, bezel_material_id, bezel_color_id, Inner_material_id, flower_id, color_id, image1Data, image2Data, image3Data, image4Data, image5Data, image6Data, in_pair, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        // Maintain Activity Log
        await activityLog(ine_designer_ModuleID, existingRecord, updatedRecord, 2, 0);

        // Return success response
        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        // Return error response
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