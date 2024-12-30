import { query } from "../../../../utils/database";
import { ine_cart_tablename, ine_orders_tablename, ine_users_checkout_tablename } from "../../../../utils/apiEndPoints";
import { ManageResponseStatus, getRecordById, sendResponse } from "../../../../utils/commonFunction";

// Table Names
const ordersTableName = ine_orders_tablename;
const orderProductsTableName = 'ine_order_products';

const cartTableName = ine_cart_tablename; // Corrected the variable name
const tableName2 = ine_users_checkout_tablename; // Corrected the variable name
// Function to generate a unique order number starting with "ORD"
const generateUniqueOrderNumber = async () => {
    let orderNumber;
    let isUnique = false;

    while (!isUnique) {
        orderNumber = 'ORD' + Math.floor(Math.random() * 1000000);
        const result = await query(`SELECT COUNT(*) as count FROM ${ordersTableName} WHERE order_id = ?`, [orderNumber]);
        if (result[0].count === 0) {
            isUnique = true;
        }
    }
    return orderNumber;
};

// Function to generate a unique invoice number
const generateUniqueInvoiceNumber = async () => {
    let invoiceNumber;
    let isUnique = false;

    while (!isUnique) {
        invoiceNumber = 'INV' + Math.floor(Math.random() * 1000000);
        const result = await query(`SELECT COUNT(*) as count FROM ${ordersTableName} WHERE invoice_id = ?`, [invoiceNumber]);
        if (result[0].count === 0) {
            isUnique = true;
        }
    }
    return invoiceNumber;
};

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        const requiredFields = ['cartproducts', 'address', 'finalamount', 'channel_mode'];
        for (const field of requiredFields) {
            if (!requestData[field]) {
                return sendResponse({ error: `${field} field is required`, status: false }, 400);
            }
        }

        // Generate unique order number and invoice number
        const orderNumber = await generateUniqueOrderNumber();
        const invoiceNumber = await generateUniqueInvoiceNumber();

        // Insertion into orders table
        const insertOrderResult = await query(`INSERT INTO ${ordersTableName} (total_amount,affiliate_id,base_amount,assisted_by,tax_amount,payment_status,payment_by_customer,order_status, channel_mode,channel_name, notes, order_id, invoice_id, invoice_date, total_items, customer_id, address_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?,?)`, [
            requestData?.finalamount,
            requestData?.affiliate_id,
            requestData?.baseAmount || 0,
            requestData?.assisted_by || null,
            requestData?.taxAmount,
            requestData?.payment_status,
            requestData?.payment_by_customer || requestData?.finalamount,
            requestData?.order_status || 0,
            requestData?.channel_mode,
            requestData?.channel_name || '',
            requestData?.notes || '',
            orderNumber,
            invoiceNumber,
            requestData?.cartproducts?.length,
            requestData?.user_id || requestData?.userDetails.id,
            requestData?.addressId,
        ]);
        const insertedOrderId = insertOrderResult.insertId;
        // Insertion into order products table
        for (const product of requestData.cartproducts) {
            await query(`INSERT INTO ${orderProductsTableName} (order_id, invoice_id, product_id, product_model_number,serial_number, quantity) VALUES (?, ?, ?, ?,?, ?)`, [
                insertedOrderId,
                invoiceNumber, // Associate the same invoice number
                product.id,
                product.model_number || product.irdesignerid,
                product.serial_number || null,
                product.quantity
            ]);
        }

        // Remove products from the cart table
        for (const product of requestData.cartproducts) {
            await query(`DELETE FROM ${cartTableName} WHERE user_id = ? AND product_id = ?`, [
                requestData?.user_id,
                product.id
            ]);
        }
        await query(`DELETE FROM ${tableName2} WHERE user_id = ?`, [
            requestData?.user_id,
        ]);
        return sendResponse({ message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        console.error("ERROR", error);
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
