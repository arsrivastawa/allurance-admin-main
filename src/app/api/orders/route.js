
/// src/app/api/designer/route.js
import { query } from "../../../utils/database";
import { ine_offline_sales_ModuleID, ine_marekting_tablename, ine_orders_tablename, ine_users_tablename, user_addresses_tablename, ine_serial_number, ine_replicator_tablename, ine_designer_tablename, ine_order_products_tablename, ine_products_tablename, ine_assets_tablename } from "../../../utils/apiEndPoints";
import { sendResponse, getQueryParamId, ManageResponseStatus } from "../../../utils/commonFunction";

// Table Names
const tableName = ine_orders_tablename;
const tableName2 = ine_marekting_tablename;
const module_id = ine_offline_sales_ModuleID;
const tablname3 = ine_users_tablename
const tablename4 = user_addresses_tablename
const tablename5 = ine_serial_number
const tablename6 = ine_replicator_tablename
const tablename7 = ine_products_tablename
// const tablename7 = ine_marekting_tablename
const tablename8 = ine_designer_tablename
const tablename9 = ine_order_products_tablename
const tablename10 = ine_assets_tablename

export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const id = getQueryParamId(new URL(req.url));
        const userId = url.searchParams.get('customer_id');
        if (id) {
            // Fetch main record details
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
                    WHERE order_id = ? AND serial_number IS NOT NULL`, [result.id]);

                if (serialNumberResults.length > 0) {
                    const serialNumbers = serialNumberResults.map(row => row.serial_number?.trim());

                    // Fetch products details with images and videos
                    const lineSerialNumbers = await Promise.all(serialNumbers.map(async (serialNumber) => {
                        // Query to fetch product details and marketing ID
                        const productResults = await query(
                            `SELECT s.batch_sequence_no as batch_number, s.serial_number, s.l_serial_number, s.r_serial_number, d.model_number, m2.*, m2.marketing_id
                            FROM ${tablename5} s
                            LEFT JOIN ${tablename6} r ON s.replicator_id = r.id
                            LEFT JOIN ${tablename8} d ON r.designer_id = d.model_number
                            LEFT JOIN ${tablename7} m2 ON d.id = m2.designer_id
                            WHERE s.serial_number = ?`,
                            [serialNumber]
                        );

                        // Fetch images and videos for each product
                        const productsWithMedia = await Promise.all(productResults.map(async (product) => {
                            const marketingId = product.marketing_id;

                            // Fetch all images
                            const imageResults = await query(`
                                SELECT meta_value
                                FROM ${tablename10}
                                WHERE m_id = ? AND meta_key = 'image'
                                ORDER BY created_at DESC
                            `, [marketingId]);

                            const images = imageResults.map(row => row.meta_value);

                            // Fetch all videos
                            const videoResults = await query(`
                                SELECT meta_value
                                FROM ${tablename10}
                                WHERE m_id = ? AND meta_key = 'video'
                            `, [marketingId]);

                            const videos = videoResults.map(row => row.meta_value);

                            return {
                                ...product,
                                images,
                                videos
                            };
                        }));

                        return productsWithMedia;
                    }));

                    const products = lineSerialNumbers.flat();
                    const aggregatedProducts = {};

                    // Aggregate products by model number
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
                }
                else {
                    const ProductResults = await query(`
                        SELECT serial_number, is_returned ,product_model_number as model_number,product_id
                        FROM ${tablename9}
                        WHERE order_id = ?`, [result.id]);
                    // Fetch products details with images and videos
                    const lineProducts = await Promise.all(ProductResults.map(async (product) => {

                        // Query to fetch product details and marketing ID
                        const productResults = await query(
                            `SELECT * FROM ${tablename7}`,
                            [product.product_id]
                        );

                        // Fetch images and videos for each product
                        const productsWithMedia = await Promise.all(productResults.map(async (product) => {
                            const marketingId = product.marketing_id;

                            // Fetch all images
                            const imageResults = await query(`
                                    SELECT meta_value
                                    FROM ${tablename10}
                                    WHERE m_id = ? AND meta_key = 'image'
                                    ORDER BY created_at DESC
                                `, [marketingId]);

                            const images = imageResults.map(row => row.meta_value);

                            // Fetch all videos
                            const videoResults = await query(`
                                    SELECT meta_value
                                    FROM ${tablename10}
                                    WHERE m_id = ? AND meta_key = 'video'
                                `, [marketingId]);

                            const videos = videoResults.map(row => row.meta_value);

                            return {
                                ...product,
                                images,
                                videos
                            };
                        }));

                        return productsWithMedia;
                    }));

                    const products = lineProducts.flat();
                    const aggregatedProducts = {};

                    // Aggregate products by model number
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
                }
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        else if (userId) {
            // Fetch records related to the user ID
            const results = await query(`SELECT * FROM ${tableName} WHERE customer_id = ?`, [userId]);
            return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true }, 200);
        } else {
            // Fetch all records if no specific ID or user ID is provided
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
        }
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};


export const POST = async (req) => {
    const id = getQueryParamId(new URL(req.url));
    const requestData = await req.json();
    const { order_state } = requestData;

    try {
        await query(`UPDATE ${tableName} SET order_status = ? WHERE id = ?`, [order_state, id]);
        return sendResponse({ message: ManageResponseStatus('updated'), status: true }, 200);
    }
    catch (error) {
        console.warn("ERROR ", error);
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
}

