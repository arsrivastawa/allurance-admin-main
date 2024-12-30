
/// src/app/api/designer/route.js
import { query } from "src/utils/database";
import { ine_my_address_tablename, user_addresses_tablename } from "../../../../../utils/apiEndPoints";
import { sendResponse, getRecordById, getQueryParamId, ManageResponseStatus } from "../../../../../utils/commonFunction";

// Table Names
// const tableName = user_addresses_tablename;
const tableName = ine_my_address_tablename;

// GET METHOD
export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));

        if (id) {
            const results = await query(`SELECT * FROM ${tableName} WHERE user_id = ?`, [id]);

            if (results.length > 0) {
                return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const results = await query(`SELECT * FROM ${tableName}`);
        if (results.length > 0) {
            return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        const { address_1, address_2, landmark, pincode, state, country, prefix_id } = requestData;
        if (!address_1 || !pincode || !state || !country || !prefix_id) {
            return sendResponse({ error: 'Address details are incomplete', status: false }, 400);
        }

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (address_1, address_2, landmark, pincode, state, country, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            address_1,
            address_2 || null, // Optional field, if not provided, insert NULL
            landmark || null, // Optional field, if not provided, insert NULL
            pincode,
            state,
            country,
            prefix_id
        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record
        return sendResponse({ data: insertedRecord, message: 'Address created successfully', status: true }, 201);

    } catch (error) {
        console.error('Error occurred:', error);
        return sendResponse({ error: `Error occurred: ${error.message}`, status: false }, 500);
    }
};
