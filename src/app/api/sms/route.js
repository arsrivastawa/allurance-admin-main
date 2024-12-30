// src/app/api/sms/route.js
import { sendResponse, ManageResponseStatus } from "../../../utils/commonFunction";
import https from "https";

// POST METHOD
export const POST = async (req) => {
    try {
        const { template_id, short_url, realTimeResponse, recipients } = await req.json();

        const options = {
            method: "POST",
            hostname: process.env.NEXT_PUBLIC_MSG91_HOSTNAME,
            port: null,
            path: process.env.NEXT_PUBLIC_MSG91_PATH,
            headers: {
                authkey: process.env.NEXT_PUBLIC_MSG91_AUTHKEY,
                accept: "application/json",
                "content-type": "application/json"
            }
        };

        const requestBody = JSON.stringify({
            template_id,
            short_url,
            realTimeResponse,
            recipients
        });

        const response = await new Promise((resolve, reject) => {
            const httpReq = https.request(options, (res) => {
                let chunks = [];

                res.on("data", (chunk) => {
                    chunks.push(chunk);
                });

                res.on("end", () => {
                    const body = Buffer.concat(chunks);
                    resolve(body.toString());
                });
            });

            httpReq.on("error", (e) => {
                reject(e);
            });

            httpReq.write(requestBody);
            httpReq.end();
        });

        return sendResponse({ data: JSON.parse(response), message: ManageResponseStatus('posted'), status: true }, 200);
    } catch (error) {
        return sendResponse({ error: `Error occurred: ${error.message}` }, 500);
    }
};
