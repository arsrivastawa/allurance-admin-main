// src/app/api/ticket/subject/route.js
import { query } from "../../../utils/database";
import { ine_serial_number } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_serial_number;

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();
        const { serial_number, model_number, batch_number } = requestData;
        if (!serial_number || !model_number || !batch_number) {
            return sendResponse({ error: 'serial_number, model_number, and batch_number fields are required', status: false }, 400);
        }
        const serialResults = await query(`SELECT replicator_id FROM ${tableName} WHERE serial_number = ? AND batch_sequence_no = ?`, [serial_number, batch_number]);
        if (serialResults.length === 0) {
            return sendResponse({ error: 'Product is not genuine', status: false }, 404);
        }
        const { replicator_id } = serialResults[0];
        const replicatorResults = await query(`SELECT designer_id FROM ine_replicator WHERE id = ?`, [replicator_id]);
        if (replicatorResults.length === 0) {
            return sendResponse({ error: 'Model number not found', status: false }, 404);
        }
        const { designer_id } = replicatorResults[0];
        if (designer_id) {
            return sendResponse({ message: 'The product is genuine', status: true }, 200);
        } else {
            return sendResponse({ error: 'Model number does not match', status: false }, 400);
        }
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
