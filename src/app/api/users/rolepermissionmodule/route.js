
// src/app/api/user/login/route.js
import { query } from "../../../../utils/database";
import { sendResponse } from "../../../../utils/commonFunction";
import { authenticateToken } from "../../../../utils/authMiddleware";

export const POST = async (req) => {
    try {
        //await authenticateToken(req);
        const userId = req.userId || 0;
        const indexOf = req.indexOf || 0;

        try {
            const sql = `
                SELECT inep.*, inem.name, inem.icon, inem.path 
                FROM \`ine_permissions\` inep
                INNER JOIN \`ine_users\` ineu ON inep.role_id = ineu.role_id
                LEFT JOIN \`ine_modules\` inem ON inem.id = inep.module_id
                WHERE ineu.id = ? 
                AND inem.index_of = ${indexOf}
                AND inep.read_access = 1
                `;
            const results = await query(sql, [userId]);

            return sendResponse({ data: results, status: true }, 200);
        } catch (error) {
            return sendResponse({ error: `Error occurred while executing SQL query: ${error.message}`, status: false }, 500);
        }
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
