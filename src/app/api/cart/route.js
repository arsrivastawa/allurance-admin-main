
// src/app/api/cart/route.js
import { query } from "../../../utils/database";
import { ine_cart_ModuleID, ine_cart_tablename, ine_category_tablename, ine_designer_tablename, ine_products_tablename } from "../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus, generateSeriesId } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_cart_tablename;
const tableName2 = ine_products_tablename;// Replace with your actual table name for products
const tableName3 = ine_designer_tablename;
const tableName4 = ine_category_tablename

// // POST METHOD
// export const POST = async (req) => {
//     try {
//         const requestData = await req.json();

//         // Validate request data
//         if (!requestData.product_id || !requestData.quantity) {
//             return sendResponse({ error: 'Product ID, and Quantity fields are required', status: false }, 400);
//         }

//         let insertedRecordId;
//         const affiliateId = requestData.affiliate_id ? requestData.affiliate_id : '';
//         if (requestData.user_id) {
//             const existingRecord = await query(`SELECT * FROM ${tableName} WHERE user_id = ? AND product_id = ?`, [
//                 requestData.user_id,
//                 requestData.product_id,
//             ]);
//             if (existingRecord.length > 0) {
//                 // If record exists, update quantity
//                 await query(`UPDATE ${tableName} SET quantity = ? WHERE user_id = ? AND product_id = ? AND mock_id=? AND affiliate_id = ?`, [
//                     existingRecord[0].quantity + requestData.quantity,
//                     requestData.user_id || null,
//                     requestData.product_id,
//                     requestData.mock_id || null,
//                     affiliateId
//                 ]);
//                 insertedRecordId = existingRecord[0].id;
//             } else {
//                 // If record doesn't exist, insert new record
//                 const insertResult = await query(`INSERT INTO ${tableName} (user_id, product_id,mock_id, quantity,affiliate_id) VALUES (?, ?, ?, ?, ?)`, [
//                     requestData.user_id || null,
//                     requestData.product_id,
//                     requestData.mock_id || null,
//                     requestData.quantity,
//                     affiliateId
//                 ]);
//                 insertedRecordId = insertResult.insertId;
//             }
//         }
//         if (requestData.mock_id) {
//             const existingRecord = await query(`SELECT * FROM ${tableName} WHERE mock_id = ? AND product_id = ?`, [
//                 requestData.mock_id,
//                 requestData.product_id,
//             ]);
//             if (existingRecord.length > 0) {
//                 // If record exists, update quantity
//                 await query(`UPDATE ${tableName} SET quantity = ? WHERE mock_id = ? AND product_id = ? AND mock_id=? AND affiliate_id = ?`, [
//                     existingRecord[0].quantity + requestData.quantity,
//                     requestData.mock_id || null,
//                     requestData.product_id,
//                     requestData.mock_id || null,
//                     affiliateId
//                 ]);
//                 insertedRecordId = existingRecord[0].id;
//             } else {
//                 // If record doesn't exist, insert new record
//                 const insertResult = await query(`INSERT INTO ${tableName} (mock_id, product_id,mock_id, quantity, affiliate_id) VALUES (?, ?, ?, ?, ?)`, [
//                     requestData.mock_id || null,
//                     requestData.product_id,
//                     requestData.mock_id || null,
//                     requestData.quantity,
//                     affiliateId
//                 ]);
//                 insertedRecordId = insertResult.insertId;
//             }
//         }
//         // Retrieve the inserted/updated record
//         const insertedRecord = await query(`SELECT * FROM ${tableName} WHERE id = ?`, [insertedRecordId]);

//         // Example activity log function; adjust as per your application
//         // await activityLog(ine_cart_ModuleID, null, insertedRecord, 1, 0); // Uncomment and adjust this according to your activity logging function

//         return sendResponse({ data: insertedRecord[0], message: 'Record created or updated successfully', status: true }, 201);

