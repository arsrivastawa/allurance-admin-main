
// src/app/api/about/route.js
import { query } from "../../../utils/database";
import { ine_about_ModuleID, ine_about_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, ManageResponseStatus, processImageUpload } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_about_tablename;
const blogFolderPath = 'public/assets/images/blog';

// GET METHOD
export const GET = async (req) => {
    try {
        var results = await query(`SELECT * FROM ${tableName} WHERE id = ?`, [1]);
        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// PUT METHOD
export const PUT = async (req) => {
    try {

        const { title, short_description, long_description, image1, apihitid } = await req.json();

        var image1Data = await processImageUpload('image1', image1, blogFolderPath);

        await query(`UPDATE ${tableName} SET title = ?, short_description = ?, long_description = ?, image1 = ?,updated_by=?, updated_at = NOW() WHERE id = ?`, [title, short_description, long_description, image1Data, apihitid, 1]);

        // Retrieve the updated record
        const [updatedRecord] = await query(`SELECT * FROM ${tableName} WHERE id = ?`, [1]);

        await activityLog(ine_about_ModuleID, updatedRecord, updatedRecord, 2, 0); // Maintain Activity Log

        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
