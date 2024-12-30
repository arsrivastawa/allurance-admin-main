import { query } from "../../../../utils/database";
import { ine_marekting_ModuleID, ine_designer_tablename, ine_manage_request_tablename, ine_marekting_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse, getRecordById, getQueryParamId, ManageResponseStatus, processDocument } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_designer_tablename;
const tableName2 = ine_marekting_tablename;
const module_id = ine_marekting_ModuleID;

export const GET = async (req) => {
    try {
        const id = getQueryParamId(new URL(req.url));
        if (id) {
            const query1 = `
                SELECT ${tableName2}.*, ${tableName}.model_number
                FROM ${tableName2}
                LEFT JOIN ${tableName} ON ${tableName2}.designer_id = ${tableName}.id
                WHERE ${tableName2}.id = ?
                ORDER BY ${tableName2}.created_at DESC;
            `;
            const results = await query(query1, [id]);
            console.log("results", results);
            if (results.length > 0) {
                const foundRecord = results[0];
                const marketingId = foundRecord.id;
                const modelNumber = foundRecord.model_number;

                const query2 = `
                    SELECT * FROM ine_marketing_meta
                    WHERE m_id = ? AND created_at = (
                        SELECT MAX(created_at) 
                        FROM ine_marketing_meta 
                        WHERE m_id = ? AND meta_key = 'image'
                    );
                `;
                const metaResults = await query(query2, [marketingId, marketingId]);

                if (metaResults.length > 0) {
                    const transformedRecord = metaResults.reduce((acc, record) => {
                        if (record.meta_key === 'name') {
                            acc['title'] = record.meta_value;
                        } else if (record.meta_key === 'image') {
                            if (!acc.images) {
                                acc.images = [];
                            }
                            acc.images.push(record.meta_value);
                        } else if (record.meta_key === 'video') {
                            if (!acc.videos) {
                                acc.videos = [];
                            }
                            acc.videos.push(record.meta_value);
                        } else {
                            acc[record.meta_key] = record.meta_value;
                        }
                        return acc;
                    }, {});
                    transformedRecord.id = marketingId;
                    transformedRecord.model_number = modelNumber; // Add the model number to the response
                    return sendResponse({ data: transformedRecord, message: ManageResponseStatus('fetched'), status: true }, 200);
                }
            }
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};