//     } catch (error) {
//         return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
//     }
// };

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.product_id || !requestData.quantity) {
            return sendResponse({ error: 'Product ID and Quantity fields are required', status: false }, 400);
        }

        let insertedRecordId;
        const affiliateId = requestData.affiliate_id ? requestData.affiliate_id : '';

        // Determine whether to use user_id or mock_id
        let existingRecord;
        if (requestData.user_id) {
            existingRecord = await query(`SELECT * FROM ${tableName} WHERE user_id = ? AND product_id = ?`, [
                requestData.user_id,
                requestData.product_id,
            ]);
        } else if (requestData.mock_id) {
            existingRecord = await query(`SELECT * FROM ${tableName} WHERE mock_id = ? AND product_id = ?`, [
                requestData.mock_id,
                requestData.product_id,
            ]);
        }

        if (existingRecord && existingRecord.length > 0) {
            // If record exists, update quantity
            const newQuantity = existingRecord[0].quantity + requestData.quantity;
            await query(`UPDATE ${tableName} SET quantity = ? WHERE id = ?`, [
                newQuantity,
                existingRecord[0].id,
            ]);
            insertedRecordId = existingRecord[0].id;
        } else {
            // If record doesn't exist, insert new record
            const insertResult = await query(`INSERT INTO ${tableName} (user_id, mock_id, product_id, quantity, affiliate_id) VALUES (?, ?, ?, ?, ?)`, [
                requestData.user_id || null,
                requestData.mock_id || null,
                requestData.product_id,
                requestData.quantity,
                affiliateId
            ]);
            insertedRecordId = insertResult.insertId;
        }

        // Retrieve the inserted/updated record
        const insertedRecord = await query(`SELECT * FROM ${tableName} WHERE id = ?`, [insertedRecordId]);

        // Example activity log function; adjust as per your application
        // await activityLog(ine_cart_ModuleID, null, insertedRecord, 1, 0); // Uncomment and adjust this according to your activity logging function

        return sendResponse({ data: insertedRecord[0], message: 'Record created or updated successfully', status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

export const PUT = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.product_id || !requestData.quantity) {
            return sendResponse({ error: 'Product ID and Quantity fields are required', status: false }, 400);
        }

        let insertedRecordId;
        const affiliateId = requestData.affiliate_id ? requestData.affiliate_id : '';

        // Determine whether to use user_id or mock_id
        let existingRecord;
        if (requestData.user_id) {
            existingRecord = await query(`SELECT * FROM ${tableName} WHERE user_id = ? AND product_id = ?`, [
                requestData.user_id,
                requestData.product_id,
            ]);
        } else if (requestData.mock_id) {
            existingRecord = await query(`SELECT * FROM ${tableName} WHERE mock_id = ? AND product_id = ?`, [
                requestData.mock_id,
                requestData.product_id,
            ]);
        }

        if (existingRecord && existingRecord.length > 0) {
            // If record exists, update quantity
            const newQuantity = requestData.quantity;
            await query(`UPDATE ${tableName} SET quantity = ? WHERE id = ?`, [
                newQuantity,
                existingRecord[0].id,
            ]);
            insertedRecordId = existingRecord[0].id;
        } else {
            // If record doesn't exist, insert new record
            const insertResult = await query(`INSERT INTO ${tableName} (user_id, mock_id, product_id, quantity, affiliate_id) VALUES (?, ?, ?, ?, ?)`, [
                requestData.user_id || null,
                requestData.mock_id || null,
                requestData.product_id,
                requestData.quantity,
                affiliateId
            ]);
            insertedRecordId = insertResult.insertId;
        }

        // Retrieve the inserted/updated record
        const insertedRecord = await query(`SELECT * FROM ${tableName} WHERE id = ?`, [insertedRecordId]);

        // Example activity log function; adjust as per your application
        // await activityLog(ine_cart_ModuleID, null, insertedRecord, 1, 0); // Uncomment and adjust this according to your activity logging function

        return sendResponse({ data: insertedRecord[0], message: 'Record created or updated successfully', status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};


export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('user_id');
        const mockId = url.searchParams.get('mock_id');
        const id = getQueryParamId(url);
        let results;
        if (id) {
            results = await query(`SELECT * FROM ${tableName} WHERE id = ?  ORDER BY ID desc`, [id]);
        } else if (userId) {
            results = await query(`SELECT * FROM ${tableName} WHERE user_id = ? ORDER BY ID desc`, [userId]);
        } else if (mockId) {
            results = await query(`SELECT * FROM ${tableName} WHERE mock_id = ? ORDER BY ID desc`, [mockId]);
        } else {
            results = await query(`SELECT * FROM ${tableName} ORDER BY ID desc`);
        }
        if (results.length > 0) {
            const products = await Promise.all(results.map(async (record) => {
                const productDetails = await query(`SELECT p.*,d.model_number as model_number,
                                                  c.id as category_id ,c.name as category,
                                                  ia.meta_key as asset_type,
                                                  ia.meta_value as asset_url,
                                                  ia.created_at as asset_created_at
                                                    FROM ${tableName2} p
                                                    LEFT JOIN ine_assets ia ON p.marketing_id = ia.m_id
                                                    LEFT JOIN ${tableName3} d ON p.designer_id = d.id
                                                    LEFT JOIN ${tableName4} c ON d.category_id = c.id 
                                                    WHERE p.id = ?`, [record.product_id]);
                if (productDetails.length > 0) {
                    const productData = {
                        id: productDetails[0].id,
                        marketing_id: productDetails[0].marketing_id,
                        model_number: productDetails[0].model_number,
                        category: productDetails[0].category,
                        designer_id: productDetails[0].designer_id,
                        product_name: productDetails[0].name,
                        name: productDetails[0].name,
                        short_description: productDetails[0].short_description,
                        long_description: productDetails[0].long_description,
                        price: productDetails[0].price,
                        weight: productDetails[0].weight,
                        discount_price: productDetails[0].discount_price,
                        stock: productDetails[0].stock,
                        coming_soon: productDetails[0].coming_soon,
                        created_by: productDetails[0].created_by,
                        created_at: productDetails[0].created_at,
                        updated_by: productDetails[0].updated_by,
                        updated_at: productDetails[0].updated_at,
                        deleted_by: productDetails[0].deleted_by,
                        deleted_at: productDetails[0].deleted_at,
                        status: productDetails[0].status,
                        product_id: productDetails[0].id,
                        quantity: record.quantity,
                        affiliate_id: record.affiliate_id,
                        images: [],
                        videos: [],
                    };

                    for (const asset of productDetails) {
                        if (asset.asset_type === 'image') {
                            productData.images.push({
                                url: asset.asset_url,
                                created_at: asset.asset_created_at,
                            });
                        } else if (asset.asset_type === 'video') {
                            productData.videos.push({
                                url: asset.asset_url, // Assuming asset_url is correct here
                                created_at: asset.asset_created_at,
                            });
                        }
                    }

                    return productData;
                }

                return null;
            }));

            const filteredProducts = products?.filter(product => product !== null);

            // Remove ine_assets fields from each product in filteredProducts
            const cleanedProducts = filteredProducts.map(product => {
                delete product.asset_type;
                delete product.asset_url;
                delete product.asset_created_at;
                return product;
            });

            return sendResponse({
                data: {
                    products: cleanedProducts,
                    message: ManageResponseStatus('fetched'),
                    status: true,
                    count: cleanedProducts.length,
                },
            }, 200);
        }

        return sendResponse({
            error: ManageResponseStatus('notFound'),
            status: false,
        }, 404);
    } catch (error) {
        return sendResponse({
            error: `Error occurred: ${error.message}`,
        }, 500);
    }
};


