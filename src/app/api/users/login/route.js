
// src/app/api/user/login/route.js
import { query } from "../../../../utils/database";
import { ine_users_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse } from "../../../../utils/commonFunction";
import bcrypt from 'bcrypt';
const jwt = require('jsonwebtoken');

// Table Name
const tableName = ine_users_tablename;
const API_SECRET_KEY = process.env.API_SECRET_KEY;
const API_TOKEN_EXPIRESIN = process.env.API_TOKEN_EXPIRESIN;

// // POST METHOD
// export const POST = async (req) => {
//     try {
//         const requestData = await req.json();
//         // Validate request data
//         if (!requestData.prefix_id || !requestData.password) {
//             return sendResponse({ error: 'User ID and Password field must be required', status: false }, 400);
//         }
//         const results = await query(`SELECT * FROM \`${tableName}\` WHERE prefix_id = ? AND status = 1`, [requestData.prefix_id]);
//         if (results.length > 0) {
//             const storedHashedPassword = results[0].password;
//             const passwordMatch = await bcrypt.compare(requestData.password, storedHashedPassword);
//             if (passwordMatch) {
//                 const token = jwt.sign({ data: results[0] }, API_SECRET_KEY, { expiresIn: API_TOKEN_EXPIRESIN });
//                 return sendResponse({ data: token, message: 'Login Successfully', status: true }, 200);
//             } else {
//                 return sendResponse({ error: 'Invalid User ID or Password', status: false }, 401);
//             }
//         }
//         return sendResponse({ error: 'User ID does not exist or is inactive', status: false }, 404);

//     } catch (error) {
//         return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
//     }
// };

// POST METHOD
export const POST = async (req) => {
    try {
        const requestData = await req.json();
        // Validate request data
        if (!requestData.prefix_id || !requestData.password) {
            return sendResponse({ error: 'User ID and Password field must be required', status: false }, 400);
        }

        const results = await query(`SELECT * FROM \`${tableName}\` WHERE prefix_id = ? AND status = 1`, [requestData.prefix_id]);
        if (results.length > 0) {
            const user = results[0];
            // Check if the role ID is 9
            if (user.role_id === 9) {
                return sendResponse({ error: 'Login not allowed for this role ID', status: false }, 403);
            }

            const storedHashedPassword = user.password;
            const passwordMatch = await bcrypt.compare(requestData.password, storedHashedPassword);
            if (passwordMatch) {
                const token = jwt.sign({ data: user }, API_SECRET_KEY, { expiresIn: API_TOKEN_EXPIRESIN });
                return sendResponse({ data: token, message: 'Login Successfully', status: true }, 200);
            } else {
                return sendResponse({ error: 'Invalid User ID or Password', status: false }, 401);
            }
        }

        return sendResponse({ error: 'User ID does not exist or is inactive', status: false }, 404);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}`, status: false }, 500);
    }
};
