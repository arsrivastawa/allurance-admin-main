
// src/app/api/user/changepassword/route.js
import { query } from "../../../../utils/database";
import { ine_users_ModuleID, ine_users_tablename } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, ManageResponseStatus, validatePassword } from "../../../../utils/commonFunction";
import bcrypt from 'bcrypt';
import { authenticateToken } from "src/utils/authMiddleware";

// Table Name
const tableName = ine_users_tablename;

// PUT METHOD
export const PUT = async (req) => {
    try {
        await authenticateToken(req);
        const id = getQueryParamId(new URL(req.url));

        if (!id) {
            return sendResponse({ error: 'User ID must be required', status: false }, 400);
        }

        // Check if the ID exists in the database and retrieve the existing record
        const [existingRecord] = await getRecordById(id, tableName, 'id');

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        const { current_password, new_password, confirm_password } = await req.json();

        // Field Validation
        if (!current_password || !new_password || !confirm_password) {
            return sendResponse({ error: 'Current Password, New Password and Confirm Password fields are required', status: false }, 400);
        }

        // Validate the current password
        const isCurrentPasswordValid = await bcrypt.compare(current_password, existingRecord.password);

        if (!isCurrentPasswordValid) {
            return sendResponse({ error: 'Current Password is Incorrect', status: false }, 401);
        }

        // Password Validation
        if (!validatePassword(new_password)) {
            return sendResponse({ error: 'New Password must be at least 9 characters long and contain at least one uppercase letter, one lowercase letter and one special character.', status: false }, 400);
        }

        if (!validatePassword(confirm_password)) {
            return sendResponse({ error: 'Confirm Password must be at least 9 characters long and contain at least one uppercase letter, one lowercase letter and one special character.', status: false }, 400);
        }

        if (new_password !== confirm_password) {
            return sendResponse({ error: 'New Password and Confirm Password does not match.', status: false }, 400);
        }

        // Hash the password
        const hashedPassword = new_password ? await bcrypt.hash(new_password, 10) : undefined;

        await query(`UPDATE ${tableName} SET password = ?, updated_at = NOW() WHERE id = ?`, [hashedPassword, id]);

        // Retrieve the updated record
        const [updatedRecord] = await getRecordById(id, tableName, 'id');

        await activityLog(ine_users_ModuleID, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

        return sendResponse({ data: updatedRecord, message: ManageResponseStatus('updated'), status: true }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
