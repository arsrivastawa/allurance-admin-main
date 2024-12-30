
import { query } from "../../../utils/database";
import { ine_giftcard_tablename, ine_giftcard_ModuleID, ine_giftcard_calc_tablename, ine_giftcard_generate_tablename, ine_manage_request_tablename } from "src/utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, getQueryParamIds, ManageResponseStatus } from "../../../utils/commonFunction";

// Table Name
const tableName = ine_giftcard_tablename;
const tableName2 = ine_giftcard_calc_tablename;
const tableName3 = ine_giftcard_generate_tablename;

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        if (!requestData.type || !requestData.name || !requestData.email) {
            return sendResponse({ error: 'Type, Name and Email fields are required', status: false }, 400);
        }

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (type, name, company_name, email, description) VALUES (?, ?, ?, ?, ?)`, [
            requestData.type,
            requestData.name,
            requestData.company_name,
            requestData.email,
            requestData.description || null,
        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        await query(`INSERT INTO ${ine_manage_request_tablename} (module_id, row_id, request_status, comments, created_by) VALUES (?,?,?,?,?)`, [
            ine_giftcard_ModuleID, insertedRecordId, 1, null, 1
        ]);

        let totalAmount = 0;
        let cardCount = 0;

        let expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        expiryDate.setHours(23, 59, 59, 999);

        if (requestData.type === 1) {
            for (const denomination of requestData.denominations) {
                const insertResultNew = await query(`INSERT INTO ${tableName2} (giftcard_id, denomination, multiplication) VALUES (?, ?, ?)`, [
                    insertedRecordId,
                    denomination.value,
                    denomination.multiplication,
                ]);
                const insertedRecordIdNew = insertResultNew.insertId;

                for (let i = 0; i < denomination.multiplication; i++) {
                    totalAmount += denomination.value;
                    cardCount++;
                    const giftCardNumber = await generateUniqueGiftCardNumber();
                    await query(`INSERT INTO ${tableName3} (giftcard_id, giftcard_calc_id, gift_card_number, amount, expiry_date, name, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                        insertedRecordId,
                        insertedRecordIdNew,
                        giftCardNumber,
                        denomination.value,
                        expiryDate,
                        'name',
                        'email',
                        'phone'
                    ]);
                }

            }
        } else if (requestData.type === 2) {
            for (const mydata of requestData.csvdata) {

                const giftCardNumber = await generateUniqueGiftCardNumber();
                totalAmount += mydata.amount;
                cardCount++;

                await query(`INSERT INTO ${tableName3} (giftcard_id, giftcard_calc_id, gift_card_number, amount, expiry_date, name, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                    insertedRecordId,
                    0,
                    giftCardNumber,
                    mydata.amount,
                    expiryDate,
                    mydata.name,
                    mydata.email,
                    mydata.phone
                ]);
            }
        } else {
            const giftCardNumber = await generateUniqueGiftCardNumber();
            totalAmount = requestData.amount;
            cardCount = 1;
            await query(`INSERT INTO ${tableName3} (giftcard_id, giftcard_calc_id, gift_card_number, amount, expiry_date) VALUES (?, ?, ?, ?, ?)`, [
                insertedRecordId,
                0,
                giftCardNumber,
                requestData.amount,
                expiryDate
            ]);
        }

        let chooseTemplateValue = requestData.type === 2 ? requestData.choose_template : 0;
        await query(`UPDATE ${tableName} SET total_amount = ?, total_giftcard = ?, choose_template = ? WHERE id = ?`, [totalAmount, cardCount, chooseTemplateValue, insertedRecordId]);

        await activityLog(ine_giftcard_ModuleID, null, insertedRecord, 1, 0); // Maintain Activity Log

        return sendResponse({ data: insertedRecord[0], message: ManageResponseStatus('created'), status: true }, 201);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

// Generate Gift Card Number
function generateGiftCardNumber() {
    const randomNumber = Math.floor(Math.random() * 100000000000);
    const numberString = randomNumber.toString().padStart(16, '0');
    return numberString.replace(/(\d{4})(?=\d)/g, '$1-');
}

// Genrate uniwue number for gift card 
async function generateUniqueGiftCardNumber() {
    let giftCardNumber;
    let isUnique = false;
    while (!isUnique) {
        giftCardNumber = generateGiftCardNumber();
        const existingRecord = await query(`SELECT * FROM ${tableName3} WHERE gift_card_number = ?`, [giftCardNumber]);
        if (existingRecord.length === 0) {
            isUnique = true;
        }
    }
    return giftCardNumber;
}

export const GET = async (req) => {
    try {
        const url = req.url;
        if (!url) {
            return sendResponse({ error: 'URL is missing', status: false }, 400);
        }

        try {
            const typeID = new URL(url).searchParams.get('type');
            const id = new URL(url).searchParams.get('id');
            let condition = id ? 'AND id = ?' : '';
            let params = id ? [typeID, id] : [typeID];
            const results = await query(`SELECT * FROM ${tableName} WHERE status = 1 and type = ? ${condition} ORDER BY id DESC`, params);
            if (results.length > 0) {
                for (const result of results) {
                    const denominationArray = await query(`SELECT id , denomination as value, multiplication FROM ine_giftcard_calc WHERE giftcard_id = ?`, [result.id]);
                    result['Rows'] = denominationArray;
                }
                return sendResponse({ data: id ? results[0] : results, message: ManageResponseStatus('fetched'), status: true }, 200);
            }

            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);

        } catch (error) {
            return sendResponse({ error: `Error parsing URL: ${error.message}`, status: false }, 400);
        }

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};


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