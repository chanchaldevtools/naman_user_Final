import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Alert,
  Image,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppColors from '../constants/colors';
import buttonStyles from '../constants/buttonStyles';
import Images from '../assets/images';
import { stationApi } from '../api/stationApi';
import { registerApi } from '../api/registerApi';
import { CityItem, PoliceStationDatum } from '../types';
import { useSnackbar } from '../components/CustomSnackbar';
import LoadingDialog from '../components/LoadingDialog';

const GENDER_LIST = ['Male', 'Female', 'Others'];
const BLOOD_GROUPS = ['A +', 'A -', 'B +', 'B -', 'O +', 'O -', 'AB +', 'AB -'];

export const RegisterDetailsView = ({ route, navigation }: any) => {
  const { selectedImagePath, isCareOf, coName, coMobile } = route.params || {};

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedBlood, setSelectedBlood] = useState<string | null>(null);
  const [dobDate, setDobDate] = useState('Select DOB');
  const [age, setAge] = useState('');

  const [maritalStatus, setMaritalStatus] = useState<number>(1);
  const [hasSon, setHasSon] = useState(false);
  const [hasDaughter, setHasDaughter] = useState(false);
  const [hasSonInLaw, setHasSonInLaw] = useState(false);
  const [hasDaughterLaw, setHasDaughterLaw] = useState(false);
  const [hasOtherMember, setHasOtherMember] = useState(false);

  const [isHandicapped, setIsHandicapped] = useState(false);
  const [havingMediclaim, setHavingMediclaim] = useState(false);
  const [havingDiseases, setHavingDiseases] = useState(false);
  const [diseaseDescription, setDiseaseDescription] = useState('');

  const [houseNo, setHouseNo] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [pincode, setPincode] = useState('');
  const [selectedPoliceStation, setSelectedPoliceStation] = useState<
    string | null
  >(null);

  const [cityList, setCityList] = useState<CityItem[]>([]);
  const [policeList, setPoliceList] = useState<PoliceStationDatum[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [modalType, setModalType] = useState<
    'gender' | 'blood' | 'city' | 'station' | 'dob' | null
  >(null);

  const [tempYear, setTempYear] = useState('1950');
  const [tempMonth, setTempMonth] = useState('01');
  const [tempDay, setTempDay] = useState('01');

  const { successSnackBar, infoSnackBar, errorSnackBar } = useSnackbar();

  // 🔽 Refs for auto-scroll
  const scrollViewRef = useRef<ScrollView>(null);
  const fieldPositions = useRef<{ [key: string]: number }>({});
  const scrollYRef = useRef(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setPageLoading(true);
      const [citiesRes, policeRes] = await Promise.all([
        stationApi.fetchCityList(),
        stationApi.fetchPoliceStation(),
      ]);

      if (citiesRes.city_list) {
        setCityList(citiesRes.city_list);
      }
      if (policeRes.police_station_data) {
        setPoliceList(policeRes.police_station_data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPageLoading(false);
    }
  };

  /**
   * Called when a TextInput gets focus.
   * Scrolls the ScrollView so the focused input appears near the top.
   */
  const handleInputFocus = (key: string) => {
    const y = fieldPositions.current[key];
    if (y !== undefined && scrollViewRef.current) {
      // Small delay so layout is measured after keyboard starts appearing
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(y - 20, 0),
          animated: true,
        });
      }, 150);
    }
  };

  /**
   * Register a layout position for a field.
   */
  const onFieldLayout = (key: string, event: any) => {
    fieldPositions.current[key] = event.nativeEvent.layout.y;
  };

  const calculateAgeFromDob = (day: string, month: string, year: string) => {
    const birthDate = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    );
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    setAge(String(calculatedAge));
    setDobDate(
      `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`
    );
  };

  const handleRegister = async () => {
    if (!mobileNumber.trim()) {
      infoSnackBar('Required', 'Enter Mobile Number');
      return;
    }
    if (mobileNumber.trim().length !== 10) {
      infoSnackBar('Invalid', 'Mobile number should be in 10 digits');
      return;
    }
    if (!password.trim()) {
      infoSnackBar('Required', 'Please input a password');
      return;
    }
    if (!firstName.trim()) {
      infoSnackBar('Required', 'Enter first name');
      return;
    }
    if (!lastName.trim()) {
      infoSnackBar('Required', 'Enter last name');
      return;
    }
    if (!selectedGender) {
      infoSnackBar('Please Select Gender', 'Please select your gender');
      return;
    }
    if (!selectedBlood) {
      infoSnackBar('Please Select Blood', 'Please select your blood group');
      return;
    }
    if (!age.trim()) {
      infoSnackBar('Required', 'Please enter your age');
      return;
    }
    const ageNum = parseInt(age.trim(), 10);
    if (isNaN(ageNum) || ageNum < 60) {
      infoSnackBar(
        'Age Should be more than 60 years',
        'Naman service is only available for 60 years or more than that age'
      );
      return;
    }
    if (!houseNo.trim()) {
      infoSnackBar('Required', 'Enter House/ area/ street no');
      return;
    }
    if (!selectedCity) {
      infoSnackBar('Please Select City', 'Please select your living city');
      return;
    }
    if (!pincode.trim()) {
      infoSnackBar('Required', 'Enter Pincode');
      return;
    }
    if (!selectedPoliceStation) {
      infoSnackBar(
        'Please Select Police Station',
        'Please select your nearest police station'
      );
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      const response = await registerApi.getRegisterApi({
        mobile_number: mobileNumber.trim(),
        password: password.trim(),
        frist_name: firstName.trim(),
        last_name: lastName.trim(),
        gender: selectedGender,
        blood_group: selectedBlood,
        dob: dobDate,
        age: age.trim(),
        any_disablity: String(havingDiseases),
        desis_desc: havingDiseases ? diseaseDescription.trim() : '',
        has_mediclaim: String(havingMediclaim),
        house_no: houseNo.trim(),
        city: selectedCity,
        pincode: pincode.trim(),
        police_station_id: selectedPoliceStation,
        country: 'India',
        co_contact_number: coMobile || '',
        co_name: coName || '',
        has_co: String(isCareOf),
        is_handicaped: String(isHandicapped),
        state: 'West Bengal',
        maritual_status: String(maritalStatus),
        imageUri: selectedImagePath,
        hasSon: String(hasSon),
        hasDaughter: String(hasDaughter),
        hasSonInLaw: String(hasSonInLaw),
        hasDaughterLaw: String(hasDaughterLaw),
        otherMember: String(hasOtherMember),
        fcm: '',
      });

      setLoading(false);

      if (response && response.response === 'ok') {
        successSnackBar(
          'Successfully Registered',
          'You have registered successfully, now login to get into the app'
        );
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else if (response && response.response === 'exist') {
        infoSnackBar(
          'User already exists',
          'This phone number already exists, try with a different mobile number'
        );
      } else {
        errorSnackBar('Server down!', 'Please try again later');
      }
    } catch (e) {
      setLoading(false);
      errorSnackBar('Error', 'Registration failed. Please try again.');
    }
  };

  const renderDropdownModal = () => {
    let title = '';
    let items: { label: string; value: string }[] = [];
    let onSelect = (val: string) => {};

    if (modalType === 'gender') {
      title = 'Select Gender';
      items = GENDER_LIST.map(g => ({ label: g, value: g }));
      onSelect = val => setSelectedGender(val);
    } else if (modalType === 'blood') {
      title = 'Select Blood Group';
      items = BLOOD_GROUPS.map(b => ({ label: b, value: b }));
      onSelect = val => setSelectedBlood(val);
    } else if (modalType === 'city') {
      title = 'Select City';
      items = cityList.map(c => ({ label: c.city_name, value: c.city_name }));
      onSelect = val => setSelectedCity(val);
    } else if (modalType === 'station') {
      title = 'Select Police Station';
      items = policeList.map(p => ({
        label: p.police_station_name,
        value: String(p.id || p.police_station_name),
      }));
      onSelect = val => setSelectedPoliceStation(val);
    }

    if (modalType === 'dob') {
      return (
        <Modal transparent visible={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <Text style={styles.modalTitle}>Enter Date of Birth</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateInputCol}>
                  <Text style={styles.dateSubLabel}>Day (DD)</Text>
                  <TextInput
                    style={styles.dateInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={tempDay}
                    onChangeText={setTempDay}
                  />
                </View>
                <View style={styles.dateInputCol}>
                  <Text style={styles.dateSubLabel}>Month (MM)</Text>
                  <TextInput
                    style={styles.dateInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={tempMonth}
                    onChangeText={setTempMonth}
                  />
                </View>
                <View style={styles.dateInputCol}>
                  <Text style={styles.dateSubLabel}>Year (YYYY)</Text>
                  <TextInput
                    style={styles.dateInput}
                    keyboardType="numeric"
                    maxLength={4}
                    value={tempYear}
                    onChangeText={setTempYear}
                  />
                </View>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setModalType(null)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={() => {
                    calculateAgeFromDob(tempDay, tempMonth, tempYear);
                    setModalType(null);
                  }}>
                  <Text style={styles.modalConfirmText}>Set Date</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    }

    return (
      <Modal transparent visible={modalType !== null} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {items.map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(item.value);
                    setModalType(null);
                  }}>
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalType(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderCheckboxTile = (
    title: string,
    value: boolean,
    onToggle: (v: boolean) => void
  ) => (
    <TouchableOpacity
      style={styles.checkboxTile}
      onPress={() => onToggle(!value)}
      activeOpacity={0.7}>
      <View style={[styles.checkboxBox, value && styles.checkboxActive]}>
        {value && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={Images.blutop}
          style={styles.topCurve}
          resizeMode="contain"
        />
        <Image
          source={Images.bluedwn}
          style={styles.bottomCurve}
          resizeMode="contain"
        />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          enabled>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
            onScroll={e => {
              scrollYRef.current = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}>
            <View style={styles.headerRight}>
              <Text style={styles.headerTitle}>ENTER USER DETAILS    </Text>
            </View>
            <View style={{ height: 20 }} />

            {/* Mobile */}
            <View
              style={styles.inputWrapper}
              onLayout={e => onFieldLayout('mobile', e)}>
              <Text style={styles.inputLabel}>   Enter Mobile</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Mobile"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                value={mobileNumber}
                onChangeText={t => setMobileNumber(t.replace(/[^0-9]/g, ''))}
                onFocus={() => handleInputFocus('mobile')}
              />
            </View>

            {/* Password */}
            <View
              style={styles.inputWrapper}
              onLayout={e => onFieldLayout('password', e)}>
              <Text style={styles.inputLabel}>   Create Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => handleInputFocus('password')}
              />
            </View>

            {/* First Name */}
            <View
              style={styles.inputWrapper}
              onLayout={e => onFieldLayout('firstName', e)}>
              <Text style={styles.inputLabel}>   Enter first name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => handleInputFocus('firstName')}
              />
            </View>

            {/* Last Name */}
            <View
              style={styles.inputWrapper}
              onLayout={e => onFieldLayout('lastName', e)}>
              <Text style={styles.inputLabel}>   Enter last name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
                onFocus={() => handleInputFocus('lastName')}
              />
            </View>

            {/* Gender & Blood Group Row */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.dropdownBox, { marginRight: 6 }]}
                onPress={() => setModalType('gender')}
                activeOpacity={0.8}>
                <Text style={styles.dropdownText}>
                  {selectedGender || 'Select Gender'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dropdownBox, { marginLeft: 6 }]}
                onPress={() => setModalType('blood')}
                activeOpacity={0.8}>
                <Text style={styles.dropdownText}>
                  {selectedBlood || 'Select blood'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* DOB & Age Row */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.dropdownBox, { flex: 1.2 }]}
                onPress={() => setModalType('dob')}
                activeOpacity={0.8}>
                <Text style={styles.dropdownText}>{dobDate}</Text>
                <Text style={styles.dropdownArrow}>📅</Text>
              </TouchableOpacity>

              <Text style={styles.orText}>or</Text>

              <View
                style={{ flex: 1 }}
                onLayout={e => onFieldLayout('age', e)}>
                <TextInput
                  style={[styles.input, { height: 48 }]}
                  placeholder="Enter age"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={3}
                  value={age}
                  onChangeText={setAge}
                  onFocus={() => handleInputFocus('age')}
                />
              </View>
            </View>

            {/* Marital Status */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.radioBox,
                  maritalStatus === 1 && styles.radioBoxActive,
                  { marginRight: 6 },
                ]}
                onPress={() => setMaritalStatus(1)}
                activeOpacity={0.8}>
                <View style={styles.radioOuter}>
                  {maritalStatus === 1 && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Alone</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioBox,
                  maritalStatus === 2 && styles.radioBoxActive,
                  { marginLeft: 6 },
                ]}
                onPress={() => setMaritalStatus(2)}
                activeOpacity={0.8}>
                <View style={styles.radioOuter}>
                  {maritalStatus === 2 && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Family</Text>
              </TouchableOpacity>
            </View>

            {/* Family Members */}
            {maritalStatus === 2 && (
              <View style={styles.subCheckboxes}>
                <Text style={styles.subCheckboxHeader}>
                  Choose your family member
                </Text>
                {renderCheckboxTile('I Have Son', hasSon, setHasSon)}
                {renderCheckboxTile(
                  'I Have Daughter',
                  hasDaughter,
                  setHasDaughter
                )}
                {renderCheckboxTile(
                  'I Have Son-in-law',
                  hasSonInLaw,
                  setHasSonInLaw
                )}
                {renderCheckboxTile(
                  'I have Daughter_in_law',
                  hasDaughterLaw,
                  setHasDaughterLaw
                )}
                {renderCheckboxTile(
                  'I have other member(s)',
                  hasOtherMember,
                  setHasOtherMember
                )}
              </View>
            )}

            <View style={styles.divider} />

            {/* Physical / Health */}
            <Text style={styles.sectionHeader}>
              Please check if you are any of those
            </Text>
            {renderCheckboxTile(
              'I am Handicapped',
              isHandicapped,
              setIsHandicapped
            )}
            {renderCheckboxTile(
              'I have Mediclaim',
              havingMediclaim,
              setHavingMediclaim
            )}
            {renderCheckboxTile(
              'I have specific issue',
              havingDiseases,
              setHavingDiseases
            )}

            {havingDiseases && (
              <View
                style={styles.inputWrapper}
                onLayout={e => onFieldLayout('disease', e)}>
                <Text style={styles.inputLabel}> Issue description</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  placeholder="Issue description"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={diseaseDescription}
                  onChangeText={setDiseaseDescription}
                  onFocus={() => handleInputFocus('disease')}
                />
              </View>
            )}

            <View style={styles.divider} />

            {/* Address */}
            <Text style={[styles.sectionHeader, { fontWeight: '700' }]}>
              Enter Address Details
            </Text>

            <View
              style={styles.inputWrapper}
              onLayout={e => onFieldLayout('houseNo', e)}>
              <Text style={styles.inputLabel}>
                {' '}
                Enter House/ area/ street no
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter House/ area/ street no"
                placeholderTextColor="#9CA3AF"
                value={houseNo}
                onChangeText={setHouseNo}
                onFocus={() => handleInputFocus('houseNo')}
              />
            </View>

            {/* City & Pincode */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.dropdownBox, { marginRight: 6 }]}
                onPress={() => setModalType('city')}
                activeOpacity={0.8}>
                <Text style={styles.dropdownText} numberOfLines={1}>
                  {selectedCity || 'Select City'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>

              <View
                style={{ flex: 1, marginLeft: 6 }}
                onLayout={e => onFieldLayout('pincode', e)}>
                <TextInput
                  style={[styles.input, { height: 48 }]}
                  placeholder="Enter Pincode"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={6}
                  value={pincode}
                  onChangeText={t => setPincode(t.replace(/[^0-9]/g, ''))}
                  onFocus={() => handleInputFocus('pincode')}
                />
              </View>
            </View>

            {/* Police Station */}
            <View style={styles.inputWrapper}>
              <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => setModalType('station')}
                activeOpacity={0.8}>
                <Text style={styles.dropdownText} numberOfLines={1}>
                  {selectedPoliceStation
                    ? policeList.find(
                        p =>
                          String(p.id) === selectedPoliceStation ||
                          p.police_station_name === selectedPoliceStation
                      )?.police_station_name || selectedPoliceStation
                    : 'Select Police Station'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* State */}
            <TouchableOpacity
              style={styles.stateNotice}
              onPress={() =>
                infoSnackBar(
                  'West Bengal Police',
                  'We are currently available in West Bengal, India'
                )
              }
              activeOpacity={0.8}>
              <Text style={styles.stateNoticeText}>West Bengal, India</Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />

            {/* Register */}
            <TouchableOpacity
              style={buttonStyles.curveButtonStyleThemeColor}
              onPress={handleRegister}
              activeOpacity={0.8}>
              <Text style={buttonStyles.buttonTextWhite}>Register</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {renderDropdownModal()}
        <LoadingDialog
          visible={loading || pageLoading}
          message={pageLoading ? 'Loading data..' : 'Registering..'}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  topCurve: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 140,
    height: 140,
    zIndex: 1,
  },
  bottomCurve: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 140,
    height: 140,
    zIndex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
    alignItems: 'center',
    flexGrow: 1,
  },
  headerRight: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: AppColors.themeColor,
  },
  inputWrapper: {
    width: '100%',
    maxWidth: 340,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 13,
    color: AppColors.black,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    height: 46,
    borderWidth: 1,
    borderColor: AppColors.themeColorLight,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 13.5,
    color: AppColors.black,
    backgroundColor: AppColors.white,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 340,
    marginTop: 8,
    alignItems: 'center',
  },
  dropdownBox: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: AppColors.themeColorLight,
    borderRadius: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.white,
  },
  dropdownText: {
    fontSize: 13,
    color: AppColors.black,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  orText: {
    paddingHorizontal: 8,
    fontSize: 14,
    color: AppColors.black,
  },
  radioBox: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: AppColors.themeColorLight,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  radioBoxActive: {
    borderColor: AppColors.themeColorLight,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.themeColorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.themeColorLight,
  },
  radioLabel: {
    fontSize: 14,
    color: AppColors.black,
  },
  subCheckboxes: {
    width: '100%',
    maxWidth: 340,
    marginTop: 8,
    paddingLeft: 8,
  },
  subCheckboxHeader: {
    fontSize: 12,
    color: AppColors.black,
    marginVertical: 6,
  },
  checkboxTile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: AppColors.themeColorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: AppColors.themeColorLight,
  },
  checkmark: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: AppColors.black,
  },
  divider: {
    width: '100%',
    maxWidth: 340,
    height: 1,
    backgroundColor: AppColors.themeColor,
    marginVertical: 16,
  },
  sectionHeader: {
    width: '100%',
    maxWidth: 340,
    fontSize: 14,
    color: AppColors.black,
    marginBottom: 8,
  },
  stateNotice: {
    width: '100%',
    maxWidth: 340,
    height: 48,
    borderWidth: 1,
    borderColor: AppColors.themeColorLight,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  stateNoticeText: {
    color: AppColors.black,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '85%',
    backgroundColor: AppColors.white,
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.black,
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  modalItemText: {
    fontSize: 14,
    color: AppColors.black,
  },
  modalCloseBtn: {
    marginTop: 16,
    alignSelf: 'flex-end',
    padding: 8,
  },
  modalCloseText: {
    color: AppColors.themeColor,
    fontSize: 14,
    fontWeight: '600',
  },
  datePickerContainer: {
    width: '85%',
    backgroundColor: AppColors.white,
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  dateInputCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateSubLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: AppColors.themeColorLight,
    borderRadius: 6,
    height: 42,
    textAlign: 'center',
    fontSize: 14,
    color: AppColors.black,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  modalCancelBtn: {
    padding: 8,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 14,
  },
  modalConfirmBtn: {
    backgroundColor: AppColors.themeColor,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  modalConfirmText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterDetailsView;