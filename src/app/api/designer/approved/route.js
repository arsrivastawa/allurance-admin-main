
// src/app/api/designer/view/route.js
import { query } from "../../../../utils/database";
import { ine_campaign_ModuleID, ine_campaign_tablename, ine_designer_ModuleID, ine_designer_tablename, ine_giftcard_ModuleID, ine_giftcard_calc_tablename, ine_giftcard_generate_tablename, ine_giftcard_tablename, ine_manage_request_tablename, ine_marekting_ModuleID, ine_marekting_tablename, ine_order_return_tablename, ine_products_tablename, ine_replicator_moduleID, ine_replicator_tablename, ine_serial_number, ine_supportchannel_ModuleID } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, ManageResponseStatus, getRecordsByGiftcardId, insertOrUpdateRecordintoFrontend } from "../../../../utils/commonFunction";
import { authenticateToken } from "src/utils/authMiddleware";


function generateRandomNumber(CategoryCode, ResinCode, ShapeNumber) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    // Set 1: Category Code (alphabet)
    result += CategoryCode.charAt(0).toUpperCase(); // Taking the first character of the CategoryCode

    // Set 2: Resin Code (alphabet)
    result += '' + ResinCode.charAt(0).toUpperCase(); // Taking the first character of the ResinCode, with a dash

    // Set 3: Shape Number (numeric)
    result += '' + ShapeNumber.toString(); // With a dash

    // Set 4: Random Alphanumeric code
    let randomCode = '';
    for (let i = 0; i < 4; i++) {
        randomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Combine all sets with dashes
    result += '' + randomCode;

    return result;
}

// Function to generate a unique alphanumeric sub_model_number
async function generateRandomNumberforSubcategory() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let subModelNumber = '';
    let exists = true;

    // Generate and check unique sub_model_number
    while (exists) {
        // Generate an 8-character random string
        for (let i = 0; i < 8; i++) {
            subModelNumber += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Check if the sub_model_number already exists in the database
        const [existingRecord] = await query(`SELECT id FROM ine_designer WHERE sub_model_number = ?`, [subModelNumber]);
        if (!existingRecord) {
            exists = false; // The sub_model_number is unique
        } else {
            // Reset subModelNumber for the next iteration
            subModelNumber = '';
        }
    }
    return subModelNumber;
}


function generateRandomBatchNumber(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let batchNumber = '';
    for (let i = 0; i < length; i++) {
        batchNumber += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return batchNumber;
}


async function fetchLuhnSequencesFromDatabase() {
    // Use your database query function here to fetch the values from the ine_settings table
    const settings = await query(`SELECT replicator_luhn_sequence_left, replicator_luhn_sequence_right FROM ine_settings`);
    return settings[0]; // Assuming you only expect one row in the result
}

function calculateLuhnCheckDigit(number) {
    const digits = number.toString().split('').map(Number);
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];
        if (alternate) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
        alternate = !alternate;
    }
    return (sum * 9) % 10;
}

// Function to generate a unique serial number using modified sequences from the database
async function generateUniqueLuhnSerialNumberFromDatabase() {
    // Fetch replicator_luhn_sequence_left and replicator_luhn_sequence_right from the database
    const { replicator_luhn_sequence_left, replicator_luhn_sequence_right } = await fetchLuhnSequencesFromDatabase();

    // Decrement the left sequence by 1 and increment the right sequence by 1
    const modifiedLeftSequence = replicator_luhn_sequence_left + 1;
    const modifiedRightSequence = replicator_luhn_sequence_right - 1;

    // Convert the modified sequences to strings
    const leftPartialSerialNumber = modifiedLeftSequence.toString();
    const rightPartialSerialNumber = modifiedRightSequence.toString();

    // Calculate the check digits for the left and right sequences
    const leftCheckDigit = calculateLuhnCheckDigit(leftPartialSerialNumber);
    const rightCheckDigit = calculateLuhnCheckDigit(rightPartialSerialNumber);

    await updateLuhnSequencesInDatabase(modifiedLeftSequence, modifiedRightSequence)

    // Construct the full serial number by combining the left and right sequences
    const fullSerialNumber = leftPartialSerialNumber + leftCheckDigit + rightPartialSerialNumber + rightCheckDigit;

    // Return the full serial number
    return fullSerialNumber;
}

