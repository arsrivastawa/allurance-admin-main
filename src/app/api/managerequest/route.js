
// src/app/api/managerequest/route.js
import { query } from "../../../utils/database";
import { ine_giftcard_tablename, ine_manage_request_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, ManageResponseStatus } from "../../../utils/commonFunction";
import { getRequestDetail } from '../../../app/api/designer/designerDetail';
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_manage_request_tablename;
const tableName2 = ine_giftcard_tablename;

// GET METHOD
export const GET = async (req) => {
    await authenticateToken(req);
    try {
        const id = getQueryParamId(new URL(req.url));
        return await getRequestDetail(id);
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

        const [existingRecord] = await getRecordById(id, tableName, 'id');

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const { comments } = await req.json();

        await query(`UPDATE ${tableName} SET comments = ?, updated_at = NOW() WHERE id = ?`, [comments, id]);


        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog('', existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

