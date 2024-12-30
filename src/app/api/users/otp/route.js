
// src/app/api/user/otp/route.js
import { query } from "../../../../utils/database";
import { ine_users_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_users_tablename;

// POST METHOD
export const POST = async (req) => {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return sendResponse({ error: 'Email and OTP fields are required', status: false }, 400);
        }

        const [existingRecord] = await query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);
        
        if (!existingRecord) {
            return sendResponse({ error: 'Email not found', status: false }, 404);
        }

        if (existingRecord.otp !== otp) {
            return sendResponse({ error: 'Sorry, OTP is Invalid', status: false }, 400);
        }

        await query(`UPDATE ${tableName} SET otp = NULL, updated_at = NOW() WHERE email = ?`, [email]);

        const [updatedRecord] = await query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);

        return sendResponse({ paramsID: updatedRecord.id, message: 'OTP verified successfully', status: true, }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};