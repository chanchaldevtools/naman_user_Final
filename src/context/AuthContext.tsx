import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData } from '../types';

interface AuthContextType {
  userId: string | null;
  userData: Partial<UserData> | null;
  isLoading: boolean;
  saveUserSession: (data: UserData) => Promise<void>;
  updateIsAccept: (isAccept: string | number) => Promise<void>;
  logout: () => Promise<void>;
  reloadSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  userData: null,
  isLoading: true,
  saveUserSession: async () => {},
  updateIsAccept: async () => {},
  logout: async () => {},
  reloadSession: async () => {},
});

export const STORAGE_KEYS = {
  USER_ID: 'userId',
  AUTH_TOKEN: 'auth_token',
  FIRST_NAME: 'frist_name',
  LAST_NAME: 'last_name',
  MOBILE_NUMBER: 'mobile_number',
  GENDER: 'gender',
  BLOOD_GROUP: 'blood_group',
  DOB: 'dob',
  AGE: 'age',
  IS_HANDICAPED: 'is_handicaped',
  DESIS_DESC: 'desis_desc',
  MARITUAL_STATUS: 'maritual_status',
  ANY_DISABLITY: 'any_disablity',
  HAS_MEDICLAIM: 'has_mediclaim',
  PHOTO: 'photo',
  HOUSE_NO: 'house_no',
  CITY: 'city',
  PINCODE: 'pincode',
  POLICE_STATION_ID: 'police_station_id',
  COUNTRY: 'country',
  STATE: 'state',
  IS_ACCEPT: 'is_accept',
  CREATED_AT: 'created_at',
  CO_NAME: 'co_name',
  CO_CONTACT_NUMBER: 'co_contact_number',
  VERSION: 'v',
} as const;

/**
 * Safely read a value from a raw object supporting BOTH
 * camelCase and snake_case keys.
 */
