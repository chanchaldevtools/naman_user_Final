import Pusher from 'pusher-js';
import API_CONFIG from '../api/apiConfig';

// ✅ Handle module wrapping
const PusherClient: any =
  (Pusher as any)?.default || (Pusher as any)?.Pusher || Pusher;

let pusher: any = null;

export const getPusher = () => {
  if (!pusher) {
    console.log('════════════════════════════════════════');
    console.log('🔌 Creating Pusher client...');

    try {
      pusher = new PusherClient(API_CONFIG.PUSHER_KEY, {
        cluster: API_CONFIG.PUSHER_CLUSTER,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
      });

      pusher.connection.bind('state_change', (states: any) => {
        console.log('🔌 Pusher state:', states.previous, '→', states.current);
      });

      pusher.connection.bind('connected', () => {
        console.log('✅✅✅ Pusher CONNECTED');
      });

      pusher.connection.bind('disconnected', () => {
        console.log('❌ Pusher DISCONNECTED');
      });

      pusher.connection.bind('error', (err: any) => {
        console.error('❌ Pusher ERROR:', JSON.stringify(err, null, 2));
      });

      console.log('✅ Pusher instance created');
    } catch (e: any) {
      console.error('❌ Pusher init failed:', e?.message);
      return null;
    }
  }
  return pusher;
};

export const subscribeToChat = (
  userId: string | number,
  onMessage: (data: any) => void,
) => {
  const client = getPusher();

  if (!client) {
    console.warn('⚠️ Pusher client not available');
    return () => {};
  }

  // ⚠️ IMPORTANT: Ye channel name backend se match karo
  // Public channel:  chat.353
  // Private channel: private-chat.353
  const channelName = `chat.${userId}`;

  console.log('════════════════════════════════════════');
  console.log('📡 Subscribing to channel:', channelName);
  console.log('════════════════════════════════════════');

  const channel = client.subscribe(channelName);

  channel.bind('pusher:subscription_succeeded', () => {
    console.log('✅✅✅ SUBSCRIBED to:', channelName);
  });

  channel.bind('pusher:subscription_error', (err: any) => {
    console.error('❌ Subscription ERROR:', JSON.stringify(err, null, 2));
  });

  // ✅ GLOBAL listener — har event catch karega (DEBUG)
  channel.bind_global((eventName: string, data: any) => {
    console.log('📨📨📨 PUSHER EVENT RECEIVED');
    console.log('   channel :', channelName);
    console.log('   event   :', eventName);
    console.log('   data    :', JSON.stringify(data, null, 2));
  });

  // ✅ Common event names bind karo
  const handler = (data: any) => {
    console.log('✅ Handler fired');
    onMessage(data);
  };

  channel.bind('message', handler);
  channel.bind('new-message', handler);
  channel.bind('MessageSent', handler);
  channel.bind('App\\Events\\MessageSent', handler);

  return () => {
    console.log('🔕 Unsubscribing:', channelName);
    channel.unbind_all();
    client.unsubscribe(channelName);
  };
};

export const disconnectPusher = () => {
  if (pusher) {
    pusher.disconnect();
    pusher = null;
    console.log('🔕 Pusher disconnected');
  }
};