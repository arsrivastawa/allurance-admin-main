"use server";
import { v4 as uuidv4 } from "uuid";
import sha256 from "crypto-js/sha256";
import axios from "axios";
import { INE_CREATE_ORDERS } from "src/utils/apiEndPoints";

export async function payment(amount, orderDetails) {
  try {
    const FinalAmount = parseInt(amount, 10);
    const transactionid = "Tr-" + uuidv4().toString(36).slice(-6);
    const merchantUserId = "MUID-" + uuidv4();
    const redirectUrl = process.env.BASE_URL;
    // const redirectUrl = `http://localhost:3032/api/status/${transactionid}`;
    // console.log("process.env.NEXT_PUBLIC_MERCHANT_ID,", process.env.NEXT_PUBLIC_MERCHANT_ID);
    // console.log("transactionid", transactionid)
    // console.log("merchantUserId", merchantUserId)
    // console.log("redirectUrl", redirectUrl)
    // console.log("orderDetails", orderDetails)
    const payload = {
      merchantId: process.env.NEXT_PUBLIC_MERCHANT_ID,
      merchantTransactionId: transactionid,
      merchantUserId: merchantUserId,
      amount: FinalAmount,
      redirectUrl: redirectUrl,
      redirectMode: "POST",
      callbackUrl: redirectUrl,
      mobileNumber: orderDetails?.phone || '',
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const dataPayload = JSON.stringify(payload);
    const dataBase64 = Buffer.from(dataPayload).toString("base64");
    const fullURL = dataBase64 + "/pg/v1/pay" + process.env.NEXT_PUBLIC_SALT_KEY;
    const dataSha256 = sha256(fullURL).toString();
    const checksum = dataSha256 + "###" + process.env.NEXT_PUBLIC_SALT_INDEX;
    const LIVE_PAY_API_URL = process.env.PHONEPE_LINK;

    const response = await axios.post(
      LIVE_PAY_API_URL,
      { request: dataBase64 },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
        },
      }
    );
    if (response.data.success) {
      try {
        const orderResponse = await fetch(INE_CREATE_ORDERS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderDetails),
        });

        if (orderResponse.ok) {
          // console.log("Order creation successful.");
        } else {
          console.error("Failed to create order. Response:", await orderResponse.text());
        }
      } catch (error) {
        console.error("Order creation error:", error);
      }

      const redirect = response.data.data.instrumentResponse.redirectInfo.url;
      return { url: redirect };
    } else {
      console.error("Payment processing failed:", response.data);
      throw new Error("Payment processing failed. Please try again.");
    }

  } catch (error) {
    if (error.response) {
      console.error("Payment API response error:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else {
      console.error("Payment API error:", error.message);
    }
    throw new Error("Payment processing failed. Please try again.");
  }
}
