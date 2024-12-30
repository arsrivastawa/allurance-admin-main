import { ine_giftcard_generate_tablename } from "src/utils/apiEndPoints";
import { sendResponse } from "src/utils/commonFunction";

// Table Names
const tableName = ine_giftcard_generate_tablename;

export const POST = async (req) => {
    try {
        const requestData = await req.json();
        return sendResponse({ data: requestData, message: 'OTP Verified successfully', status: true }, 200);
    } catch (error) {
        console.error('Error occurred:', error);
        return sendResponse({ error: `Error occurred: ${error.message}`, status: false }, 500);
    }
};
