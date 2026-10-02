import API_CONFIG from './apiConfig';
import { VisitResponse } from '../types';

export const visitApi = {
  fetchAllVisitList: async (policeStationId: string, userId: string): Promise<VisitResponse> => {
    try {
      const formData = new FormData();
      formData.append('police_station_id', policeStationId);
      formData.append('user_id', userId);

      const response = await fetch(`${API_CONFIG.BASE_URL}visited_create`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('fetchAllVisitList error:', error);
      return { response: 'error', data: [] };
    }
  },
};

export default visitApi;