async function updateLuhnSequencesInDatabase(modifiedLeftSequence, modifiedRightSequence) {
    await query(`UPDATE ine_settings SET replicator_luhn_sequence_left = ?, replicator_luhn_sequence_right = ? WHERE id = 1`, [modifiedLeftSequence, modifiedRightSequence]);
}

export const PUT = async (req) => {
    try {
        // await authenticateToken(req);
        const id = await getQueryParamId(new URL(req.url));
        const { moduleId, record_status, rowID, roleid } = await req.json();
        if (!id) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }
        let tableName;
        let tableName2 = ine_manage_request_tablename;
        let tableName3 = ine_serial_number;
        let tableName4 = ine_products_tablename;

        switch (moduleId) {
            case ine_designer_ModuleID:
                tableName = ine_designer_tablename;
                break;
            case ine_giftcard_ModuleID:
                tableName = ine_giftcard_tablename;
                break;
            case ine_replicator_moduleID:
                tableName = ine_replicator_tablename;
                // tableName3 = ine_serial_number;
                break;
            case ine_marekting_ModuleID:
                tableName = ine_marekting_tablename;
                // tableName3 = ine_serial_number;
                break;
            case ine_campaign_ModuleID:
                tableName = ine_campaign_tablename;
                break;
            case ine_supportchannel_ModuleID:
                tableName = ine_order_return_tablename;
                break;
            default:
                tableName = '';
                tableName2 = '';
        }
        const [existingRecord] = await getRecordById(rowID, tableName, 'id');
        if (moduleId == ine_designer_ModuleID) {
            let CategoryCode = '';
            let ResinCode = '';
            let ShapeNumber = '';

            if (existingRecord.updated_by != null) {
                await query(`UPDATE ${tableName} SET record_status = ? WHERE id = ?`, [
                    record_status,
                    rowID
                ]);
            }
            else {
                // Fetching category code
                const categoryResult = await query(`SELECT * FROM ine_category WHERE id = ?`, [existingRecord.category_id]);
                if (categoryResult.length > 0) {
                    CategoryCode = categoryResult[0].code;
                }

                // Fetching resin code
                const resinResult = await query(`SELECT * FROM ine_resin WHERE id = ?`, [existingRecord.resin_id]);
                if (resinResult.length > 0) {
                    ResinCode = resinResult[0].code;
                }

                // Fetching shape number
                const shapeResult = await query(`SELECT * FROM ine_shape WHERE id = ?`, [existingRecord.shape_id]);
                if (shapeResult.length > 0) {
                    ShapeNumber = shapeResult[0].sequence_number;
                }
                if (!existingRecord) {
                    return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
                }
                // Validate request data
                if (!record_status) {
                    return sendResponse({ error: 'Record Status field is required', status: false }, 400);
                }
                var model_number = await generateRandomNumber(CategoryCode, ResinCode, ShapeNumber);
                var sub_model_number = await generateRandomNumberforSubcategory();
                await query(`UPDATE ${tableName} SET record_status = ?, model_number = ?, sub_model_number = ? WHERE id = ?`, [
                    record_status,
                    model_number,
                    sub_model_number,
                    rowID
                ]);
            }
            await query(`UPDATE ${tableName} SET record_status = ? WHERE id = ?`, [record_status, rowID]);
        }
        // IF MODULE IS GIFTCARD 
        if (moduleId == ine_giftcard_ModuleID) {
            let totalAmount = 0;
            let cardCount = 0;
            let expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            expiryDate.setHours(23, 59, 59, 999);
            await query(`UPDATE ${tableName} SET  record_status = ?, updated_at = NOW() WHERE id = ?`, [record_status, rowID]);
            const requestData = await getRecordsByGiftcardId(rowID, ine_giftcard_calc_tablename, 'giftcard_id');
            // Iterate over the fetched data
            for (const denominationItem of requestData) {
                const { id, denomination, multiplication } = denominationItem;

                for (let i = 0; i < multiplication; i++) {
                    const giftCardNumber = await generateUniqueGiftCardNumber();
                    const pinNumber = await generateUniquePinNumber();

                    // Insert records into the third table
                    await query(`INSERT INTO ${ine_giftcard_generate_tablename} (giftcard_calc_id,giftcard_id, gift_card_number, pin_number, amount, expiry_date) VALUES (?, ?, ?, ?, ?, ?)`, [
                        id,
                        rowID,
                        giftCardNumber,
                        pinNumber,
                        denomination,
                        expiryDate // Define expiryDate as needed
                    ]);
                }
            }
        }
        // IF MODULE IS REPLICATOR 
        const batch_number = generateRandomBatchNumber(8);
        if (moduleId == ine_replicator_moduleID) {
            await query(`UPDATE ${tableName} SET record_status = ?, batch_number = ?, updated_at = NOW() WHERE id = ?`, [record_status, batch_number, rowID]);

            // Fetch necessary data for insertion from tableName2, ine_designer_tablename, and ine_replicator_tablename
            const query1 = `SELECT 
                imr.*,
                ide.title AS dtitle,
                ids.quantity AS quantity,
                ids.batch_number AS batch_sequence_no,
                ids.id AS replicator_id,
                (SELECT in_pair FROM ${ine_designer_tablename} WHERE model_number = ids.designer_id) AS dpair
            FROM 
                ${tableName2} AS imr 
            LEFT JOIN 
                ${ine_replicator_tablename} AS ids ON ids.id = imr.row_id 
            LEFT JOIN 
                ${ine_designer_tablename} AS ide ON ide.id = imr.row_id 
            WHERE 
                imr.row_id = ? AND imr.module_id = ?`;

            const [GetLatestRecord] = await query(query1, [rowID, moduleId]);
            if (GetLatestRecord && GetLatestRecord.quantity) {
                for (let i = 0; i < GetLatestRecord.quantity; i++) {
                    let serial_number = await generateUniqueLuhnSerialNumberFromDatabase();
                    let l_serial_number = '';
                    let r_serial_number = '';
                    let pairValue = 2; // Default to 2 (No)
                    if (GetLatestRecord?.dpair === 'Yes') {

                        pairValue = 1; // If dpair is 'yes', set pairValue to 1 (Yes)
                        // Modify l_serial_number and r_serial_number accordingly
                        l_serial_number = await serial_number + ' -L';
                        r_serial_number = await serial_number + ' -R';
                    }
                    // Check if dpair is 'yes' before including l_serial_number and r_serial_number in the query
                    const queryParameters = [
                        // Make sure to use the correct field for replicator_id
                        GetLatestRecord.replicator_id, // Verify that this is the correct field for replicator_id
                        pairValue,
                        GetLatestRecord.batch_sequence_no || 0, // Use batch_sequence_no from GetLatestRecord
                        serial_number // serial_number,
                    ];

                    // Include l_serial_number and r_serial_number only if dpair is 'yes'
                    if (pairValue === 1) {
                        queryParameters.push(l_serial_number);
                        queryParameters.push(r_serial_number);
                    } else {
                        // Add null placeholders for l_serial_number and r_serial_number if dpair is not 'yes'
                        queryParameters.push(null);
                        queryParameters.push(null);
                    }

                    await query(`INSERT INTO ${tableName3} (replicator_id, pair, batch_sequence_no, serial_number, l_serial_number, r_serial_number) VALUES (?, ?, ?, ?, ?, ?)`,
                        queryParameters);

                }
                await query(`
                INSERT INTO ine_packers (replicator_id)
                VALUES (?)
            `, [rowID]);
            }
        }

        if (moduleId == ine_marekting_ModuleID) {
            try {
                const marketingMetaRecords = await query(`
                SELECT *
                FROM ine_marketing_meta
                WHERE m_id = ? AND created_at = (
                    SELECT MAX(created_at) 
                    FROM ine_marketing_meta 
                    WHERE m_id = ? AND meta_key IN ('video', 'image')
                )
            `, [rowID, rowID]);

                const filteredRecords = marketingMetaRecords.filter(record => !(record.meta_key === 'create' || record.meta_key === 'update'));

                // Check if records are found in ine_marketing_meta
                if (filteredRecords.length === 0) {
                    return sendResponse({ error: 'No records found in ine Marketing Table', status: false }, 404);
                }

                // Filter out image records and insert them into ine_assets
                const imageRecords = filteredRecords.filter(record => record.meta_key === 'image' || record.meta_key === 'video');
                if (imageRecords.length > 0) {
                    const imageUploadPromises = imageRecords.map(async (imageRecord) => {
                        // Insert new image record into ine_assets table
                        await query(`
                            INSERT INTO ine_assets (m_id, meta_key, meta_value, created_at)
                            VALUES (?, ?, ?, ?)
                        `, [imageRecord.m_id, imageRecord.meta_key, imageRecord.meta_value, new Date()]);
                    });
                    await Promise.all(imageUploadPromises);
                }

                // Filter out non-image records
                const nonImageRecords = filteredRecords.filter(record => record.meta_key !== 'image' && record.meta_key !== 'video');

                // Construct update query dynamically based on meta_key and meta_value for non-image records
                const updateFields = nonImageRecords.map(({ meta_key, meta_value }) => {
                    // Check if the meta_key is 'name' and rename it to 'title'
                    if (meta_key === 'name') {
                        return `title = '${meta_value}'`;
                    }
                    else {
                        return `${meta_key} = '${meta_value}'`;
                    }
                }).join(', ');

                // Add 'record_status = 2' to updateFields
                // const updateFieldsWithStatus = `${updateFields}, record_status = 2`;
                // const updateFieldsWithStatus = `${updateFields}, "record_status" = 2`;
                const updateFieldsWithStatus = `${updateFields}, \`record_status\` = 2`;

                // Update records in tableName2 using the fetched data
                const updateResult = await query(`
                    UPDATE ${tableName}
                    SET ${updateFieldsWithStatus}
                    WHERE id = ?
                `, [rowID]);


                const insertPromises = filteredRecords.map(async (record) => {
                    await query(`
                INSERT INTO ine_marketing_meta (m_id, meta_key, meta_value, created_at)
                VALUES (?, ?, ?, ?)
            `, [record.m_id, record.meta_key, record.meta_value, new Date()]);
                });
                await Promise.all(insertPromises);

                await query(`UPDATE ${tableName2} SET request_status = ?, updated_at = NOW(), updated_by = ? WHERE row_id = ? `, [record_status, roleid, rowID]);
                const fetchMarketingDetails = await query(`SELECT * FROM ${tableName} WHERE id = ? `, [rowID]);
                const fetchedData = fetchMarketingDetails[0];

                // Use helper function to insert or update the record in the target table
                await insertOrUpdateRecordintoFrontend(tableName4, fetchedData);
                return sendResponse({ success: true, data: updateResult }, 200);
            } catch (error) {
                return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
            }
        }

        if (moduleId == ine_campaign_ModuleID) {
            await query(`UPDATE ${tableName} SET record_status = ?, updated_at = NOW(), updated_by = ? WHERE id = ? `, [record_status, roleid, rowID]);
        }
        if (moduleId == ine_supportchannel_ModuleID) {
            await query(`UPDATE ${tableName} SET record_status = ?, updated_at = NOW(), updated_by = ? WHERE order_id = ? `, [record_status, roleid, rowID]);
        }
        await query(`UPDATE ${tableName2} SET request_status = ?, updated_at = NOW(), updated_by = ? WHERE row_id = ? `, [record_status, roleid, rowID]);
        const updatedRecord = await query(`SELECT * FROM ${tableName} WHERE id = ? `, [rowID])
        await activityLog(moduleId, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log
        // return updatedRecord;
        return sendResponse({ status: " true", message: "Status updated Successfully" })
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};


function generateGiftCardNumber() {
    const randomNumber = Math.floor(Math.random() * (9999999999999999 - 1) + 1);
    const numberString = randomNumber.toString().padStart(16, '0'); // Ensure the number has 16 digits
    return numberString.replace(/(\d{4})(?=\d)/g, '$1-');
}

async function generateUniqueGiftCardNumber() {
    let giftCardNumber;
    let isUnique = false;
    while (!isUnique) {
        giftCardNumber = generateGiftCardNumber();
        const existingRecord = await query(`SELECT * FROM ${ine_giftcard_generate_tablename} WHERE gift_card_number = ?`, [giftCardNumber]);
        if (existingRecord.length === 0) {
            isUnique = true;
        }
    }
    return giftCardNumber;
}

function generatePinNumber() {
    const numericCharacters = '0123456789';
    let pin = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * numericCharacters.length);
        pin += numericCharacters[randomIndex];
    }
    return pin;
}

// Genrate uniwue number for gift card 
async function generateUniquePinNumber() {
    let pin_number;
    let isUnique = false;
    while (!isUnique) {
        pin_number = generatePinNumber();
        const existingRecord = await query(`SELECT * FROM ${ine_giftcard_generate_tablename} WHERE pin_number = ?`, [pin_number]);
        if (existingRecord.length === 0) {
            isUnique = true;
        }
    }
    return pin_number;
}
