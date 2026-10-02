import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  BackHandler,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppColors from '../constants/colors';
import {useAuth} from '../context/AuthContext';
import {getMessages, sendMessage, ApiMessage} from '../api/chatApi';
import {onNewMessage} from '../services/notificationService';   // ✅ Event listener

interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'station';
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

const formatTime = (dateStr?: string) => {
  if (!dateStr) {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  const d = new Date(dateStr.replace(' ', 'T'));
  return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
};

const mapApiMessage = (m: ApiMessage, myUserId: string): ChatMessage => {
  const isMe = String(m.sender_id) === String(myUserId);
  return {
    id: String(m.id),
    text: m.msg,
    sender: isMe ? 'me' : 'station',
    time: formatTime(m.created_at),
    status: 'read',
  };
};

export const MessageScreen = ({navigation, route}: any) => {
  console.log('🟢 MessageScreen MOUNTED');
  console.log('   route.params:', JSON.stringify(route?.params, null, 2));

  const {userId, userData} = useAuth();

  const receiverId =
    route?.params?.senderId ||
    String(userData?.police_station_id ?? userData?.policeStationId ?? '');

  const stationName =
    route?.params?.senderName || receiverId || 'Police Station';

  const notificationMessage = route?.params?.notificationMessage;
  const notificationMessageId = route?.params?.notificationMessageId;
  const notificationCreatedAt = route?.params?.notificationCreatedAt;

  console.log('🟢 userId:', userId);
  console.log('🟢 receiverId:', receiverId);
  console.log('🟢 notificationMessage:', notificationMessage);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const listRef = useRef<FlatList<ChatMessage>>(null);
  const appendedRef = useRef(false);

  const goHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('Home');
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  // ---------- LOAD FROM API ----------
  useEffect(() => {
    console.log('🔥 useEffect [load messages]');

    if (!userId || !receiverId) {
      console.log('❌ Missing userId or receiverId');
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const apiMsgs = await getMessages(userId, receiverId);

        if (!mounted) return;

        const mapped = (apiMsgs || []).map(m =>
          mapApiMessage(m, String(userId)),
        );

        console.log(`✅ Loaded ${mapped.length} messages`);
        setMessages(mapped);
        scrollToBottom();
      } catch (e) {
        console.error('❌ Load failed:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [userId, receiverId]);

  // ═══════════════════════════════════════════════════════════
  // ✅ LIVE LISTENER — jab bhi naya notification aaye, append karo
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    console.log('🔥 useEffect [LIVE listener]');

    const unsubscribe = onNewMessage((data: any) => {
      console.log('📨 LIVE message received in Message screen');
      console.log('   data:', JSON.stringify(data, null, 2));

      // ✅ Check karo ye message is conversation ka hai
      // if (
      //   data.sender_id &&
      //   receiverId &&
      //   String(data.sender_id) !== String(receiverId)
      // ) {
      //   console.log('⏭️ Not for this conversation, skipping');
      //   return;
      // }

      // ✅ Skip own messages
      if (String(data.sender_id) === String(userId)) {
        console.log('⏭️ Own message, skipping');
        return;
      }

      const msgId = data.message_id
        ? String(data.message_id)
        : `live-${Date.now()}`;

      // ✅ Duplicate check + append
      setMessages(prev => {
        const exists = prev.some(
          m =>
            m.id === msgId ||
            (m.text === data.message && m.sender === 'station'),
        );

        // if (exists) {
        //   console.log('⏭️ Duplicate, skipping');
        //   return prev;
        // }

        const newMsg: ChatMessage = {
          id: msgId,
          text: data.message || '',
          sender: 'station',
          time: formatTime(data.created_at),
          status: 'read',
        };

        console.log('✅ LIVE APPEND:', newMsg);
        return [...prev, newMsg];
      });

      scrollToBottom();
    });

    return () => {
      console.log('🧹 Removing LIVE listener');
      unsubscribe();
    };
  }, [userId, receiverId]);

  // ---------- APPEND FROM ROUTE PARAMS (notification tap) ----------
  useEffect(() => {
    console.log('🔥 useEffect [append from route]');

    if (!notificationMessage) return;
    if (appendedRef.current) return;
    if (loading) return;

    const exists = messages.some(
      m =>
        m.id === String(notificationMessageId) ||
        (m.text === notificationMessage && m.sender === 'station'),
    );

    if (exists) {
      console.log('⏭️ Already exists (route)');
      appendedRef.current = true;
      return;
    }

    const notifMsg: ChatMessage = {
      id: notificationMessageId
        ? String(notificationMessageId)
        : `notif-${Date.now()}`,
      text: notificationMessage,
      sender: 'station',
      time: formatTime(notificationCreatedAt),
      status: 'read',
    };

    console.log('📨 APPENDING (route):', notifMsg);
    setMessages(prev => [...prev, notifMsg]);
    appendedRef.current = true;
    scrollToBottom();
  }, [
    notificationMessage,
    notificationMessageId,
    notificationCreatedAt,
    loading,
    messages,
  ]);

  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({animated: true});
    }, 150);
  };

  // ---------- SEND ----------
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !userId || !receiverId) return;

    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'sent',
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');
    Keyboard.dismiss();
    scrollToBottom();

    try {
      setSending(true);
      const res = await sendMessage(userId, receiverId, text);
      if (res) {
        setMessages(prev =>
          prev.map(m =>
            m.id === tempId
              ? {...m, id: String(res.id), status: 'delivered'}
              : m,
          ),
        );
      }
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({item}: {item: ChatMessage}) => {
    const isMe = item.sender === 'me';
    return (
      <View
        style={[
          styles.bubbleRow,
          {justifyContent: isMe ? 'flex-end' : 'flex-start'},
        ]}>
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleStation,
          ]}>
          <Text
            style={[
              styles.bubbleText,
              isMe ? styles.bubbleTextMe : styles.bubbleTextStation,
            ]}>
            {item.text}
          </Text>
          <View style={styles.bubbleMetaRow}>
            <Text
              style={[
                styles.bubbleTime,
                isMe ? styles.timeMe : styles.timeStation,
              ]}>
              {item.time}
            </Text>
            {isMe && (
              <Text style={styles.tick}>
                {item.status === 'sent' ? '✓' : '✓✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={AppColors.themeColor}
        />
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.backBtn} onPress={goHome}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.appBarCenter}>
            <Text style={styles.appBarTitle}>{stationName}</Text>
          </View>
          <View style={{width: 40}} />
        </View>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={AppColors.themeColor} />
          <Text style={styles.loadingText}>Loading session…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={AppColors.themeColor}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        enabled>
        <View style={styles.appBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={goHome}
            activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.appBarCenter}>
            <Text style={styles.appBarTitle} numberOfLines={1}>
              {stationName}
            </Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.appBarSubtitle}>Online</Text>
            </View>
          </View>
          <View style={{width: 40}} />
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={AppColors.themeColor} />
            <Text style={styles.loadingText}>Loading messages…</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={Keyboard.dismiss}
            onContentSizeChange={scrollToBottom}
            ListEmptyComponent={
              <View style={styles.centerBox}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start the conversation by typing below.
                </Text>
              </View>
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
            activeOpacity={0.8}>
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F1F5F9'},
  flex: {flex: 1},

  appBar: {
    height: 60,
    backgroundColor: AppColors.themeColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 6,
  },
  backBtn: {padding: 6, width: 40},
  backIcon: {fontSize: 22, color: AppColors.white, fontWeight: '700'},
  appBarCenter: {alignItems: 'center', flex: 1, paddingHorizontal: 8},
  appBarTitle: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '800',
    maxWidth: '100%',
    textAlign: 'center',
  },
  statusRow: {flexDirection: 'row', alignItems: 'center', marginTop: 2},
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
    marginRight: 5,
  },
  appBarSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '500',
  },

  listContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
    flexGrow: 1,
  },

  bubbleRow: {flexDirection: 'row', marginBottom: 10},
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: AppColors.themeColor,
    borderTopRightRadius: 4,
  },
  bubbleStation: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubbleText: {fontSize: 14, lineHeight: 20},
  bubbleTextMe: {color: '#FFFFFF'},
  bubbleTextStation: {color: '#0F172A'},
  bubbleMetaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  bubbleTime: {fontSize: 10, fontWeight: '500'},
  timeMe: {color: 'rgba(255,255,255,0.75)'},
  timeStation: {color: '#94A3B8'},
  tick: {fontSize: 11, color: '#BAE6FD', marginLeft: 4, fontWeight: '700'},

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    fontSize: 14,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {backgroundColor: '#CBD5E1'},
  sendIcon: {color: '#FFFFFF', fontSize: 18, fontWeight: '800'},

  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyIcon: {fontSize: 54, marginBottom: 12},
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
});

export default MessageScreen;