const pick = (obj: any, ...keys: string[]) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== '') {
      return obj[k];
    }
  }
  return '';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<Partial<UserData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!storedUserId) {
        setUserId(null);
        setUserData(null);
        return;
      }

      setUserId(storedUserId);

      const keys = Object.values(STORAGE_KEYS);
      const values = await Promise.all(keys.map(k => AsyncStorage.getItem(k)));

      const u: Record<string, string | null> = {};
      keys.forEach((key, idx) => {
        u[key] = values[idx];
      });

      // Debug — check Metro logs on app restart
      console.log('🔐 Loaded session from storage:', u);

      setUserData({
        id: Number(storedUserId),
        authToken: u[STORAGE_KEYS.AUTH_TOKEN] || '',

        // ✅ Set BOTH spellings so any consumer works
        fristName: u[STORAGE_KEYS.FIRST_NAME] || '',
        frist_name: u[STORAGE_KEYS.FIRST_NAME] || '',
        lastName: u[STORAGE_KEYS.LAST_NAME] || '',
        last_name: u[STORAGE_KEYS.LAST_NAME] || '',

        mobileNumber: u[STORAGE_KEYS.MOBILE_NUMBER] || '',
        gender: u[STORAGE_KEYS.GENDER] || '',
        bloodGroup: u[STORAGE_KEYS.BLOOD_GROUP] || '',
        blood_group: u[STORAGE_KEYS.BLOOD_GROUP] || '',
        dob: u[STORAGE_KEYS.DOB] || '',
        age: u[STORAGE_KEYS.AGE] ? Number(u[STORAGE_KEYS.AGE]) : undefined,

        isHandicaped: u[STORAGE_KEYS.IS_HANDICAPED] || '',
        is_handicaped: u[STORAGE_KEYS.IS_HANDICAPED] || '',
        desisDesc: u[STORAGE_KEYS.DESIS_DESC] || '',
        desis_desc: u[STORAGE_KEYS.DESIS_DESC] || '',

        maritualStatus: u[STORAGE_KEYS.MARITUAL_STATUS] || '',
        anyDisablity: u[STORAGE_KEYS.ANY_DISABLITY] || '',
        hasMediclaim: u[STORAGE_KEYS.HAS_MEDICLAIM] || '',

        photo: u[STORAGE_KEYS.PHOTO] || '',

        houseNo: u[STORAGE_KEYS.HOUSE_NO] || '',
        house_no: u[STORAGE_KEYS.HOUSE_NO] || '',
        city: u[STORAGE_KEYS.CITY] || '',
        pincode: u[STORAGE_KEYS.PINCODE] || '',

        policeStationId: u[STORAGE_KEYS.POLICE_STATION_ID] || '',
        police_station_id: u[STORAGE_KEYS.POLICE_STATION_ID] || '',

        country: u[STORAGE_KEYS.COUNTRY] || '',
        state: u[STORAGE_KEYS.STATE] || '',
        isAccept: u[STORAGE_KEYS.IS_ACCEPT] || '',
        is_accept: u[STORAGE_KEYS.IS_ACCEPT] || '',
        createdAt: u[STORAGE_KEYS.CREATED_AT] || '',
        created_at: u[STORAGE_KEYS.CREATED_AT] || '',

        coName: u[STORAGE_KEYS.CO_NAME] || '',
        co_name: u[STORAGE_KEYS.CO_NAME] || '',
        coContactNumber: u[STORAGE_KEYS.CO_CONTACT_NUMBER] || '',
        co_contact_number: u[STORAGE_KEYS.CO_CONTACT_NUMBER] || '',
      } as Partial<UserData>);
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const saveUserSession = async (data: UserData) => {
    // ✅ Read BOTH camelCase and snake_case from incoming data
    // 🔴 FIX: added fristName / lastName here — they were missing!
    const fristName = String(
      pick(data as any, 'fristName', 'frist_name', 'firstName', 'first_name') || ''
    );
    const lastName = String(
      pick(data as any, 'lastName', 'last_name') || ''
    );
    const policeStationId = String(
      pick(data as any, 'policeStationId', 'police_station_id') || ''
    );
    const isAccept = String(
      pick(data as any, 'isAccept', 'is_accept') || ''
    );
    const isHandicaped = String(
      pick(data as any, 'isHandicaped', 'is_handicaped') || ''
    );
    const coContactNumber = String(
      pick(data as any, 'coContactNumber', 'co_contact_number') || ''
    );
    const coName = String(pick(data as any, 'coName', 'co_name') || '');
    const createdAt = String(
      pick(data as any, 'createdAt', 'created_at') || ''
    );
    const maritualStatus = String(
      pick(data as any, 'maritualStatus', 'maritual_status') || ''
    );
    const anyDisablity = String(
      pick(data as any, 'anyDisablity', 'any_disablity') || ''
    );
    const hasMediclaim = String(
      pick(data as any, 'hasMediclaim', 'has_mediclaim') || ''
    );
    const houseNo = String(pick(data as any, 'houseNo', 'house_no') || '');
    const bloodGroup = String(
      pick(data as any, 'bloodGroup', 'blood_group') || ''
    );
    const mobileNumber = String(
      pick(data as any, 'mobileNumber', 'mobile_number') || ''
    );
    const desisDesc = String(
      pick(data as any, 'desisDesc', 'desis_desc') || ''
    );

    const pairs: [string, string][] = [
      [STORAGE_KEYS.USER_ID, String(data.id ?? '')],
      [STORAGE_KEYS.AUTH_TOKEN, String(data.authToken ?? '')],
      [STORAGE_KEYS.FIRST_NAME, fristName],   // ✅ FIXED
      [STORAGE_KEYS.LAST_NAME, lastName],     // ✅ FIXED
      [STORAGE_KEYS.MOBILE_NUMBER, mobileNumber],
      [STORAGE_KEYS.GENDER, String(data.gender ?? '')],
      [STORAGE_KEYS.BLOOD_GROUP, bloodGroup],
      [STORAGE_KEYS.DOB, String(data.dob ?? '')],
      [STORAGE_KEYS.AGE, String(data.age ?? '')],
      [STORAGE_KEYS.IS_HANDICAPED, isHandicaped],
      [STORAGE_KEYS.DESIS_DESC, desisDesc],
      [STORAGE_KEYS.MARITUAL_STATUS, maritualStatus],
      [STORAGE_KEYS.ANY_DISABLITY, anyDisablity],
      [STORAGE_KEYS.HAS_MEDICLAIM, hasMediclaim],
      [STORAGE_KEYS.PHOTO, String(data.photo ?? '')],
      [STORAGE_KEYS.HOUSE_NO, houseNo],
      [STORAGE_KEYS.CITY, String(data.city ?? '')],
      [STORAGE_KEYS.PINCODE, String(data.pincode ?? '')],
      [STORAGE_KEYS.POLICE_STATION_ID, policeStationId],
      [STORAGE_KEYS.COUNTRY, String(data.country ?? 'India')],
      [STORAGE_KEYS.STATE, String(data.state ?? 'West Bengal')],
      [STORAGE_KEYS.IS_ACCEPT, isAccept],
      [STORAGE_KEYS.CREATED_AT, createdAt],
      [STORAGE_KEYS.CO_NAME, coName],
      [STORAGE_KEYS.CO_CONTACT_NUMBER, coContactNumber],
    ];

    console.log('💾 Saving session:', pairs);

    await Promise.all(
      pairs.map(([key, value]) => AsyncStorage.setItem(key, value))
    );

    setUserId(String(data.id));

    // ✅ Set BOTH spellings on the in-memory object
    setUserData({
      ...data,
      fristName,
      frist_name: fristName,
      lastName,
      last_name: lastName,
      mobileNumber,
      bloodGroup,
      blood_group: bloodGroup,
      isHandicaped,
      is_handicaped: isHandicaped,
      desisDesc,
      desis_desc: desisDesc,
      policeStationId,
      police_station_id: policeStationId,
      isAccept,
      is_accept: isAccept,
      coContactNumber,
      co_contact_number: coContactNumber,
      coName,
      co_name: coName,
      createdAt,
      created_at: createdAt,
      maritualStatus,
      anyDisablity,
      hasMediclaim,
      houseNo,
      house_no: houseNo,
    } as Partial<UserData>);
  };

  const updateIsAccept = async (isAccept: string | number) => {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_ACCEPT, String(isAccept));
    setUserData(prev =>
      prev
        ? { ...prev, isAccept: String(isAccept), is_accept: String(isAccept) }
        : null
    );
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setUserId(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userData,
        isLoading,
        saveUserSession,
        updateIsAccept,
        logout,
        reloadSession: loadSession,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;