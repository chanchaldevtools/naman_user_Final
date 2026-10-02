import { useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';

export const displayNotification = async (remoteMessage: any) => {
  try {
    const channelId = await notifee.createChannel({
      id: 'default_channel',
      name: 'Notifications',
    });

    await notifee.displayNotification({
      title: remoteMessage.notification?.title || remoteMessage.data?.title || 'Notification',
      body: remoteMessage.notification?.body || remoteMessage.data?.body || '',
      android: {
        channelId,
        pressAction: { id: 'default' },
      },
    });
  } catch (error) {
    console.error('Error displaying notification:', error);
  }
};

export const useNotifications = (isLoggedIn: boolean) => {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const authStatus = await messaging().requestPermission();
          return (
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
          );
        }
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    };

    const getFcmToken = async () => {
      try {
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        console.log('--- YOUR FCM TOKEN ---');
        console.log(token);
        return token;
      } catch (error) {
        console.error('Error fetching FCM token:', error);
        return null;
      }
    };

    if (isLoggedIn) {
      requestPermission().then(hasPermission => {
        if (hasPermission) getFcmToken();
      });
    }

    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      await displayNotification(remoteMessage);
    });

    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
      console.log('--- REFRESHED FCM TOKEN ---');
      console.log(token);
    });

    const unsubscribeNotifeeEvent = notifee.onForegroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('Notification Pressed:', detail.notification);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
      unsubscribeNotifeeEvent();
    };
  }, [isLoggedIn]);
};