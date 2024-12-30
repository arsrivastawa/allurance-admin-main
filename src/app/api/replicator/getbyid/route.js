// src/app/api/categories/route.js
import { authenticateToken } from "src/utils/authMiddleware";
import { ine_replicator_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse, getRecordByuserId, getQueryParamId, ManageResponseStatus } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_replicator_tablename;

// GET METHOD
export const GET = async (req) => {
    try {
        await authenticateToken(req);
        const id = getQueryParamId(new URL(req.url));
        if (id) {
            const results = await getRecordByuserId(id, tableName, 'id');
            if (results.length > 0) {
                return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        // return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};