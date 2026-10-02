import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import AppColors from '../constants/colors';
import CustomAppBar from '../components/CustomAppBar';
import { helpApi } from '../api/helpApi';
import { useAuth } from '../context/AuthContext';
import { MyHelpItem } from '../types';

export const MyHelpsView = ({ navigation }: any) => {
  const { userId } = useAuth();
  const [helpList, setHelpList] = useState<MyHelpItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHelps();
  }, [userId]);

  const loadHelps = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await helpApi.fetchMyHelpList(String(userId));
      if (res && res.data) {
        setHelpList(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Returns visual config (label, colors, icon) for a given status.
   */
  const getStatusConfig = (status: string) => {
    switch (status) {
      case '0':
        return {
          label: 'Pending',
          color: '#F59E0B',
          bg: '#FEF3C7',
          accent: '#F59E0B',
          icon: 'hourglass-half', // FontAwesome
          iconLib: 'fa' as const,
        };
      case '1':
        return {
          label: 'Accepted',
          color: '#16A34A',
          bg: '#DCFCE7',
          accent: '#16A34A',
          icon: 'check-circle',
          iconLib: 'fa' as const,
        };
      case '3':
        return {
          label: 'Solved',
          color: '#2563EB',
          bg: '#DBEAFE',
          accent: '#2563EB',
          icon: 'check',
          iconLib: 'fa' as const,
        };
      default:
        return {
          label: 'Rejected',
          color: '#DC2626',
          bg: '#FEE2E2',
          accent: '#DC2626',
          icon: 'times-circle',
          iconLib: 'fa' as const,
        };
    }
  };

  const renderHelpItem = ({ item }: { item: MyHelpItem }) => {
    const hasAudio =
      item.having_voice_file && String(item.having_voice_file) !== '0';
    const status = String(item.is_accept);
    const cfg = getStatusConfig(status);

    const StatusIcon =
      cfg.iconLib === 'fa5' ? FontAwesome5 : FontAwesome;

    return (
      <View style={[styles.card, { borderLeftColor: cfg.accent }]}>
        {/* Header Row: type + status badge */}
        <View style={styles.cardHeader}>
          <Text style={styles.helpType} numberOfLines={1}>
            {item.help_type || 'Help Request'}
          </Text>

          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <StatusIcon
              name={cfg.icon as any}
              size={11}
              color={cfg.color}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.badgeText, { color: cfg.color }]}>
              {cfg.label}
            </Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.dateRow}>
          <FontAwesome
            name="calendar-o"
            size={12}
            color="#64748B"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.dateText}>
            {item.date || item.created_at || '—'}
          </Text>
        </View>

        {/* Audio play button (if any) */}
        {hasAudio ? (
          <TouchableOpacity
            style={styles.audioBtn}
            onPress={() =>
              navigation.navigate('AudioPlay', {
                audioUrl: item.having_voice_file,
              })
            }
            activeOpacity={0.8}>
            <View style={styles.audioCircle}>
              <FontAwesome
                name="play"
                size={12}
                color="#FFFFFF"
                style={{ marginLeft: 2 }}
              />
            </View>
            <Text style={styles.audioLabel}>Play Voice Note</Text>
            <FontAwesome
              name="chevron-right"
              size={11}
              color="#1D4ED8"
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
        ) : null}

        {/* Officer info row (Accepted / Solved) */}
        {(status === '1' || status === '3') && item.perfomed_by ? (
          <View style={styles.officerRow}>
            <View style={styles.officerIconWrap}>
              <FontAwesome5
                name="user-shield"
                size={12}
                color={AppColors.themeColor}
              />
            </View>
            <Text style={styles.officerText}>
              <Text style={styles.officerLabel}>
                {status === '1' ? 'Accepted By: ' : 'Solved By: '}
              </Text>
              {item.perfomed_by}
            </Text>
          </View>
        ) : null}

        {/* Rejected block */}
        {status !== '0' && status !== '1' && status !== '3' ? (
          <View style={styles.rejectedBox}>
            {item.perfomed_by ? (
              <View style={styles.officerRow}>
                <View
                  style={[styles.officerIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <FontAwesome5
                    name="user-shield"
                    size={12}
                    color="#DC2626"
                  />
                </View>
                <Text style={styles.officerText}>
                  <Text style={styles.officerLabel}>Rejected By: </Text>
                  {item.perfomed_by}
                </Text>
              </View>
            ) : null}
            {item.note ? (
              <View style={styles.reasonRow}>
                <FontAwesome
                  name="info-circle"
                  size={12}
                  color="#991B1B"
                  style={{ marginRight: 6, marginTop: 2 }}
                />
                <Text style={styles.rejectedReason}>
                  <Text style={styles.rejectedReasonLabel}>Reason: </Text>
                  {item.note}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomAppBar title="My Help List" onBackPress={() => navigation.goBack()} />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={AppColors.themeColor} />
            <Text style={styles.loadingText}>Loading your requests…</Text>
          </View>
        ) : helpList.length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={styles.emptyIconWrap}>
              <FontAwesome
                name="inbox"
                size={38}
                color={AppColors.themeColor}
              />
            </View>
            <Text style={styles.emptyTitle}>No Requests Yet</Text>
            <Text style={styles.emptySubtext}>
              Your help requests will appear here once you submit them.
            </Text>
          </View>
        ) : (
          <FlatList
            data={helpList}
            keyExtractor={(item, index) => String(item.id || index)}
            renderItem={renderHelpItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  /* ---------- EMPTY STATE ---------- */
  emptyIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },

  /* ---------- LIST ---------- */
  listContent: {
    padding: 14,
    paddingBottom: 30,
  },

  /* ---------- CARD ---------- */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#CBD5E1',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  helpType: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },

  /* ---------- STATUS BADGE ---------- */
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  /* ---------- DATE ---------- */
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  /* ---------- AUDIO ---------- */
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 6,
  },
  audioCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  audioLabel: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '700',
  },

  /* ---------- OFFICER ROW ---------- */
  officerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  officerIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  officerText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },
  officerLabel: {
    fontWeight: '700',
    color: '#0F172A',
  },

  /* ---------- REJECTED BOX ---------- */
  rejectedBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  rejectedReason: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 19,
    flex: 1,
  },
  rejectedReasonLabel: {
    fontWeight: '800',
    color: '#991B1B',
  },
});

export default MyHelpsView;