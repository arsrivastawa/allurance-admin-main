
// src/app/api/categories/route.js
import { query } from "../../../../utils/database";
import { ine_category_ModuleID, ine_packers_boxes_tablename, ine_serial_number } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../../utils/commonFunction";
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_packers_boxes_tablename;
const tableName3 = ine_serial_number;
const tableName5 = 'ine_serial_verification'

const generateRandomAuthKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 16;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

export const POST = async (req) => {
    try {
        await authenticateToken(req);
        const requestData = await req.json();
        if (!Array.isArray(requestData.authenticationdetails) || requestData.authenticationdetails.length === 0) {
            return sendResponse({
                error: 'Authenticationdetails fields are required, and authenticationdetails must be a non-empty',
                status: false
            }, 400);
        }
        const { batch_number, authenticationdetails } = requestData;
        const responses = [];
        for (const serialNumberObj of authenticationdetails) {
            const { index, serialNumber, batchNumber } = serialNumberObj;
            if (!serialNumber || !batchNumber) {
                responses.push({
                    index,
                    serialNumber,
                    status: false,
                    message: 'Each serial number object must include index, serialNumber, and batchNumber.'
                });
                continue;
            }

            const results = await query(
                `SELECT * FROM ${tableName3} WHERE (serial_number = ? OR RIGHT(serial_number, 6) = ?) AND batch_sequence_no = ?`,
                [serialNumber, serialNumber, batchNumber]
            );

            if (results && results.length > 0) {
                const existingRecord = results[0];
                const productId = existingRecord.id;
                let status;
                let authKey = null;

                if (existingRecord.is_packed === 1) {
                    let isUnique = false;
                    while (!isUnique) {
                        authKey = generateRandomAuthKey();
                        const [authRecord] = await query(`SELECT * FROM ${tableName} WHERE authenticity_number = ?`, [authKey]);
                        if (!authRecord) {
                            isUnique = true;
                        }
                    }
                    status = 1;
                } else if (existingRecord.is_packed === 2) {
                    status = 2;
                } else {
                    status = 0;
                }

                responses.push({
                    index,
                    serialNumber,
                    status,
                    authKey,
                    productId,
                    message: status === 1 ? 'The product is genuine' : (status === 2 ? 'The product is genuine but already packed' : 'Invalid product status')
                });
            } else {
                responses.push({
                    index,
                    serialNumber,
                    status: 3,
                    message: 'Authentication failed: serial number or batch number is invalid'
                });
            }
        }

        // Perform database insertions for all records
        for (const response of responses) {
            // console.log(`Inserting into ${tableName5}:`, {
            //     index: response.index,
            //     serialNumber: response.serialNumber,
            //     batchNumber: batch_number,  // Corrected line to use batch_number from requestData
            //     status: response.status
            // }); // Debugging line to check the values being inserted
            await query(
                `INSERT INTO ${tableName5} (index_, serial_number, batch_number, auth_status) VALUES (?, ?, ?, ?)`,
                [response.index, response.serialNumber, batch_number, response.status]  // Corrected line to use batch_number from requestData
            );
        }

        // Filter responses to include only those with status 1
        const successfulResponses = responses.filter(response => response.status === 1);

        return sendResponse({
            data: successfulResponses,
            status: true,
            message: 'Processed all serial numbers'
        }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

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