import API_CONFIG from './apiConfig';
import { SimpleResponse } from '../types';

export interface RegisterPayload {
  mobile_number: string;
  password: string;
  frist_name: string;
  last_name: string;
  gender: string;
  blood_group: string;
  dob: string;
  age: string;
  any_disablity: string;
  desis_desc: string;
  has_mediclaim: string;
  house_no: string;
  city: string;
  pincode: string;
  police_station_id: string;
  country: string;
  co_contact_number: string;
  co_name: string;
  has_co: string;
  is_handicaped: string;
  state: string;
  maritual_status: string;
  imageUri: string;
  hasSon: string;
  hasDaughter: string;
  hasSonInLaw: string;
  hasDaughterLaw: string;
  otherMember: string;
  fcm: string;
}

export const registerApi = {
  getRegisterApi: async (data: RegisterPayload): Promise<SimpleResponse> => {
    try {
      const formData = new FormData();
      formData.append('mobile_number', data.mobile_number);
      formData.append('password', data.password);
      formData.append('frist_name', data.frist_name);
      formData.append('last_name', data.last_name);
      formData.append('gender', data.gender);
      formData.append('blood_group', data.blood_group);
      formData.append('dob', data.dob);
      formData.append('age', data.age);
      formData.append('any_disablity', data.any_disablity);
      formData.append('desis_desc', data.desis_desc || '');
      formData.append('has_mediclaim', data.has_mediclaim);
      formData.append('house_no', data.house_no);
      formData.append('city', data.city);
      formData.append('pincode', data.pincode);
      formData.append('police_station_id', data.police_station_id);
      formData.append('country', data.country || 'India');
      formData.append('co_contact_number', data.co_contact_number || '');
      formData.append('co_name', data.co_name || '');
      formData.append('has_co', data.has_co);
      formData.append('is_handicaped', data.is_handicaped);
      formData.append('state', data.state || 'West Bengal');
      formData.append('maritual_status', data.maritual_status);
      formData.append('has_son', data.hasSon);
      formData.append('has_daughter', data.hasDaughter);
      formData.append('has_son_law', data.hasSonInLaw);
      formData.append('has_daughter_law', data.hasDaughterLaw);
      formData.append('fcm', data.fcm || '');

      if (data.imageUri) {
        const filename = data.imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('image', {
          uri: data.imageUri,
          name: filename,
          type,
        } as any);
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const text = await response.text();
      try {
        return JSON.parse(text) as SimpleResponse;
      } catch {
        return { response: text };
      }
    } catch (error) {
      console.error('registerApi error:', error);
      return { response: 'error' };
    }
  },
};

export default registerApi;
