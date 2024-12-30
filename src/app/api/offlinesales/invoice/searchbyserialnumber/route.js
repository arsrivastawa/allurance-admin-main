import { query } from "../../../../../utils/database";
import { user_addresses_tablename } from "../../../../../utils/apiEndPoints";
import { sendResponse, getQueryParamId, ManageResponseStatus } from "../../../../../utils/commonFunction";

// Table Names
const tableName = user_addresses_tablename;

export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        if (id) {
            const results = await query(`
                SELECT isn.*, ir.designer_id as irdesignerid, ir.id as irid, id.id as designer_id, ip.name as ptitle, ip.price as pbaseprice , ip.discount_price as pdiscountprice, ip.id as id
                FROM ine_serial_number AS isn
                LEFT JOIN ine_replicator AS ir ON ir.id = isn.replicator_id
                LEFT JOIN ine_designer AS id ON id.model_number = ir.designer_id
                LEFT JOIN ine_products AS ip ON ip.designer_id = id.id
                WHERE serial_number = ?`, [id]);
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
        return sendResponse({ error: `Error occurred: ${error.message}`, status: false }, 500);
    }
};

