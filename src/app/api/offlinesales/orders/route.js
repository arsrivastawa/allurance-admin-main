
/// src/app/api/designer/route.js
import { query } from "../../../../utils/database";
import { ine_designer_ModuleID, ine_offline_sales_ModuleID, ine_marekting_tablename, ine_orders_tablename, ine_users_tablename, user_addresses_tablename, ine_serial_number, ine_replicator_tablename, ine_designer_tablename, ine_order_products_tablename } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../../utils/commonFunction";

// Table Names
const tableName = ine_orders_tablename;
const tablname3 = ine_users_tablename
const tablename4 = user_addresses_tablename
const tablename5 = ine_serial_number
const tablename6 = ine_replicator_tablename
const tablename7 = ine_marekting_tablename
const tablename8 = ine_designer_tablename
const tablename9 = ine_order_products_tablename

export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        if (id) {
            const results = await query(`
                SELECT t1.*, u.phone, u.first_name, u.last_name, u.email, a.id as address_id, ad.first_name as assisted_by_first_name, ad.last_name as assisted_by_last_name,  
                a.address_1 as address_line_1, a.address_2 as address_line_2, a.landmark, a.pincode, a.district, a.state, a.country
                FROM ${tableName} t1
                LEFT JOIN ${tablname3} u ON t1.customer_id = u.id
                LEFT JOIN ${tablname3} ad ON t1.assisted_by = ad.prefix_id
                LEFT JOIN ${tablename4} a ON t1.address_id = a.id
                WHERE t1.id = ?`, [id]);

            if (results.length > 0) {
                const result = results[0];
                const serialNumberResults = await query(`
                    SELECT serial_number, is_returned
                    FROM ${tablename9}
                    WHERE order_id = ?`, [result.id]);

                if (serialNumberResults.length > 0) {
                    const serialNumbers = serialNumberResults.map(row => ({
                        serial_number: row.serial_number.trim(),
                        is_returned: row.is_returned
                    }));

                    const lineSerialNumbers = await Promise.all(serialNumbers.map(async ({ serial_number, is_returned }) => {
                        const products = await query(
                            `SELECT s.batch_sequence_no as batch_number, s.serial_number, s.l_serial_number, s.r_serial_number, d.model_number, m2.*, ? as is_returned
                            FROM ${tablename5} s
                            LEFT JOIN ${tablename6} r ON s.replicator_id = r.id
                            LEFT JOIN ${tablename8} d ON r.designer_id = d.model_number
                            LEFT JOIN ${tablename7} m2 ON d.id = m2.designer_id
                            WHERE s.serial_number = ?`,
                            [is_returned, serial_number]
                        );
                        return products;
                    }));

                    const products = lineSerialNumbers.flat(); // Flatten the array of arrays

                    // Aggregate products based on model number and calculate total quantity
                    const aggregatedProducts = {};
                    products.forEach(product => {
                        if (aggregatedProducts[product.model_number]) {
                            aggregatedProducts[product.model_number].quantity++;
                        } else {
                            aggregatedProducts[product.model_number] = { ...product, quantity: 1 };
                        }
                    });

                    result.Products = Object.values(aggregatedProducts);

                    return sendResponse({
                        data: result,
                        message: ManageResponseStatus('fetched'),
                        status: true
                    }, 200);
                } else {
                    return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
                }
            }

            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const results = await query(`
            SELECT t1.*, u.phone, u.first_name, u.last_name, u.email, a.id as address_id,
            a.address_1 as address_line_1, a.address_2 as address_line_2, a.landmark,
            a.pincode, a.district, a.state, a.country
            FROM ${tableName} t1
            LEFT JOIN ${tablname3} u ON t1.customer_id = u.id
            LEFT JOIN ${tablename4} a ON t1.address_id = a.id
        `);

        if (results.length > 0) {
            return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
        }

        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

export const DELETE = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        const deletedIds = id ? [id] : getQueryParamIds(new URL(req.url));
        if (!deletedIds || deletedIds.length === 0) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }
        await Promise.all(deletedIds.map(async (deletedId) => {
            const [currentRecord] = await getRecordById(deletedId, tableName, 'id');
            activityLog(ine_designer_ModuleID, currentRecord, null, 3, 0); // Maintain Activity Log
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