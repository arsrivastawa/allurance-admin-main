import { query } from "../../../utils/database";
import { sendResponse, getQueryParamId, ManageResponseStatus } from "../../../utils/commonFunction";
import { ine_designer_tablename, ine_marekting_tablename } from "src/utils/apiEndPoints";

const tableName = ine_designer_tablename;
const tableName2 = ine_marekting_tablename;
const tableName3 = "ine_assets";

export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        const modelNumber = req.url.split('=')[1]; // Extract model number from query string

        if (id || modelNumber) {
            if (modelNumber) {
                const [replicatorResult] = await query("SELECT * FROM `ine_replicator` WHERE `designer_id` = ? ORDER BY ID", [modelNumber]);
                if (!replicatorResult) {
                    return sendResponse({ error: 'Model number not found', status: false }, 404);
                }
                const { quantity, id: replicatorId } = replicatorResult;
                const query2 = await query(`
                SELECT isn.*, isn.batch_sequence_no as batch_number, isn.serial_number, 
                       ipb.id as ipbid, ipb.title as box_name, 
                       ice.carton_id as icecarton_id, ice.box_id as icebox_id, ice.id as iceid, 
                       ipca.title as ipcatitle, ios.id as iosid,
                       ipc.title as carton_title  -- Selecting carton title from ine_packers_cartons
                FROM \`ine_serial_number\` as isn 
                LEFT JOIN \`ine_packers_boxes\` as ipb ON ipb.serial_number_id = isn.id
                LEFT JOIN \`ine_carton_elements\` as ice ON ice.box_id = ipb.id 
                LEFT JOIN \`ine_packers_cartons\` as ipca ON ipca.id = ice.carton_id
                LEFT JOIN \`ine_offline_sales\` as ios ON ios.carton_id = ice.carton_id
                LEFT JOIN \`ine_packers_cartons\` as ipc ON ipc.id = ice.carton_id  -- Joining ine_packers_cartons again
                WHERE isn.\`replicator_id\` = ? AND isn.id = ipb.serial_number_id AND ipb.status = 1
            `, [replicatorId]);
                const totalRecords = query2.length;
                const records = query2.map(listdata2 => ({
                    serial_rowid: listdata2.id,
                    batch_number: listdata2.batch_number,
                    serial_number: listdata2.serial_number,
                    ipbid: listdata2.ipbid,
                    box_name: listdata2.box_name,
                    icecarton_id: listdata2.icecarton_id,
                    icebox_id: listdata2.icebox_id,
                    iceid: listdata2.iceid,
                    ipcatitle: listdata2.ipcatitle,
                    iosid: listdata2.iosid,
                    carton_title: listdata2.carton_title,  // Adding carton title to the result
                    totalRecords: totalRecords
                }));
                return sendResponse({ data: records, message: ManageResponseStatus('fetched'), status: true }, 200);
            } else {
                const results = await query(`
                    SELECT m.*, d.model_number, d.sub_model_number, d.in_pair
                    FROM ${tableName2} m
                    JOIN ${tableName} d ON m.designer_id = d.id
                    WHERE m.record_status=2 AND m.status = 1 AND m.id = ?
                `, [id]);
                if (results.length > 0) {
                    const enhancedResults = await Promise.all(results.map(async (record) => {
                        const assetRecords = await query(`
                            SELECT *
                            FROM ${tableName3}
                            WHERE m_id = ? AND created_at = (
                                SELECT MAX(created_at) 
                                FROM ${tableName3} 
                                WHERE m_id = ? AND meta_key IN ('video', 'image')
                            )
                        `, [record.id, record.id]);
                        record.images = [];
                        record.videos = [];
                        assetRecords.forEach(asset => {
                            if (asset.meta_key === 'image') {
                                record.images.push(asset.meta_value);
                            } else if (asset.meta_key === 'video') {
                                record.videos.push(asset.meta_value);
                            }
                        });
                        return record;
                    }));
                    return sendResponse({ data: enhancedResults, message: ManageResponseStatus('fetched'), status: true, count: enhancedResults.length }, 200);
                }
            }
        }
        else {
            const results = await query(`
                SELECT m.*, d.model_number, d.sub_model_number, d.in_pair
                FROM ${tableName2} m
                JOIN ${tableName} d ON m.designer_id = d.id
                WHERE m.record_status=2 AND m.status = 1
            `);
            if (results.length > 0) {
                const enhancedResults = await Promise.all(results.map(async (record) => {
                    const assetRecords = await query(`
                        SELECT *
                        FROM ${tableName3}
                        WHERE m_id = ? AND created_at = (
                            SELECT MAX(created_at) 
                            FROM ${tableName3} 
                            WHERE m_id = ? AND meta_key IN ('video', 'image')
                        )
                    `, [record.id, record.id]);
                    const [replicatorResult] = await query("SELECT * FROM `ine_replicator` WHERE `designer_id` = ? ORDER BY ID", [record.model_number]);
                    if (!replicatorResult) {
                        return sendResponse({ error: 'Model number not found', status: false }, 404);
                    }
                    const { quantity, id: replicatorId } = replicatorResult;
                    const query2 = await query(`
                    SELECT isn.*, isn.batch_sequence_no as batch_number, isn.serial_number, 
                           ipb.id as ipbid, ipb.title as box_name, 
                           ice.carton_id as icecarton_id, ice.box_id as icebox_id, ice.id as iceid, 
                           ipca.title as ipcatitle, ios.id as iosid,
                           ipc.title as carton_title  -- Selecting carton title from ine_packers_cartons
                    FROM \`ine_serial_number\` as isn 
                    LEFT JOIN \`ine_packers_boxes\` as ipb ON ipb.serial_number_id = isn.id
                    LEFT JOIN \`ine_carton_elements\` as ice ON ice.box_id = ipb.id 
                    LEFT JOIN \`ine_packers_cartons\` as ipca ON ipca.id = ice.carton_id
                    LEFT JOIN \`ine_offline_sales\` as ios ON ios.carton_id = ice.carton_id
                    LEFT JOIN \`ine_packers_cartons\` as ipc ON ipc.id = ice.carton_id  -- Joining ine_packers_cartons again
                    WHERE isn.\`replicator_id\` = ? AND isn.id = ipb.serial_number_id AND ipb.status = 1
                `, [replicatorId]);
                    record.quantity = query2.length;
                    record.images = [];
                    record.videos = [];

                    assetRecords.forEach(asset => {
                        if (asset.meta_key === 'image') {
                            record.images.push(asset.meta_value);
                        } else if (asset.meta_key === 'video') {
                            record.videos.push(asset.meta_value);
                        }
                    });
                    return record;
                }));
                return sendResponse({ data: enhancedResults, message: ManageResponseStatus('fetched'), status: true, count: enhancedResults.length }, 200);
            }
        }

        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

