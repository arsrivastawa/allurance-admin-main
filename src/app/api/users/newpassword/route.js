
// src/app/api/user/newpassword/route.js
import { query } from "../../../../utils/database";
import { ine_users_ModuleID, ine_users_tablename } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, validatePassword } from "../../../../utils/commonFunction";
import bcrypt from 'bcrypt';

// Table Name
const tableName = ine_users_tablename;

// POST METHOD
export const POST = async (req) => {
    try {
        const { email, new_password, confirm_password, paramsID } = await req.json();

        const existingRecord = await query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);
        if (!existingRecord) {
            return sendResponse({ error: 'Email not found', status: false }, 404);
        }

        if (!new_password || !confirm_password) {
            return sendResponse({ error: 'New Password and Confirm Password fields are required', status: false }, 400);
        }

        if (!validatePassword(new_password)) {
            return sendResponse({ error: 'New Password must be at least 9 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.', status: false }, 400);
        }
        if (new_password !== confirm_password) {
            return sendResponse({ error: 'New Password and Confirm Password do not match.', status: false }, 400);
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        const updateResult = await query(`UPDATE ${tableName} SET password = ?, updated_at = NOW() WHERE email = ? and id = ?`, [hashedPassword, email, paramsID]);
        
        if (updateResult.affectedRows === 0) {
            return sendResponse({ error: 'Something Wrong!', status: false }, 400);
        }

        const [updatedRecord] = await getRecordById(paramsID, tableName, 'id');
        await activityLog(ine_users_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

        return sendResponse({ message: 'Password Successfully Updated', status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
