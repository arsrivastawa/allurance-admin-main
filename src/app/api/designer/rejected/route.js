import { query } from "../../../../utils/database";
import { ine_campaign_tablename, ine_designer_tablename, ine_giftcard_tablename, ine_manage_request_tablename, ine_marekting_tablename, ine_replicator_tablename } from "../../../../utils/apiEndPoints";
import { activityLog, sendResponse, getRecordById, getQueryParamId, ManageResponseStatus } from "../../../../utils/commonFunction";
import { authenticateToken } from "src/utils/authMiddleware";

export const PUT = async (req) => {
    try {
        await authenticateToken(req);
        const id = await getQueryParamId(new URL(req.url));
        const { moduleId, record_status, rowID, rejection_reason, roleid } = await req.json();

        if (!id) {
            return sendResponse({ error: ManageResponseStatus('RowIdRequired'), status: false }, 400);
        }
        let tableName;
        let tableName2 = ine_manage_request_tablename;
        switch (moduleId) {
            case 15:
                tableName = ine_designer_tablename;
                break;
            case 17:
                tableName = ine_giftcard_tablename;
                break;
            case 18:
                tableName = ine_replicator_tablename;
                break;
            case 94:
                tableName = ine_marekting_tablename;
                break;
            case 98:
                tableName = ine_campaign_tablename;
                // tableName3 = ine_serial_number;
                break;
            default:
                tableName = '';
                tableName2 = '';
        }
        const [existingRecord] = await getRecordById(rowID, tableName, 'id');

        if (!existingRecord) {
            return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
        }

        // Validate request data
        if (!record_status) {
            return sendResponse({ error: 'Record Status field is required', status: false }, 400);
        }

        if (moduleId == 15) {

            await query(`UPDATE ${tableName} SET record_status = ?,rejection_reason =?,updated_at = NOW() WHERE id = ?`, [record_status, rejection_reason, rowID]);
        }

        if (moduleId == 17) {
            await query(`UPDATE ${tableName} SET  record_status = ?,rejection_reason =?, updated_at = NOW() WHERE id = ?`, [record_status, rejection_reason, rowID]);
        }

        if (moduleId == 18) {

            await query(`UPDATE ${tableName} SET record_status = ?,rejection_reason =?, updated_at = NOW() WHERE id = ?`, [record_status, rejection_reason, rowID]);
        }
        if (moduleId == 94) {
            await query(`UPDATE ${tableName} SET record_status = ?,updated_at = NOW() WHERE id = ?`, [record_status, rowID]);
        }
        if (moduleId == 98) {
            await query(`UPDATE ${tableName} SET record_status = ?, updated_at = NOW(), updated_by = ? WHERE id = ? `, [record_status, roleid, rowID]);
        }
        await query(`UPDATE ${tableName2} SET request_status = ?,updated_at = NOW(), updated_by = ? WHERE row_id = ?`, [record_status, roleid, rowID]);

        const updatedRecord = await query(`SELECT * FROM ${tableName} WHERE id = ? `, [rowID])
        await activityLog(moduleId, existingRecord, updatedRecord, 2, 0); // Maintain Activity Log

        // return updatedRecord;
        return sendResponse({ status: " true", message: "Status updated Successfully" })
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
