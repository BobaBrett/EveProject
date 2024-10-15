import dotenv from 'dotenv';
dotenv.config();


export const EVE_CLIENT_ID = process.env.EVE_CLIENT_ID;
export const EVE_CLIENT_SECRET = process.env.EVE_CLIENT_SECRET;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';