
import { query } from "../../../utils/database";
import { ine_giftcard_tablename, ine_giftcard_ModuleID, ine_giftcard_generate_tablename, ine_roles_tablename, ine_inventory_tablename, ine_serial_number, ine_warehouse_racks_tablename, ine_packers_carton_element_tablename, ine_packers_boxes_tablename } from "src/utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_inventory_tablename;
const tableName2 = ine_roles_tablename;
const tableName3 = ine_giftcard_generate_tablename;
const tableName4 = ine_serial_number;
const tableName5 = ine_warehouse_racks_tablename;
const tableName6 = ine_packers_carton_element_tablename;
const tableName7 = ine_packers_boxes_tablename;

// Helper function to fetch serial numbers for packer boxes
const fetchSerialNumbers = async (packerBox) => {
    if (!packerBox.serial_number_id) return packerBox;
    const serialNumbers = await query(`SELECT * FROM ${tableName4} WHERE id = ? AND is_sold = 0`, [packerBox.serial_number_id]);
    const serialNumber = serialNumbers.length > 0 ? serialNumbers[0] : null;
    return { ...packerBox, ...serialNumber };
};

// Helper function to fetch carton elements and group boxes by carton_id
const fetchCartonElements = async (warehouseDetails) => {
    if (!warehouseDetails) return [];

    // Use a map to group carton elements by carton_id
    const cartonMap = new Map();

    await Promise.all(warehouseDetails.map(async (detail) => {
        if (!detail.carton_id) return;
        const cartonElements = await query(`SELECT * FROM ${tableName6} WHERE carton_id = ?`, [detail.carton_id]);

        await Promise.all(cartonElements.map(async (element) => {
            if (!element.box_id) return;
            const packerBoxResults = await query(`SELECT * FROM ${tableName7} WHERE id = ?`, [element.box_id]);
            const packerBox = packerBoxResults.length > 0 ? packerBoxResults[0] : null;
            const detailedPackerBox = await fetchSerialNumbers(packerBox);

            // Ensure each carton_id is only included once with all boxElements and their packerBoxes
            if (!cartonMap.has(detail.carton_id)) {
                cartonMap.set(detail.carton_id, {
                    id: detail.id,
                    carton_id: detail.carton_id,
                    created_at: detail.created_at,
                    created_by: detail.created_by,
                    boxElements: []
                });
            }
            cartonMap.get(detail.carton_id).boxElements.push({
                ...element,
                ...detailedPackerBox
            });
        }));
    }));

    // Convert map to array
    return Array.from(cartonMap.values());
};

// Helper function to get detailed warehouse details
const getDetailedWarehouseDetails = async (results) => {
    if (!results) return [];
    return Promise.all(results.map(async (result) => {
        if (!result.id) return result;
        const warehouseDetails = await query(`SELECT * FROM ${tableName5} WHERE assigned_channel_id = ?`, [result.id]);
        const detailedWarehouseDetails = await fetchCartonElements(warehouseDetails);
        return {
            ...result,
            warehouseDetails: detailedWarehouseDetails,
            quantity: detailedWarehouseDetails.flatMap(detail => detail.boxElements || [])
                .filter(element => element.serial_number_id) // Ensure only valid boxes are counted
                .length
        };
    }));
};

// GET METHOD
export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));

        if (id) {
            // Fetch data for the specific ID including prefix
            const results = await query(`SELECT * FROM ${tableName2} WHERE show_stock_status = 'Y' AND id = ?`, [id]);

            if (results.length > 0) {
                const detailedResults = await getDetailedWarehouseDetails(results);
                return sendResponse({
                    data: detailedResults[0],
                    message: ManageResponseStatus('fetched'),
                    status: true
                }, 200);
            } else {
                const prefixResult = await query(`SELECT prefix FROM ${tableName2} WHERE id = ?`, [id]);
                return sendResponse({
                    prefix: prefixResult.length > 0 ? prefixResult[0].prefix : null,
                    message: ManageResponseStatus('notFound'),
                    status: false
                }, 404);
            }
        } else {
            // Fetch data for all channels and return only unsold product counts
            const results = await query(`SELECT * FROM ${tableName2} WHERE show_stock_status = 'Y'`);
            const detailedResults = await getDetailedWarehouseDetails(results);

            return sendResponse({
                data: detailedResults,
                message: ManageResponseStatus('fetched'),
                status: true,
                count: detailedResults.length
            }, 200);
        }
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};


