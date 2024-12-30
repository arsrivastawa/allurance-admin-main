// Import necessary modules and helper functions
import { query } from "../../../../../utils/database";
import { getRecordById, sendResponse, checkEmailExistOrNot, checkPhoneExistOrNot } from "../../../../../utils/commonFunction";
import { ine_roles_tablename, ine_users_tablename } from "../../../../../utils/apiEndPoints";

// Table Names
const tableName = ine_users_tablename;
const tableName3 = ine_roles_tablename;
// Main POST method for creating a new user


export const POST = async (req) => {
    try {
        const requestData = await req.json();

        // Validate request data
        const { firstName, lastName, email, phone_number } = requestData;
        if (!firstName || !lastName || !email || !phone_number) {
            return sendResponse({ error: 'First Name, Last Name, Email, Phone fields are required', status: false }, 400);
        }

        // Generate Prefix
        // Generate PreFix
        const [result1] = await query(`SELECT prefix FROM \`${tableName3}\` WHERE id = ? LIMIT 1`, [9]);
        const rolePrefixName = result1?.prefix || ''; // Logic to retrieve role prefix name, assuming it's obtained elsewhere
        const [result] = await query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const formattedNumber = String(result.count + 1).padStart(4, '0');
        const newPrefix = `${rolePrefixName}${formattedNumber}`;

        // Email Validation
        if (await checkEmailExistOrNot(tableName, email)) {
            return sendResponse({ error: 'Email already exists', status: false }, 409);
        }

        // Phone Validation
        if (phone_number.length !== 10) {
            return sendResponse({ error: 'Phone number must be 10 digits', status: false }, 400);
        }
        if (await checkPhoneExistOrNot(tableName, phone_number)) {
            return sendResponse({ error: 'Phone number already exists', status: false }, 409);
        }

        // Insertion
        const insertResult = await query(`INSERT INTO ${tableName} (role_id, first_name, last_name, email, phone, prefix_id) VALUES (?, ?, ?, ?, ?, ?)`, [
            9, // Set role_id to static value 9
            firstName,
            lastName,
            email,
            phone_number,
            newPrefix
        ]);

        const insertedRecordId = insertResult.insertId;
        const insertedRecord = await getRecordById(insertedRecordId, tableName, 'id'); // Retrieve the inserted record

        return sendResponse({ data: insertedRecord, message: 'User created successfully', status: true }, 201);

    } catch (error) {
        console.error('Error occurred:', error);
        return sendResponse({ error: `Error occurred: ${error.message}`, status: false }, 500);
    }
};



