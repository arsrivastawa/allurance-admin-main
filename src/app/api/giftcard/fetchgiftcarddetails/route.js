
import { query } from "../../../../utils/database";
import { ine_giftcard_tablename, ine_giftcard_calc_tablename } from "src/utils/apiEndPoints";
import { sendResponse, ManageResponseStatus } from "../../../../utils/commonFunction";

const tableName = ine_giftcard_tablename;
const tableName2 = ine_giftcard_calc_tablename;

export const GET = async (req) => {
    try {
        const url = req.url;
        if (!url) {
            return sendResponse({ error: 'URL is missing', status: false }, 400);
        }

        try {
            const id = new URL(url).searchParams.get('id');
            if (!id) {
                return sendResponse({ error: 'ID is missing', status: false }, 400);
            }

            // Query the first table (t1) and join with the second table (t2)
            const results = await query(`
                SELECT t1.*, t2.denomination AS value, t2.multiplication
                FROM ${tableName} AS t1
                LEFT JOIN ${tableName2} AS t2 ON t1.id = t2.giftcard_id
                WHERE t1.id = ? AND t1.status = 1
                ORDER BY t1.id DESC`, [id]);

            if (results.length > 0) {
                const responseData = { ...results[0] };
                const secondTableData = results.map(result => ({
                    denomination: result.value,
                    multiplication: result.multiplication
                }));
                responseData['Rows'] = secondTableData;

                for (const result of results) {
                    // Fetch data from the third table where the IDs match
                    const thirdTableData = await query(`
                        SELECT *
                        FROM ine_giftcard_generate
                        WHERE giftcard_id = ? AND giftcard_calc_id IN (
                            SELECT id
                            FROM ine_giftcard_calc
                            WHERE giftcard_id = ?
                        )
                    `, [result.id, result.id]);
                    // Add the fetched data to the result object under the 'giftcards' key
                    responseData['giftcards'] = thirdTableData;
                }

                // Return the response
                return sendResponse({ data: responseData, message: ManageResponseStatus('fetched'), status: true }, 200);
            }

            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);

        } catch (error) {
            return sendResponse({ error: `Error parsing URL: ${error.message}`, status: false }, 400);
        }

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
