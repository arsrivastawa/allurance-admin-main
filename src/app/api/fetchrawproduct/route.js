import { query } from "../../../utils/database";
import { ine_designer_tablename, ine_marekting_tablename } from "../../../utils/apiEndPoints";
import { sendResponse, ManageResponseStatus, getQueryParamCategoryIds } from "../../../utils/commonFunction";

const tableName = ine_designer_tablename;
const tableName2 = ine_marekting_tablename;

export const GET = async (req) => {
    try {
        // Extract categoryIds from the query parameters
        const categories = getQueryParamCategoryIds(new URL(req.url));

        // Construct the SQL query to fetch products by category IDs
        let query1 = `
            SELECT im.*, id.title as dtitle, id.category_id
            FROM ${tableName2} as im
            LEFT JOIN ${tableName} as id on id.id = im.designer_id
            WHERE im.status = 1
        `;

        // Update the query to fetch data from the ine_marketing table if no categories are provided
        if (!categories || categories.length === 0) {
            query1 = `
                SELECT *
                FROM ine_marketing
                WHERE status = 1
            `;
        }

        // Execute the query to fetch products
        let products = await query(query1); // Implement this function to execute the SQL query

        // Filter products to include only those matching the provided category IDs
        if (categories?.length > 0) {
            products = products.filter(product => categories.includes(product.category_id));
        }

        // Check if filtered products are found
        if (products.length > 0) {
            // Return filtered products with a success message
            return sendResponse({ data: products, message: ManageResponseStatus('fetched'), status: true }, 200);
        } else {
            // Return a not found error if no matching products are found
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }
    } catch (error) {
        // Return an error response if any error occurs
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