// // Helper function to fetch serial numbers for packer boxes
// const fetchSerialNumbers = async (packerBoxes) => {
//     if (!packerBoxes) return [];
//     return Promise.all(packerBoxes.map(async (box) => {
//         if (!box.serial_number_id) return box;
//         const serialNumbers = await query(`SELECT * FROM ${tableName4} WHERE id = ? AND is_sold = 0`, [box.serial_number_id]);
//         const serialNumber = serialNumbers.length > 0 ? serialNumbers[0] : null;
//         return { ...box, ...serialNumber };
//     }));
// };

// // Helper function to fetch carton elements for warehouse details
// const fetchCartonElements = async (warehouseDetails) => {
//     if (!warehouseDetails) return [];
//     return Promise.all(warehouseDetails.map(async (detail) => {
//         if (!detail.carton_id) return { ...detail, cartonElements: [] };
//         const cartonElements = await query(`SELECT * FROM ${tableName6} WHERE carton_id = ?`, [detail.carton_id]);
//         const detailedCartonElements = await Promise.all(cartonElements.map(async (element) => {
//             if (!element.box_id) return { ...element, packerBoxes: [] };
//             const packerBoxes = await query(`SELECT * FROM ${tableName7} WHERE id = ?`, [element.box_id]);
//             const detailedPackerBoxes = await fetchSerialNumbers(packerBoxes);
//             return { ...element, packerBoxes: detailedPackerBoxes };
//         }));
//         return { ...detail, cartonElements: detailedCartonElements };
//     }));
// };

// // Helper function to get detailed warehouse details
// const getDetailedWarehouseDetails = async (results) => {
//     if (!results) return [];
//     return Promise.all(results.map(async (result) => {
//         if (!result.id) return result;
//         const warehouseDetails = await query(`SELECT * FROM ${tableName5} WHERE assigned_channel_id = ?`, [result.id]);
//         const detailedWarehouseDetails = await fetchCartonElements(warehouseDetails);
//         return {
//             ...result,
//             warehouseDetails: detailedWarehouseDetails,
//             quantity: detailedWarehouseDetails.flatMap(detail => detail.cartonElements || [])
//                 .flatMap(element => element.packerBoxes || [])
//                 .filter(box => box.serial_number_id) // Ensure only valid boxes are counted
//                 .length
//         };
//     }));
// };

// // GET METHOD
// export const GET = async (req) => {
//     try {
//         const id = getQueryParamId(new URL(req.url));

//         if (id) {
//             // Fetch data for the specific ID including prefix
//             const results = await query(`SELECT * FROM ${tableName2} WHERE show_stock_status = 'Y' AND id = ?`, [id]);

//             if (results.length > 0) {
//                 const detailedResults = await getDetailedWarehouseDetails(results);
//                 return sendResponse({
//                     data: detailedResults[0],
//                     message: ManageResponseStatus('fetched'),
//                     status: true
//                 }, 200);
//             } else {
//                 const prefixResult = await query(`SELECT prefix FROM ${tableName2} WHERE id = ?`, [id]);
//                 return sendResponse({
//                     prefix: prefixResult.length > 0 ? prefixResult[0].prefix : null,
//                     message: ManageResponseStatus('notFound'),
//                     status: false
//                 }, 404);
//             }
//         } else {
//             // Fetch data for all channels and return only unsold product counts
//             const results = await query(`SELECT * FROM ${tableName2} WHERE show_stock_status = 'Y'`);
//             const detailedResults = await getDetailedWarehouseDetails(results);

//             return sendResponse({
//                 data: detailedResults,
//                 message: ManageResponseStatus('fetched'),
//                 status: true,
//                 count: detailedResults.length
//             }, 200);
//         }
//     } catch (error) {
//         return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
//     }
// };
// PUT METHOD


