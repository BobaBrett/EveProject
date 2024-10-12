import axios from 'axios';

const STRUCTURE_ID = 1035466617946;
const ESI_BASE_URL = 'https://esi.evetech.net/latest';

export async function fetchMarketOrders() {
  try {
    const response = await axios.get(`${ESI_BASE_URL}/markets/structures/${STRUCTURE_ID}/`, {
      params: {
        datasource: 'tranquility',
        page: 1
      }
    });

    let allOrders = response.data;
    let page = 2;

    // Fetch all pages
    while (response.headers['x-pages'] && page <= parseInt(response.headers['x-pages'])) {
      const nextPageResponse = await axios.get(`${ESI_BASE_URL}/markets/structures/${STRUCTURE_ID}/`, {
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