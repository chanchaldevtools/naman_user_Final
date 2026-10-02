import API_CONFIG from './apiConfig';
import { CityListResponse, PoliceStationResponse, SimpleResponse } from '../types';

export const stationApi = {
  fetchCityList: async (): Promise<CityListResponse> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}city_list`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('fetchCityList error:', error);
      return { response: 'error', city_list: [] };
    }
  },

  fetchPoliceStation: async (): Promise<PoliceStationResponse> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}police_station_list`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('fetchPoliceStation error:', error);
      return { response: 'error', police_station_data: [] };
    }
  },

  setFcm: async (userId: string, fcm: string): Promise<SimpleResponse> => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('fcm', fcm);
      formData.append('type', '1');

      const response = await fetch(`${API_CONFIG.BASE_URL}fcm_set`, {
        method: 'POST',
        body: formData,
      });
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { response: text };
      }
    } catch (error) {
      console.error('setFcm error:', error);
      return { response: 'error' };
    }
  },
};

export default stationApi;