export const PUT = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));

        if (!id) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }

        // Check if the ID exists in the database and retrieve the existing record
        const [existingRecord] = await getRecordById(id, tableName, 'id');

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const { name, company_name, email, description, denominations, type, choose_template, csvdata, amount } = await req.json();

        await query(`UPDATE ${tableName} SET name = ?, company_name = ?, email = ?, description = ?, updated_at = NOW() WHERE id = ?`, [name, company_name, email, description, id]);

        // Add New Records
        let totalAmount = 0;
        let cardCount = 0;

        let expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        expiryDate.setHours(23, 59, 59, 999);

        if (type === 1 && denominations) {
            await query(`UPDATE ${tableName2} SET status = 0, deleted_at = NOW() WHERE giftcard_id IN (?)`, [id]);
            await query(`UPDATE ${tableName3} SET status = 0, deleted_at = NOW() WHERE giftcard_id IN (?)`, [id]);
            for (const denomination of denominations) {
                const insertResultNew = await query(`INSERT INTO ${tableName2} (giftcard_id, denomination, multiplication) VALUES (?, ?, ?)`, [
                    id,
                    denomination.value,
                    denomination.multiplication,
                ]);
                const insertedRecordIdNew = insertResultNew.insertId;

                for (let i = 0; i < denomination.multiplication; i++) {
                    totalAmount += denomination.value;
                    cardCount++;
                    const giftCardNumber = await generateUniqueGiftCardNumber();
                    await query(`INSERT INTO ${tableName3} (giftcard_id, giftcard_calc_id, gift_card_number, amount, expiry_date, name, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                        id,
                        insertedRecordIdNew,
                        giftCardNumber,
                        denomination.value,
                        expiryDate,
                        '',
                        '',
                        ''
                    ]);
                }

            }
        } else if (type === 2 && csvdata) {
            await query(`UPDATE ${tableName3} SET status = 0, deleted_at = NOW() WHERE giftcard_id IN (?)`, [id]);
            for (const mydata of csvdata) {

                const giftCardNumber = await generateUniqueGiftCardNumber();
                totalAmount += mydata.amount;
                cardCount++;

                await query(`INSERT INTO ${tableName3} (giftcard_id, giftcard_calc_id, gift_card_number, amount, expiry_date, name, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                    id,
                    0,
                    giftCardNumber,
                    mydata.amount,
                    expiryDate,
                    mydata.name,
                    mydata.email,
                    mydata.phone
                ]);
            }
        } else if (type === 3) {
            await query(`UPDATE ${tableName3} SET status = 0, deleted_at = NOW() WHERE giftcard_id IN (?)`, [id]);
            const giftCardNumber = await generateUniqueGiftCardNumber();
            totalAmount = amount;
            cardCount = 1;
            await query(`INSERT INTO ${tableName3} (giftcard_id, giftcard_calc_id, gift_card_number, amount, expiry_date) VALUES (?, ?, ?, ?, ?)`, [
                id,
                0,
                giftCardNumber,
                amount,
                expiryDate
            ]);
        }

        let chooseTemplateValue = type === 2 ? choose_template : 0;
        await query(`UPDATE ${tableName} SET total_amount = ?, total_giftcard = ?, choose_template = ? WHERE id = ?`, [totalAmount, cardCount, chooseTemplateValue, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_giftcard_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// DELETE METHOD (Single or Multiple)
export const DELETE = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        const deletedIds = id ? [id] : getQueryParamIds(new URL(req.url));

        if (!deletedIds || deletedIds.length === 0) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }

        await Promise.all(deletedIds.map(async (deletedId) => {
            const [currentRecord] = await getRecordById(deletedId, tableName, 'id');
            activityLog(ine_giftcard_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
        }));

        const results = await query(`UPDATE ${tableName} SET status = 2, deleted_at = NOW() WHERE id IN (?)`, [deletedIds]);

        if (results.affectedRows > 0) {
            return sendResponse({ message: ManageResponseStatus('deleted'), status: true }, 200);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};