import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
});

export const getMarketChart = (coinId, days = 7) => {
  return apiClient.get(`/coins/${coinId}/market_chart`, {
    params: {
      vs_currency: 'usd',
      days: days,
      interval: 'daily',
    }
  });
};

export const getSimplePrice = (coinIds) => {
  // ... 其他 API
};
