
// src/app/api/categories/route.js
import { query } from "../../../../utils/database";
import { ine_warehouse_racks_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse, getRecordById, getQueryParamId, ManageResponseStatus } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_warehouse_racks_tablename;

const warehouseTableName = 'ine_warehouse'; // Warehouse table name
const cartonsTableName = 'ine_packers_cartons'; // Cartons table name

export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        if (id) {
            const results = await getRecordById(id, tableName, 'id');
            if (results.length > 0) {
                const enrichedResults = await enrichData(results);
                return sendResponse({ data: enrichedResults[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const results = await query(`SELECT * FROM ${tableName} WHERE is_shipped =0 AND is_deleted = 0 ORDER BY created_at DESC`);
        const enrichedResults = await enrichData(results);
        return sendResponse({ data: enrichedResults, message: ManageResponseStatus('fetched'), status: true, count: enrichedResults.length }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

const enrichData = async (records) => {
    const enrichedRecords = await Promise.all(
        records.map(async (record) => {
            const rackDetails = await query(`SELECT rack_title, rack_code FROM ${warehouseTableName} WHERE id = ${record.rack_id}`);
            const cartonDetails = await query(`SELECT title FROM ${cartonsTableName} WHERE id = ${record.carton_id}`);

            return {
                ...record,
                rack_title: rackDetails.length ? rackDetails[0].rack_title : null,
                rack_code: rackDetails.length ? rackDetails[0].rack_code : null,
                carton_title: cartonDetails.length ? cartonDetails[0].title : null,
            };
        })
    );
    return enrichedRecords;
};

