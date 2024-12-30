// src/app/api/modules/route.js
import { query } from "src/utils/database";
import { ine_modules_tablename, ine_permissions_tablename } from "src/utils/apiEndPoints";
import { sendResponse, getQueryParamId, ManageResponseStatus } from "src/utils/commonFunction";

// Table Name
const tableName = ine_modules_tablename;
const tableName2 = ine_permissions_tablename;

export const POST = async (req) => {
    try {
        const { role_id } = await req.json();
        const id = getQueryParamId(new URL(req.url));
        if (!role_id) {
            return sendResponse({ error: 'Role ID is required' }, 400);
        }

        let query1;
        let queryParams = [role_id];

        if (id) {
            query1 = `
                SELECT m.*, p.role_id ,p.read_access ,p.add_access,p.update_access,p.delete_access
                FROM ${tableName} m
                JOIN ${tableName2} p ON m.index_of = p.module_id
                WHERE p.role_id = ? AND m.index_of = ?`;
            queryParams.push(id);
        } else {
            query1 = `
                SELECT m.*
                FROM ${tableName} m
                JOIN ${tableName2} p ON m.index_of = p.module_id
                WHERE m.index_of = 0 AND p.role_id = ?`;
        }

        const results = await query(query1, queryParams);

        if (results.length > 0) {
            // Check if the path field exists
            const hasPath = results.some(result => result.path);
            if (!hasPath) {
                // Fetch additional permissions for each module
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    const additionalPermissions = await fetchAdditionalPermissions(role_id, result.id);
                    // Merge additional permissions with the main result
                    results[i] = { ...result, ...additionalPermissions };
                }
            }

            // Filter the results based on specified conditions
            const filteredResults = results.filter(result => {
                // Check if name is 'Create' and add_access is 1
                if (result.name === 'Create' && result.add_access === 1) {
                    return true;
                }
                // Check if name is 'List' and read_access is 1
                if (result.name === 'List' && result.read_access === 1) {
                    return true;
                }
                // Check if read_access is 1 and the name is not 'List' or 'Create'
                if (result.read_access === 1 && result.name !== 'List' && result.name !== 'Create') {
                    return true;
                }
                return false; // Exclude this object from the results
            });

            return sendResponse({ data: filteredResults, message: ManageResponseStatus('fetched'), status: true, count: filteredResults.length }, 200);
        }

        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// // Function to fetch additional permissions for a given module ID
const fetchAdditionalPermissions = async (roleid, moduleId) => {
    const query2 = `
        SELECT read_access, add_access, update_access, delete_access
        FROM ${tableName2}
        WHERE role_id = ? AND module_id = ?`;
    const queryParams2 = [roleid, moduleId];
    const permissions = await query(query2, queryParams2);

    if (permissions.length > 0) {
        // Return additional permissions
        return permissions[0];
    }
    // Return default permissions if no additional permissions found
    return { add_access: 0, update_access: 0, delete_access: 0, read_access: 0 };
};


