import { query } from "../../../../utils/database";
import { ine_packers_cartons_tablename, ine_roles_tablename, ine_warehouse_racks_tablename, ine_warehouse_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse, getQueryParamId, ManageResponseStatus } from "../../../../utils/commonFunction";
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_warehouse_tablename;
const tableName2 = ine_warehouse_racks_tablename;
const tableName3 = ine_roles_tablename;
const tableName4 = ine_packers_cartons_tablename;

export const GET = async (req) => {
    try {
        await authenticateToken(req);
        const id = getQueryParamId(new URL(req.url));
        // Fetch all records if no ID is provided
        // const results = await query(`
        //     SELECT t.*, COALESCE(c.count, 0) AS count, c.assigned_channel_id, r.name AS assigned_channel_name
        //     FROM ${tableName} t
        //     LEFT JOIN (
        //         SELECT rack_id, COUNT(*) AS count, assigned_channel_id
        //         FROM ${tableName2}
        //         GROUP BY rack_id, assigned_channel_id
        //     ) c ON t.id = c.rack_id
        //     LEFT JOIN ${tableName3} r ON c.assigned_channel_id = r.id
        // `);
        const results = await query(`
            SELECT t.*, 
                   COALESCE(c.count, 0) AS count, 
                   c.assigned_channel_id, 
                   r.name AS assigned_channel_name,
                   carton.title AS carton_name
            FROM ${tableName} t
            LEFT JOIN (
                SELECT rack_id, COUNT(*) AS count, assigned_channel_id, carton_id
                FROM ${tableName2}
                GROUP BY rack_id, assigned_channel_id, carton_id
            ) c ON t.id = c.rack_id
            LEFT JOIN ${tableName3} r ON c.assigned_channel_id = r.id
            LEFT JOIN ${tableName4} carton ON c.carton_id = carton.id
        `);
        return sendResponse({
            data: results,
            message: ManageResponseStatus('fetched'),
            status: true,
            count: results.length
        }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};