// DELETE METHOD (Single or Multiple)
// export const DELETE = async (req) => {
//     try {
//         const url = new URL(req.url);
//         const deletedId = getQueryParamId(url);

//         // Validate the id parameter
//         if (!deletedId) {
//             return sendResponse({ error: 'ID parameter is required', status: false }, 400);
//         }

//         // Convert the id to an integer if necessary
//         const id = parseInt(deletedId, 10);
//         if (isNaN(id)) {
//             return sendResponse({ error: 'Invalid ID parameter', status: false }, 400);
//         }

//         // Perform the delete operation
//         const results = await query(`DELETE FROM ${tableName} WHERE product_id = ?`, [id]);

//         if (results.affectedRows > 0) {
//             return sendResponse({ message: ManageResponseStatus('deleted'), status: true }, 200);
//         }

//         return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
//     } catch (error) {
//         return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
//     }
// };

export const DELETE = async (req) => {
    try {
        const url = new URL(req.url);
        const id = getQueryParamId(url);
        const deletedIds = id ? [id] : getQueryParamIds(url);
        const userId = url.searchParams.get('user_id');
        const mockId = url.searchParams.get('mock_id');

        if (userId) {
            const results = await query(`SELECT * FROM ${tableName} WHERE user_id = ?`, [userId]);
            if (results.length === 0) {
                return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
            }
            const userDeletedIds = results.map(record => record.id);
            await deleteRecords(userDeletedIds);
            return sendResponse({ message: ManageResponseStatus('deleted'), status: true }, 200);
        }

        if (mockId) {
            const results = await query(`SELECT * FROM ${tableName} WHERE mock_id = ?`, [mockId]);
            if (results.length === 0) {
                return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
            }
            const mockDeletedIds = results.map(record => record.id);
            await deleteRecords(mockDeletedIds);
            return sendResponse({ message: ManageResponseStatus('deleted'), status: true }, 200);
        }

        if (!deletedIds || deletedIds.length === 0) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }

        await deleteRecords(deletedIds);

        return sendResponse({ message: ManageResponseStatus('deleted'), status: true }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

const deleteRecords = async (ids) => {
    await query(`DELETE FROM ${tableName} WHERE id IN (?)`, [ids]);
};
