import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import AppColors from '../constants/colors';
import buttonStyles from '../constants/buttonStyles';
import CustomAppBar from '../components/CustomAppBar';
import { useAuth } from '../context/AuthContext';

export const ProfileView = ({ navigation }: any) => {
  const { userData } = useAuth();

  useEffect(() => {
    // Debug — check Metro logs when opening the profile
    console.log('👤 Profile userData:', JSON.stringify(userData, null, 2));
  }, [userData]);

  /**
   * Safely read a value from userData supporting BOTH
   * camelCase and snake_case keys.
   */
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = (userData as any)?.[k];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return '';
  };

  const handleOpenPhoto = () => {
    const photo = pick('photo');
    if (photo) {
      navigation.navigate('ImageDetails', {
        imageUrl: photo,
        title: 'Image Preview',
      });
    }
  };

  /**
   * Compact info row: label on left (with FA icon), value on right.
   */
  const renderField = (
    label: string,
    value: any,
    iconName: string,
    iconLib: 'fa' | 'fa5' | 'mi' = 'fa',
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === 'null'
    ) {
      return null;
    }

    const IconComponent =
      iconLib === 'fa5'
        ? FontAwesome5
        : iconLib === 'mi'
        ? MaterialIcons
        : FontAwesome;

    return (
      <View style={styles.fieldRow}>
        <View style={styles.fieldLeft}>
          <View style={styles.fieldIconWrap}>
            <IconComponent
              name={iconName as any}
              size={13}
              color={AppColors.themeColor}
            />
          </View>
          <Text style={styles.fieldLabel}>{label}</Text>
        </View>
        <Text style={styles.fieldValue} numberOfLines={2}>
          {String(value)}
        </Text>
      </View>
    );
  };

  // ✅ Read BOTH spellings
  const firstName = pick('fristName', 'frist_name', 'firstName');
  const lastName = pick('lastName', 'last_name');
  const fullName = `${firstName} ${lastName}`.trim();

  const mobileNumber = pick('mobileNumber', 'mobile_number');
  const bloodGroup = pick('bloodGroup', 'blood_group');
  const isHandicapedRaw = pick('isHandicaped', 'is_handicaped');
  const desisDesc = pick('desisDesc', 'desis_desc');
  const coName = pick('coName', 'co_name');
  const coContactNumber = pick('coContactNumber', 'co_contact_number');
  const houseNo = pick('houseNo', 'house_no');
  const city = pick('city');
  const pincode = pick('pincode');
  const state = pick('state');
  const createdAt = pick('createdAt', 'created_at');
  const dob = pick('dob');
  const age = pick('age');
  const gender = pick('gender');
  const photo = pick('photo');

  const isHandicapped =
    String(isHandicapedRaw).toLowerCase() === 'true' ||
    String(isHandicapedRaw) === '1';

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomAppBar title="Profile" onBackPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ================= HERO HEADER ================= */}
        <View style={styles.heroCard}>
          <TouchableOpacity onPress={handleOpenPhoto} activeOpacity={0.85}>
            <View style={styles.avatarRing}>
              {photo ? (
                <Image
                  source={{ uri: photo }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <FontAwesome name="user" size={44} color={AppColors.themeColor} />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{fullName || 'User'}</Text>

          {mobileNumber ? (
            <View style={styles.mobileChip}>
              <FontAwesome
                name="mobile"
                size={13}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.userMobile}>{String(mobileNumber)}</Text>
            </View>
          ) : null}

          {photo ? (
            <Text style={styles.tapHint}>Tap photo to preview</Text>
          ) : null}
        </View>

        {/* ================= PERSONAL DETAILS ================= */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.headerIconWrap, { backgroundColor: '#E0F2FE' }]}>
              <FontAwesome
                name="user-circle"
                size={16}
                color={AppColors.themeColor}
              />
            </View>
            <Text style={styles.sectionHeader}>Personal Details</Text>
          </View>

          {renderField('Full Name', fullName, 'user')}
          {renderField('Mobile', mobileNumber, 'phone')}
          {renderField('Gender', gender, 'venus-mars')}
          {renderField('Blood Group', bloodGroup, 'tint')}
          {renderField('Date of Birth', dob, 'birthday-cake')}
          {renderField('Age', age, 'hourglass-half')}

          {/* Handicapped — special chip row */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLeft}>
              <View style={styles.fieldIconWrap}>
                <FontAwesome5
                  name="wheelchair"
                  size={12}
                  color={AppColors.themeColor}
                />
              </View>
              <Text style={styles.fieldLabel}>Handicapped</Text>
            </View>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: isHandicapped ? '#FEE2E2' : '#DCFCE7',
                },
              ]}>
              <FontAwesome
                name={isHandicapped ? 'times-circle' : 'check-circle'}
                size={11}
                color={isHandicapped ? '#DC2626' : '#16A34A'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isHandicapped ? '#DC2626' : '#16A34A' },
                ]}>
                {isHandicapped ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>

          {renderField('Issue', desisDesc, 'exclamation-triangle')}

          {/* C/O subsection */}
          {(coName || coContactNumber) && (
            <>
              <View style={styles.subDivider} />
              <Text style={styles.subSectionLabel}>Care Of (C/O)</Text>
              {renderField('Name', coName, 'user-friends')}
              {renderField('Number', coContactNumber, 'phone-square')}
            </>
          )}
        </View>

        {/* ================= ADDRESS DETAILS ================= */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.headerIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <FontAwesome name="map-marker" size={16} color="#16A34A" />
            </View>
            <Text style={styles.sectionHeader}>Address Details</Text>
          </View>

          {renderField('House / Street', houseNo, 'home')}
          {renderField('City', city, 'building')}
          {renderField('Pincode', pincode, 'map-pin')}
          {renderField('State', state, 'map')}
          {renderField('Member Since', createdAt, 'calendar')}
        </View>

        <View style={{ height: 16 }} />

        {/* ================= BACK BUTTON ================= */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}>
          <FontAwesome
            name="arrow-left"
            size={15}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.backBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  scrollContent: {
    padding: 14,
    alignItems: 'center',
    paddingBottom: 40,
  },

  /* ================= HERO ================= */
  heroCard: {
    width: '100%',
    backgroundColor: AppColors.themeColor,
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: AppColors.themeColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 16,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 14,
    letterSpacing: 0.3,
  },
  mobileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
  },
  userMobile: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    fontStyle: 'italic',
  },

  /* ================= CARDS ================= */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },

  /* ================= FIELD ROWS ================= */
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  fieldIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
    maxWidth: '55%',
    textAlign: 'right',
  },

  /* ================= CHIP ================= */
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* ================= SUB SECTION ================= */
  subDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  subSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  /* ================= BACK BUTTON ================= */
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: AppColors.themeColor,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: AppColors.themeColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default ProfileView;