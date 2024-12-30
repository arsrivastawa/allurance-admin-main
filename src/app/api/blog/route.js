
// src/app/api/blog/route.js
import { query } from "../../../utils/database";
import { ine_blog_ModuleID, ine_blog_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, generateUniqueSlug, processDocument, processImageUpload } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_blog_tablename;
const blogFolderPath = 'public/assets/images/blog';

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.title || !requestData.image1) {
            return sendResponse({ error: 'Title, Category and Image fields are required', status: false }, 400);
        }

        await processDocument('image1', requestData, blogFolderPath);

        let newSlug = await generateUniqueSlug(tableName, requestData.title);

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (title, category_id, slug, image1, short_description, description,created_by) VALUES (?, ?, ?, ?, ?, ?,?)`, [
            requestData.title,
            requestData.category_id,
            newSlug,
            requestData.image1,
            requestData.short_description,
            requestData.description,
            requestData.apihitid
        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        await activityLog(ine_blog_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

        return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// GET METHOD
export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const id = getQueryParamId(url);
        const slug = url.searchParams.get('slug'); // Get the slug from the query params
        const notslug = url.searchParams.get('notslug');

        const page = parseInt(url.searchParams.get('page')) || 1; // Default to page 1 if not specified
        const pageSize = parseInt(url.searchParams.get('pageSize')) || 10; // Default page size to 10 if not specified

        // Calculate offset based on page number and page size
        const offset = (page - 1) * pageSize;

        let sql = `SELECT * FROM ${tableName}`;
        const params = [];

        if (id) {
            sql += ` WHERE id = ?`;
            params.push(id);
        } else if (slug) {
            sql += ` WHERE slug = ?`;
            params.push(slug);
        } else if (notslug) {
            sql += ` WHERE slug != ?`;
            params.push(notslug);
        }


        sql += ` LIMIT ?, ?`;
        params.push(offset, pageSize);

        const results = await query(sql, params);

        if (results.length > 0) {
            if (results.length == 1) {
                return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true, count: 1 }, 200);
            }
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

        if (!id) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }

        // Check if the ID exists in the database and retrieve the existing record
        const [existingRecord] = await getRecordById(id, tableName, 'id');

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const { title, category_id, image1, short_description, description, apihitid } = await req.json();

        var image1Data = await processImageUpload('image1', image1, blogFolderPath);

        let newSlug = await generateUniqueSlug(tableName, title, id);

        await query(`UPDATE ${tableName} SET title = ?, category_id = ?, slug = ?, image1 = ?, short_description = ?, description = ?,updated_by=?, updated_at = NOW() WHERE id = ?`, [title, category_id, newSlug, image1Data, short_description, description, apihitid, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_blog_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

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
            activityLog(ine_blog_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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