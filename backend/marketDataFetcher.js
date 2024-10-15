import axios from 'axios';
import { getLatestAuthToken } from './database.js';

const LOCAL_API_URL = 'http://localhost:3000/api/esi';
const STRUCTURE_ID = 1035466617946;

export async function fetchMarketOrders() {
  try {
    //const db = await getDatabase();
    const accessToken = await getLatestAuthToken(db);

    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    const response = await axios.get(`${LOCAL_API_URL}/markets/structures/${STRUCTURE_ID}/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        datasource: 'tranquility',
        page: 1
      }
    });

    let allOrders = response.data;
    let page = 2;

    // Fetch all pages
    while (response.headers['x-pages'] && page <= parseInt(response.headers['x-pages'])) {
      const nextPageResponse = await axios.get(`${LOCAL_API_URL}/markets/structures/${STRUCTURE_ID}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          datasource: 'tranquility',
          page: page
        }
      });
      allOrders = allOrders.concat(nextPageResponse.data);
      page++;
    }

    return allOrders;
  } catch (error) {
    console.error('Error fetching market orders:', error);
    throw error;
  }
}