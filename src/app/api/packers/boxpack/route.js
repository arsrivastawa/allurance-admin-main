
// src/app/api/categories/route.js
import { query } from "../../../../utils/database";
import { ine_packers_boxes_tablename, ine_serial_number } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_packers_boxes_tablename;
const tableName3 = ine_serial_number;

export const POST = async (req) => {
    try {
        const { products } = await req.json();

        // Check if products is an array
        if (!Array.isArray(products)) {
            return sendResponse({ error: 'Products must be an array', status: false }, 400);
        }

        // Iterate over each product in the array
        const createdBoxes = [];
        for (const product of products) {
            // Check if required fields are present in each product
            const { box_label, tag_for_potli, authenticity_card, serial_number, product_id } = product;
            if (!box_label || !tag_for_potli || !authenticity_card || !serial_number || !product_id) {
                return sendResponse({ error: 'All fields are required for each product', status: false }, 400);
            }

            // Insert product details into the primary table
            const insertProductQuery = `INSERT INTO ${tableName} (authenticity_number, tag_for_potli, title, serial_number_id) VALUES (?, ?, ?, ?)`;
            const insertResult = await query(insertProductQuery, [
                authenticity_card,
                tag_for_potli,
                box_label,
                product_id
            ]);

            // Update the status of the product in tablename3
            const updateStatusQuery = `UPDATE ${tableName3} SET is_packed = ? WHERE id = ?`;
            await query(updateStatusQuery, [2, product_id]);

            const [existingRecord] = await query(`
                SELECT 
                  t3.id,
                  t3.serial_number,
                  t3.l_serial_number,
                  t3.r_serial_number,
                  t3.batch_sequence_no,
                  d.model_number,
                  c.name AS category_name,
                  p.price,
                  p.discount_price,
                  p.weight
                FROM 
                  ${tableName3} t3
                LEFT JOIN 
                  ine_replicator r ON t3.replicator_id = r.id
                LEFT JOIN 
                  ine_designer d ON r.designer_id = d.model_number
                LEFT JOIN 
                  ine_category c ON d.category_id = c.id
                LEFT JOIN 
                  ine_products p ON d.id = p.designer_id
                WHERE 
                  t3.id = ?;
              `, [product_id]);

            // Prepare the box object
            const box = {
                ...product,
                id: existingRecord.id,
                serial_number: existingRecord.serial_number,
                l_serial_number: existingRecord.l_serial_number,
                r_serial_number: existingRecord.r_serial_number,
                batch_number: existingRecord.batch_sequence_no,
                model_number: existingRecord.model_number,
                category_name: existingRecord.category_name,
                price: existingRecord.price,
                discount_price: existingRecord.discount_price,// Add more resources as needed
                weight: existingRecord.weight // Add more resources as needed
            };
            // Add the created box object to the response array
            createdBoxes.push(box);
        }

        // Prepare and send the response with all created boxes
        return sendResponse({ data: createdBoxes, message: `${createdBoxes.length} boxes created successfully`, status: true }, 201);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function isUniqueRandomString(randomString) {
    const [existingRecord] = await query(`SELECT * FROM  ${tableName3} WHERE authentication_key = ?`, [randomString]);
    return !existingRecord; // Returns true if the string is unique, false if it already exists
}

async function generateUniqueRandomString() {
    let randomString;
    do {
        randomString = generateRandomString(8);
    } while (!(await isUniqueRandomString(randomString)));
    return randomString;
}

export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));

        if (id) {
            const queryWithId = `
                SELECT
                    ip.*,
                FROM
                    ${tableName} AS ip
                    WHERE
                    ip.id = ? AND ip.is_packed = 1;
            `
            const [resultsWithId] = await query(queryWithId, [id]);
            return sendResponse({ data: resultsWithId, message: ManageResponseStatus('fetched'), status: true }, 200)
        }

        const queryWithoutId = `
            SELECT
                ip.*
            FROM
                ${tableName} AS ip
                WHERE
                ip.is_packed = 1;
        `;
        const resultsWithoutId = await query(queryWithoutId);
        return sendResponse({ data: resultsWithoutId, message: ManageResponseStatus('fetched'), status: true, count: resultsWithoutId.length }, 200);
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

        const requestData = await req.json();
        const { title, status } = requestData;

        // Check if the ID exists in the database and retrieve the existing record
        const [existingRecord] = await getRecordById(id, tableName, 'id');

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        // Update the record with the provided data
        await query(`UPDATE ${tableName} SET title = ?, status = ?, updated_at = NOW() WHERE id = ?`, [title, status, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        // Maintain Activity Log
        await activityLog(ine_category_ModuleID, existingRecord, updatedRecord, 2, 0);

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