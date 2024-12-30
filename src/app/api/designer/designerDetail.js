

// src/app/api/designer/designerDetail.js
import { query } from "../../../utils/database";
import { ine_designer_tablename, ine_category_tablename, ine_resin_tablename, ine_shape_tablename, ine_size_for_shape_tablename, ine_bezel_material_tablename, ine_bezel_color_tablename, ine_inner_material_tablename, ine_flower_tablename, ine_manage_request_tablename, ine_users_tablename, ine_status_tablename, ine_modules_tablename, ine_users_details_tablename, ine_state_district_tablename, ine_color_shade_tablename } from "../../../utils/apiEndPoints";
import { sendResponse, ManageResponseStatus } from "../../../utils/commonFunction";

// Designer Details
export async function getDesignerDetail(id) {
    const baseQuery = `SELECT idr.*, ic.name as category_name, ir.name as resin_name, ish.sequence_number as shape_sequence_number, ish.shape as shape_shape, isfs.length as isfs_length, isfs.breadth as isfs_breadth, ibm.name as bezel_material_name, ibc.name as bezel_color_name, inm.name as Inner_material_name, ifl.name as flower_name, icst.name as color_name 
        FROM \`${ine_designer_tablename}\` as idr 
        LEFT JOIN \`${ine_category_tablename}\` as ic on ic.id = idr.category_id
        LEFT JOIN \`${ine_resin_tablename}\` as ir on ir.id = idr.resin_id
        LEFT JOIN \`${ine_shape_tablename}\` as ish on ish.id = idr.shape_id
        LEFT JOIN \`${ine_size_for_shape_tablename}\` as isfs on isfs.id = idr.size_id
        LEFT JOIN \`${ine_bezel_material_tablename}\` as ibm on ibm.id = idr.bezel_material_id
        LEFT JOIN \`${ine_bezel_color_tablename}\` as ibc on ibc.id = idr.bezel_color_id
        LEFT JOIN \`${ine_inner_material_tablename}\` as inm on inm.id = idr.Inner_material_id
        LEFT JOIN \`${ine_flower_tablename}\` as ifl on ifl.id = idr.flower_id	
        LEFT JOIN \`${ine_color_shade_tablename}\` as icst on icst.id = idr.color_id	
        WHERE idr.status = 1`;

    if (id) {
        const query1 = `${baseQuery} AND idr.id = ? ORDER BY idr.id DESC`;
        const results = await query(query1, [id]);

        if (results.length > 0) {
            return sendResponse({ data: results[0], message: ManageResponseStatus('fetched'), status: true }, 200);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    }

    const query2 = `${baseQuery} ORDER BY idr.id DESC;`;
    const results = await query(query2);

    if (results.length > 0) {
        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
    }

    return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
}

export async function getRequestDetail(id) {

    const baseQuery = `
    SELECT 
        imr.*, 
        iu.role_id as user_role_id, 
        iu.prefix_id as user_prefix_id, 
        iu.first_name as user_first_name, 
        iu.last_name as user_last_name, 
        iu.email as user_email, 
        iu.phone as user_phone, 
        ist.title as request_status, 
        im.name as request_name, 
        iudt.gender as user_gender, 
        iudt.address as user_address, 
        iudt.pincode as user_pincode, 
        isdt1.StateName as user_statename, 
        isdt2.District as user_districtname,
        iu_updated.prefix_id as updated_user_prefix_id,
        iu_updated.first_name as updated_user_first_name,
        iu_updated.last_name as updated_user_last_name,
        iu_updated.email as updated_user_email,
        iu_updated.id as updated_user_id -- Change to select updated user ID
    FROM 
        \`${ine_manage_request_tablename}\` as imr
    LEFT JOIN 
        \`${ine_users_tablename}\` as iu on iu.id = imr.created_by
    LEFT JOIN 
        \`${ine_status_tablename}\` as ist on ist.id = imr.request_status
    LEFT JOIN 
        \`${ine_users_details_tablename}\` as iudt on iudt.user_id = iu.id
    LEFT JOIN 
        \`${ine_state_district_tablename}\` as isdt1 on isdt1.id = iudt.state
    LEFT JOIN 
        \`${ine_state_district_tablename}\` as isdt2 on isdt2.id = iudt.state
    LEFT JOIN 
        \`${ine_modules_tablename}\` as im on im.id = imr.module_id
    LEFT JOIN 
        \`${ine_users_tablename}\` as iu_updated on iu_updated.id = imr.updated_by
    WHERE 
        imr.status = 1`;


    if (id) {
        const query1 = `${baseQuery} AND imr.id = ? ORDER BY imr.id DESC`;
        const results = await query(query1, [id]);

        if (results.length > 0) {
            const requestsWithGiftCards = results.filter(request => request.request_name === 'Gift Cards');
            for (const request of requestsWithGiftCards) {
                const giftCardInfoQuery = `SELECT type FROM ine_giftcard WHERE id = ?`;
                const giftCardInfo = await query(giftCardInfoQuery, [request.row_id]);
                if (giftCardInfo.length > 0) {
                    request.gift_card_type = giftCardInfo[0].type;
                }
            }
            return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true }, 200);
        }
        return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
    }

    const query2 = `${baseQuery} ORDER BY imr.id DESC;`;
    const results = await query(query2);

    if (results.length > 0) {
        const requestsWithGiftCards = results.filter(request => request.request_name === 'Gift Cards');
        for (const request of requestsWithGiftCards) {
            const giftCardInfoQuery = `SELECT type FROM ine_giftcard WHERE id = ?`;
            const giftCardInfo = await query(giftCardInfoQuery, [request.row_id]);
            if (giftCardInfo.length > 0) {
                request.gift_card_type = giftCardInfo[0].type;
            }
        }
        return sendResponse({ data: results, message: ManageResponseStatus('fetched'), status: true, count: results.length }, 200);
    }

    return sendResponse({ error: ManageResponseStatus('notFound'), status: false }, 404);
}
