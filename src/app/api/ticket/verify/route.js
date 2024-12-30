// src/app/api/ticket/verify/route.js
import { query } from "../../../../utils/database";
import {  ine_tickets_tablename } from "../../../../utils/apiEndPoints";
import { sendResponse } from "../../../../utils/commonFunction";

// Table Name
const tableName = ine_tickets_tablename;

// GET METHOD
export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const ticketID = url.searchParams.get('ticket_id');
        const userId = url.searchParams.get('user_id');
        
        let results = [];

        if (ticketID && userId) {
            results = await query(`SELECT * FROM ${tableName} WHERE id = ? AND user_id = ? and status = 1 `, [ticketID, userId]);
        } 
        
        const status = results.length > 0;

        return sendResponse({ data: results, message: status ? 'Record Successfully Fetched' : 'Sorry, Record Not Found', status }, 200);

    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};

