import {Platform, PermissionsAndroid} from 'react-native';
import {
  getMessaging,
  getToken,
  onMessage,
  requestPermission,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';

let navigationRef: any = null;

export const setNavigationRef = (ref: any) => {
  navigationRef = ref;
  console.log('✅ navigationRef set');
};

// ═══════════════════════════════════════════════════════════
// GLOBAL EVENT SYSTEM
// ═══════════════════════════════════════════════════════════
type Listener = (data: any) => void;
let listeners: Listener[] = [];

export const onNewMessage = (callback: Listener) => {
  listeners.push(callback);
  console.log('📡 Listener added, total:', listeners.length);

  return () => {
    listeners = listeners.filter(l => l !== callback);
    console.log('🔕 Listener removed, total:', listeners.length);
  };
};

const emitNewMessage = (data: any) => {
  console.log('📢 Emitting new message to', listeners.length, 'listeners');
  console.log('   data:', JSON.stringify(data, null, 2));

  listeners.forEach(listener => {
    try {
      listener(data);
    } catch (e) {
      console.error('❌ Listener error:', e);
    }
  });
};

// ✅ Notification tap se Message screen pe navigate
const goToMessage = (data: any) => {
  if (!data) return;

  // ✅ Pehle listeners ko notify karo
  emitNewMessage(data);

  const params = {
    senderId: String(data.sender_id || ''),
    senderName: data.sender_name || 'Police Station',
    senderType: data.sender_type || 'police',
    notificationMessage: data.message || '',
    notificationMessageId: data.message_id || '',
    notificationCreatedAt: data.created_at || '',
  };

  console.log('🚀 Navigating to Message:', params);

  const tryNavigate = (attempt = 0) => {
    if (navigationRef && navigationRef.isReady && navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute?.();
      const currentScreenName = currentRoute?.name;

      if (currentScreenName === 'Message') {
        console.log('⏭️ Already on Message screen, skipping navigation');
        return;
      }

      navigationRef.navigate('Message', params);
      console.log('✅ Navigated');
    } else if (attempt < 20) {
      setTimeout(() => tryNavigate(attempt + 1), 500);
    }
  };

  tryNavigate();
};

// ✅ Local notification — sirf background/killed ke liye use hoga
export const displayLocalNotification = async (remoteMessage: any) => {
  try {
    const channelId = await notifee.createChannel({
      id: 'default_channel',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    const title =
      remoteMessage?.notification?.title ||
      remoteMessage?.data?.title ||
      'New Message';

    const body =
      remoteMessage?.notification?.body ||
      remoteMessage?.data?.message ||
      'New message';

    await notifee.displayNotification({
      title,
      body,
      data: remoteMessage?.data || {},
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {id: 'default'},
        smallIcon: 'ic_notification',
      },
    });
  } catch (error) {
    console.error('❌ Display Notification Error:', error);
  }
};

export const setupNotifications = () => {
  let unsubscribeForeground: (() => void) | undefined;
  let unsubscribeNotificationPress: (() => void) | undefined;

  const init = async () => {
    try {
      console.log('🔔 Notification setup started...');

      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      const messagingInstance = getMessaging();
      await requestPermission(messagingInstance);
      const token = await getToken(messagingInstance);
      console.log('🔥 FCM TOKEN:', token);

      // ✅ 1. FOREGROUND — sirf emit karo, notification bar mein MAT dikhao
      unsubscribeForeground = onMessage(
        messagingInstance,
        async remoteMessage => {
          console.log('════════════════════════════════════════');
          console.log('📩 FOREGROUND FCM');
          console.log('   data:', JSON.stringify(remoteMessage.data, null, 2));
          console.log('════════════════════════════════════════');

          // ✅ Sirf emit — Message screen append karega
          if (remoteMessage?.data) {
            emitNewMessage(remoteMessage.data);
          }

          // ❌ NO displayLocalNotification here
        },
      );

      // ✅ 2. Foreground notification tap (agar pehle se notification tray mein thi)
      unsubscribeNotificationPress = notifee.onForegroundEvent(
        ({type, detail}) => {
          if (type === EventType.PRESS) {
            console.log('🔔 FOREGROUND TAP');
            goToMessage(detail.notification?.data);
          }
        },
      );

      // ✅ 3. Background notification tap
      notifee.onBackgroundEvent(async ({type, detail}) => {
        if (type === EventType.PRESS) {
          console.log('🔔 BACKGROUND TAP');
          goToMessage(detail.notification?.data);
        }
      });

      // ✅ 4. App opened from background
      onNotificationOpenedApp(messagingInstance, remoteMessage => {
        console.log('🚀 APP OPENED FROM BACKGROUND');
        goToMessage(remoteMessage.data);
      });

      // ✅ 5. App opened from killed
      const initialNotification = await getInitialNotification(
        messagingInstance,
      );
      if (initialNotification) {
        console.log('🚀 KILLED STATE');
        setTimeout(() => goToMessage(initialNotification.data), 1500);
      }

      console.log('✅ Notification setup completed');
    } catch (error) {
      console.error('❌ Notification Setup Error:', error);
    }
  };

  init();

  return () => {
    if (unsubscribeForeground) unsubscribeForeground();
    if (unsubscribeNotificationPress) unsubscribeNotificationPress();
  };
};