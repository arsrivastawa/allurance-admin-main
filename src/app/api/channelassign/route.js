
// src/app/api/categories/route.js
import { query } from "../../../utils/database";
import { ine_designer_tablename, ine_offline_sales_tablename, ine_online_sales_channel_tablename, ine_packers_boxes_tablename, ine_packers_carton_element_tablename, ine_packers_cartons_tablename, ine_products_tablename, ine_replicator_tablename, ine_serial_number, ine_warehouse_racks_tablename, ine_warehouse_tablename } from "../../../utils/apiEndPoints";
import { sendResponse, getRecordById, getQueryParamId, ManageResponseStatus } from "../../../utils/commonFunction";
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_warehouse_racks_tablename;
const tableName1 = ine_offline_sales_tablename;
const tableName2 = ine_online_sales_channel_tablename;
const tableName3 = ine_packers_boxes_tablename;
const tableName4 = ine_serial_number;
const tableName5 = ine_replicator_tablename;
const tableName6 = ine_packers_carton_element_tablename
const tablename7 = ine_products_tablename
const tableName8 = ine_designer_tablename
const warehouseTableName = ine_warehouse_tablename; // Warehouse table name
const cartonsTableName = ine_packers_cartons_tablename; // Cartons table name


// GET METHOD 
export const GET = async (req) => {
    try {
        await authenticateToken(req);
        const id = getQueryParamId(new URL(req.url));
        if (id) {
            const results = await getRecordById(id, tableName, 'id');
            if (results.length > 0) {
                const enrichedResults = await enrichData(results);
                return sendResponse({ data: enrichedResults[0], message: ManageResponseStatus('fetched'), status: true }, 200);
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const results = await query(`SELECT * FROM ${tableName}  ORDER BY created_at DESC`);
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

export const PUT = async (req) => {
    try {
        await authenticateToken(req);
        const { cartons, channels, apihitid } = await req.json();
        if (!cartons || cartons.length === 0) {
            return sendResponse({ error: 'Cartons array is required and cannot be empty' }, 400);
        }

        const modelNumberCounts = new Map();

        for (const cartonId of cartons) {
            await query(
                `UPDATE ${tableName} SET is_shipped = ?, assigned_channel_id = ?, updated_by = ? , updated_at = NOW() WHERE carton_id = ?`,
                [1, channels, apihitid, cartonId]
            );

            if (channels == 8) {
                await query(
                    `INSERT INTO ${tableName1} (carton_id, status, created_at) VALUES (?, ?, NOW())`,
                    [cartonId, 1]
                );
            }

            if (channels == 9) {
                await query(
                    `INSERT INTO ${tableName2} (carton_id, status, created_by, created_at) VALUES (?, ?, ?, NOW())`,
                    [cartonId, 1, apihitid]
                );

                const cartonElements = await query(
                    `SELECT * FROM ${tableName6} WHERE carton_id = ?`,
                    [cartonId]
                );

                for (const element of cartonElements) {

                    const designerIdResult = await query(
                        `SELECT r.designer_id
                            FROM ${tableName3} pb
                            INNER JOIN ${tableName4} sn ON pb.serial_number_id = sn.id
                            INNER JOIN ${tableName5} r ON sn.replicator_id = r.id
                            WHERE pb.id = ?`,
                        [element.box_id]
                    );

                    const designerId = designerIdResult.length > 0 ? designerIdResult[0].designer_id : null;

                    if (designerId) {

                        const designerInfo = await query(
                            `SELECT model_number FROM ${tableName8} WHERE model_number = ?`,
                            [designerId]
                        );
                        if (designerInfo.length > 0) {
                            const modelNumber = designerInfo[0].model_number;

                            if (modelNumberCounts.has(modelNumber)) {
                                modelNumberCounts.set(modelNumber, modelNumberCounts.get(modelNumber) + 1);
                            } else {
                                modelNumberCounts.set(modelNumber, 1);
                            }
                        }
                    }
                }
            }
        }

        // Update product stock based on modelNumberCounts
        for (const [modelNumber, count] of modelNumberCounts.entries()) {
            await query(
                `UPDATE ${tablename7} p
                    INNER JOIN ${tableName8} d ON p.designer_id = d.id
                    SET p.stock = p.stock + ?
                    WHERE d.model_number = ?`,
                [count, modelNumber]
            );
        }

        return sendResponse({ message: 'Carton statuses and product stock updated successfully' }, 200);
    } catch (error) {
        console.error("Error occurred:", error.message);
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};





