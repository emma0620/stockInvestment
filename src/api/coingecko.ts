// coingecko.ts

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';


export interface MarketChartResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][]; // [timestamp, total_volume]
}


export interface SimplePriceResponse {
  [coinId: string]: {
    usd: number;

  };
}



const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
});


export const getMarketChart = (coinId: string, days: number = 7): Promise<AxiosResponse<MarketChartResponse>> => {
  return apiClient.get(`/coins/${coinId}/market_chart`, {
    params: {
      vs_currency: 'usd',
      days: days,

    }
  });
};


export const getSimplePrice = (coinIds: string[]): Promise<AxiosResponse<SimplePriceResponse>> => {
  return apiClient.get('/simple/price', {
    params: {
      ids: coinIds.join(','),
      vs_currencies: 'usd',
    }
  });
};

