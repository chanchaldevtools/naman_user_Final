import API_CONFIG from './apiConfig';

const BASE_URL = API_CONFIG.BASE_URL.endsWith('/')
  ? API_CONFIG.BASE_URL.slice(0, -1)
  : API_CONFIG.BASE_URL;

export interface ApiMessage {
  id: number;
  sender_id: number;
  reciver_id: number | string;
  msg: string;
  sender_type: 'consumer' | 'police';
  reciver_type: 'consumer' | 'police';
  created_at: string;
  updated_at: string;
}

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs = 15000,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('⏰ TIMEOUT — aborting after', timeoutMs, 'ms');
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {...options, signal: controller.signal});
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getMessages = async (
  senderId: number,
  receiverId: string | number,
): Promise<ApiMessage[]> => {
  const url = `${BASE_URL}/get_messages`;
  console.log('📞 getMessages:', {senderId, receiverId});

  try {
    const formData = new FormData();
    formData.append('sender_id', String(senderId));
    formData.append('reciver_id', String(receiverId));

    const res = await fetchWithTimeout(url, {
      method: 'POST',
      body: formData,
      headers: {Accept: 'application/json'},
    });

    const text = await res.text();
    console.log('📞 getMessages status:', res.status);

    const json = JSON.parse(text);

    if (json?.status === true && Array.isArray(json.data)) {
      console.log(`✅ getMessages SUCCESS — ${json.data.length} messages`);
      return json.data;
    }
    return [];
  } catch (e: any) {
    console.error('❌ getMessages failed:', e?.message);
    return [];
  }
};

export const sendMessage = async (
  senderId: string | number,
  receiverId: string | number,
  msg: string,
): Promise<ApiMessage | null> => {
  const url = `${BASE_URL}/send_message`;
  console.log('📤 sendMessage:', {senderId, receiverId, msg});

  try {
    const formData = new FormData();
    formData.append('sender_id', String(senderId));
    formData.append('reciver_id', String(receiverId));
    formData.append('msg', msg);
    formData.append('sender_type', 'consumer');
    formData.append('rec_type', 'police');

    const res = await fetchWithTimeout(url, {
      method: 'POST',
      body: formData,
      headers: {Accept: 'application/json'},
    });

    const text = await res.text();
    console.log('📤 sendMessage status:', res.status);

    const json = JSON.parse(text);

    if (json?.status === true && json.data) {
      console.log('✅ sendMessage SUCCESS');
      return json.data;
    }
    return null;
  } catch (e: any) {
    console.error('❌ sendMessage failed:', e?.message);
    return null;
  }
};