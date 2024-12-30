
// src/app/api/user/forgotpassword/route.js
import { query } from "../../../../utils/database";
import { ine_users_ModuleID, ine_users_tablename } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, generateOTP } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_users_tablename;

// PUT METHOD
export const PUT = async (req) => {
    try {
        const { email } = await req.json();
        if (!email) {
            return sendResponse({ error: 'Email field is required', status: false }, 400);
        }

        const [existingRecord] = await query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);
        if (!existingRecord) {
            return sendResponse({ error: 'Email not found', status: false }, 404);
        }

        const otp = generateOTP(6);
        await query(`UPDATE ${tableName} SET otp = ?, updated_at = NOW() WHERE email = ?`, [otp, email]);
        const [updatedRecord] = await query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);
        await activityLog(ine_users_ModuleID, existingRecord, updatedRecord, 2, 0);
        
        // await sendOTPEmail(email, otp);
        return sendResponse({ data: { OTP: updatedRecord['otp'] }, message: 'OTP has been sent to your email', status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
