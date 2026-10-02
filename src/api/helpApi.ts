import API_CONFIG from './apiConfig';
import {
  MyHelpListResponse,
  PoliceContactResponse,
  SimpleResponse,
  StatusCheckResponse,
  VersionCheckResponse,
} from '../types';
import { Alert } from 'react-native';

export const helpApi = {
  fetchStationNumber: async (policeStationId: string): Promise<PoliceContactResponse> => {
    try {
      const formData = new FormData();
      formData.append('police_station_name', policeStationId);

      const response = await fetch(`${API_CONFIG.BASE_URL}police_contact`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('fetchStationNumber error:', error);
      return { response: 'error' };
    }
  },

  sendHelpRequest: async (
    userId: string,
    policeStationId: string,
    help: string
  ): Promise<SimpleResponse> => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('police_id', policeStationId);
      formData.append('help', help);

      const response = await fetch(`${API_CONFIG.BASE_URL}help_request`, {
        method: 'POST',
        body: formData,
      });
      const text = await response.text();
      // Alert.alert(userId);
      //  Alert.alert(policeStationId);
      //   Alert.alert(help);
      try {
        return JSON.parse(text);
      } catch {
        return { response: text };
      }
    } catch (error) {
      console.error('sendHelpRequest error:', error);
      return { response: 'error' };
    }
  },

  sendAudioHelpRequest: async (
    userId: string,
    policeStationId: string,
    help: string,
    audioPath: string
  ): Promise<SimpleResponse> => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('police_id', policeStationId);
      formData.append('help', help);

      const filename = audioPath.split('/').pop() || 'voice_help.mp4';
      formData.append('has_audio', {
        uri: audioPath.startsWith('file://') ? audioPath : `file://${audioPath}`,
        name: filename,
        type: 'audio/mp4',
      } as any);

      const response = await fetch(`${API_CONFIG.BASE_URL}help_request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { response: text };
      }
    } catch (error) {
      console.error('sendAudioHelpRequest error:', error);
      return { response: 'error' };
    }
  },

  fetchMyHelpList: async (userId: string): Promise<MyHelpListResponse> => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);

      const response = await fetch(`${API_CONFIG.BASE_URL}view_help_list`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('fetchMyHelpList error:', error);
      return { response: 'error', data: [] };
    }
  },

  statusCheck: async (userId: string): Promise<StatusCheckResponse> => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);

      const response = await fetch(`${API_CONFIG.BASE_URL}status_check`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('statusCheck error:', error);
      return { response: 'error' };
    }
  },

  versionCheck: async (): Promise<VersionCheckResponse> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}version_check`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('versionCheck error:', error);
      return { response: 'error' };
    }
  },
};

export default helpApi;
