// src/utils/frontendAPIEndPoints.js

// .env variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // 'http://localhost:3032/api';

// Home Page <PageName_SectionName>
export const FRONTEND_DESKTOPMASTHEAD = `${apiUrl}/desktopmasthead`;
export const FRONTEND_CATEGORY = `${apiUrl}/categories`;
export const FRONTEND_FAQ = `${apiUrl}/faqs`;
export const FRONTEND_SOCIAL = `${apiUrl}/sociallink`;
export const FRONTEND_BLOG = `${apiUrl}/blog`;
export const FRONTEND_CONTACT_INQUIRY = `${apiUrl}/contactus/inquiry`;
export const FRONTEND_PRODUCTS = `${apiUrl}/frontendproducts`;
export const FRONTEND_CART_ENDPOINT = `${apiUrl}/cart`;
export const FRONTEND_USER_ADDRESSES_ENDPOINT = `${apiUrl}/offlinesales/invoice/searchaddress`;
export const FRONTEND_CONTACTUS = `${apiUrl}/contactus`;
export const FRONTEND_REVIEW = `${apiUrl}/rating`;
export const FRONTEND_PAGESDATA = `${apiUrl}/pagesdata`;
export const FRONTEND_MYADDRESS = `${apiUrl}/myaddress`;
export const FRONTEND_SAVEPYAMENT = `${apiUrl}/savecards`;
export const FRONTEND_NOTIFICATIONS = `${apiUrl}/users/notifications`;
export const FRONTEND_REFERRAL = `${apiUrl}/myreferral`;
export const FRONTEND_GIFTCARD = `${apiUrl}/mygiftcard`;
export const FRONTEND_USERS = `${apiUrl}/users`;
export const FRONTEND_FORGOTPASSWORD = `${apiUrl}/users/forgotpassword`;
export const FRONTEND_OTP = `${apiUrl}/users/otp`;
export const FRONTEND_NEWPASSWORD = `${apiUrl}/users/newpassword`;
export const FRONTEND_CHANGEPASSWORD = `${apiUrl}/users/changepassword`;
export const FRONTEND_DEACTIVATEUSER = `${apiUrl}/users/deactivate`;
export const FRONTEND_WISHLIST = `${apiUrl}/mywishlist`;
export const FRONTEND_ORDERS_ENDPOINT = `${apiUrl}/orders`; // Module ID
export const FRONTEND_CAMPAIGN_ENDPOINT = `${apiUrl}/frontendcampaignlist/`; // Module ID
export const FRONTEND_AUTHPORTAL = `${apiUrl}/authportal`;
export const FRONTEND_TICKET = `${apiUrl}/ticket`;
export const FRONTEND_TICKET_SUBJECT = `${apiUrl}/ticket/subject`;
export const FRONTEND_TICKET_VERIFY = `${apiUrl}/ticket/verify`;
export const FRONTEND_TICKET_RESPONSE = `${apiUrl}/ticket/response`;