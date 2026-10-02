import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppColors from '../constants/colors';
import CustomAppBar from '../components/CustomAppBar';
import { visitApi } from '../api/visitApi';
import { useAuth } from '../context/AuthContext';
import { VisitItem } from '../types';

export const VisitView = ({ navigation }: any) => {
  const { userId, userData } = useAuth();
  const [visitList, setVisitList] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisits();
  }, [userId, userData?.policeStationId]);

  const loadVisits = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await visitApi.fetchAllVisitList(
        String(userData?.policeStationId || '1'),
        String(userId)
      );
      if (res && res.data) {
        setVisitList(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderVisitCard = ({ item }: { item: VisitItem }) => {
    return (
      <View style={styles.card}>
        {/* User Info Header */}
        <View style={styles.personRow}>
          {item.photo ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ImageDetails', {
                  imageUrl: item.photo,
                  title: `${item.fristName || ''} ${item.lastName || ''}`,
                })
              }
              activeOpacity={0.8}>
              <Image source={{ uri: item.photo }} style={styles.avatar} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderIcon}>👤</Text>
            </View>
          )}

          <View style={styles.personDetails}>
            <Text style={styles.personName}>
              {item.fristName || ''} {item.lastName || ''}
            </Text>
            <Text style={styles.mobileText}>Mobile: {item.mobileNumber || ''}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Issue / Performed by */}
        {item.perfomedBy ? (
          <Text style={styles.issueText}>Issue: {item.perfomedBy}</Text>
        ) : null}

        {/* Address Details */}
        <Text style={styles.subHeader}>Address Details</Text>
        <Text style={styles.addressLine}>Mobile: {item.mobileNumber || ''}</Text>
        <Text style={styles.addressLine}>House: {item.houseNo || ''}</Text>
        <Text style={styles.addressLine}>
          {item.city || ''}, {item.pincode || ''}
        </Text>

        <View style={styles.divider} />

        {/* Visiting Officer Details */}
        <Text style={styles.subHeader}>Visiting Details</Text>
        <View style={styles.officerRow}>
          {item.image ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ImageDetails', {
                  imageUrl: item.image,
                  title: `By ${item.perfomedBy || 'Officer'}`,
                })
              }
              activeOpacity={0.8}>
              <Image source={{ uri: item.image }} style={styles.avatar} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderIcon}>👮</Text>
            </View>
          )}

          <View style={styles.officerDetails}>
            {item.perfomedBy ? (
              <Text style={styles.officerName}>By {item.perfomedBy}</Text>
            ) : null}
            <Text style={styles.policeStation}>{item.policeStationId || ''}</Text>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.commentText}>Comment: {item.description}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomAppBar title="My Visit Records" onBackPress={() => navigation.goBack()} />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={AppColors.themeColor} />
            <Text style={styles.loadingText}>Loading..</Text>
          </View>
        ) : visitList.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No visit available</Text>
          </View>
        ) : (
          <FlatList
            data={visitList}
            keyExtractor={(item, index) => String(item.id || index)}
            renderItem={renderVisitCard}
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
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: AppColors.themeColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderIcon: {
    fontSize: 24,
  },
  personDetails: {
    flex: 1,
    marginLeft: 12,
  },
  personName: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.black,
  },
  mobileText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#D1D5DB',
    marginVertical: 10,
  },
  issueText: {
    fontSize: 13,
    color: AppColors.black,
    marginBottom: 6,
  },
  subHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.black,
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 12,
    color: '#4B5563',
    marginVertical: 1,
  },
  officerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  officerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  officerName: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.black,
  },
  policeStation: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  commentText: {
    fontSize: 12,
    color: AppColors.black,
    marginTop: 10,
  },
});

export default VisitView;
