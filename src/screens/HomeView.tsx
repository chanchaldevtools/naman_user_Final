import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
  TextInput,
  Linking,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import AppColors from '../constants/colors';
import Images from '../assets/images';
import {useAuth} from '../context/AuthContext';
import {helpApi} from '../api/helpApi';
import {useSnackbar} from '../components/CustomSnackbar';
import DrawerContent from '../components/DrawerContent';
import LoadingDialog from '../components/LoadingDialog';
import API_CONFIG from '../api/apiConfig';
import {SafeAreaView} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

export const HomeView = ({navigation}: any) => {
  const {userId, userData, updateIsAccept} = useAuth();
  const {successSnackBar, infoSnackBar, errorSnackBar} = useSnackbar();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [policeNumberOne, setPoliceNumberOne] = useState('');
  const [policeNumberTwo, setPoliceNumberTwo] = useState('');

  const [helpOptionVisible, setHelpOptionVisible] = useState(false);
  const [callSheetVisible, setCallSheetVisible] = useState(false);
  const [helpFormVisible, setHelpFormVisible] = useState(false);
  const [helpType, setHelpType] = useState<'General' | 'Emergency'>('General');
  const [helpDescription, setHelpDescription] = useState('');

  const [updateDialogVisible, setUpdateDialogVisible] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const [debugVisible, setDebugVisible] = useState(false);
  const [debugTitle, setDebugTitle] = useState('');
  const [debugMessage, setDebugMessage] = useState('');

  const helpInputRef = useRef<TextInput>(null);

  useEffect(() => {
    initializeHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userData?.police_station_id, userData?.policeStationId]);

  const showAlert = (title: string, message: string) => {
    console.log(`🚨 [${title}]\n${message}`);
    if (Platform.OS === 'web') {
      setDebugTitle(title);
      setDebugMessage(message);
      setDebugVisible(true);
    }
  };

  const initializeHome = async () => {
    if (!userId) return;

    console.log('👤 userData:', JSON.stringify(userData, null, 2));

    try {
      // ============ 1. STATION NUMBERS ============
      const stationId =
        userData?.police_station_id ?? userData?.policeStationId;

      if (stationId) {
        const stationRes = await helpApi.fetchStationNumber(String(stationId));
        console.log('📞 Station Response:', JSON.stringify(stationRes, null, 2));

        setPoliceNumberOne(String(stationRes?.userData?.mobile_number || ''));
        setPoliceNumberTwo(String(stationRes?.userData?.whatsapp_number || ''));
      } else {
        console.warn('⚠️ No police_station_id found on userData');
      }

      // ============ 2. STATUS CHECK ============
      const statusRes = await helpApi.statusCheck(userId);
      if (statusRes?.data && statusRes.data.length > 0) {
        await updateIsAccept(statusRes.data[0].is_accept);
        console.log('✅ is_accept updated:', statusRes.data[0].is_accept);
      }

      // ============ 3. VERSION CHECK ============
      const versionRes = await helpApi.versionCheck();
      if (versionRes?.version && versionRes.version.subject) {
        setUpdateMessage(versionRes.version.subject);
        setUpdateDialogVisible(true);
      }
    } catch (e) {
      console.error('Home initialization error:', e);
    }
  };

  // ✅ FIXED — HELP FAB handler
  const handleHelpPress = () => {
    // ✅ Dono keys check karo: isAccept + is_accept
    const rawValue = userData?.isAccept ?? userData?.is_accept ?? '';
    const isApproved = String(rawValue) === '1';

    console.log('🔍 HELP pressed');
    console.log('   userData.isAccept:', userData?.isAccept);
    console.log('   userData.is_accept:', userData?.is_accept);
    console.log('   rawValue:', rawValue);
    console.log('   isApproved:', isApproved);

    if (isApproved) {
      setHelpOptionVisible(true);
    } else {
      infoSnackBar(
        'Your account is not approved yet',
        'Your account is not approved yet, please wait for the Officer approval',
      );
    }
  };

  const handleDialNumber = (number: string) => {
    if (number) {
      Linking.openURL(`tel:${number}`);
    }
  };

  const submitHelpRequest = async () => {
    if (!helpDescription.trim()) {
      infoSnackBar('Required', 'Enter what kind of help you need');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      const response = await helpApi.sendHelpRequest(
        String(userId),
        String(userData?.police_station_id || '1'),
        helpDescription.trim(),
      );
      setLoading(false);

      if (response && response.response === 'ok') {
        setHelpFormVisible(false);
        setHelpDescription('');
        successSnackBar('Help Request send to the Police station', '');
      } else {
        errorSnackBar(
          'Unable to send help request',
          'Server down, please try again later',
        );
      }
    } catch (e) {
      setLoading(false);
      errorSnackBar('Error', 'Unable to send help request');
    }
  };

  // ✅ FIXED — Navigation handlers with logging
  const goToMessage = () => {
    console.log('🚀 Navigating to Message');
    navigation.navigate('Message');
  };

  const goToMyHelps = () => {
    console.log('🚀 Navigating to MyHelps');
    navigation.navigate('MyHelps');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={AppColors.themeColor}
      />

      {/* ================= APP BAR ================= */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.drawerToggle}
          onPress={() => setDrawerVisible(true)}
          activeOpacity={0.7}>
          <Text style={styles.hamburger}>☰</Text>
        </TouchableOpacity>

        <View style={styles.appBarCenter}>
          <Text style={styles.appBarTitle}>NAMAN</Text>
          <Text style={styles.appBarSubtitle}>by ADPC</Text>
        </View>

        <Image
          source={Images.adlogo}
          style={styles.adlogoSmall}
          resizeMode="contain"
        />
      </View>

      {/* ================= MAIN SCROLL ================= */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.bannerContainer}>
          <Image
            source={{
              uri: 'https://naman.inextwebs.com/storage/app/public/bannner/banner.jpg',
            }}
            defaultSource={Images.banner}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitleSmall}>A Police Initiative</Text>
            <Text style={styles.bannerTitleBig}>For Senior Citizens</Text>
          </View>
        </View>

        <View style={styles.servicesCard}>
          <Text style={styles.servicesTitle}>Our Services</Text>
          <View style={styles.servicesRow}>
            <View style={styles.serviceItem}>
              <View
                style={[styles.serviceIconWrap, {backgroundColor: '#E0F2FE'}]}>
                <Text style={styles.serviceIcon}>🛡️</Text>
              </View>
              <Text style={styles.serviceLabel}>Protection</Text>
            </View>

            <View style={styles.serviceItem}>
              <View
                style={[styles.serviceIconWrap, {backgroundColor: '#DCFCE7'}]}>
                <Text style={styles.serviceIcon}>🤝</Text>
              </View>
              <Text style={styles.serviceLabel}>Assistance</Text>
            </View>

            <View style={styles.serviceItem}>
              <View
                style={[styles.serviceIconWrap, {backgroundColor: '#FEE2E2'}]}>
                <Text style={styles.serviceIcon}>🚨</Text>
              </View>
              <Text style={styles.serviceLabel}>Emergency</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeaderRow}>
            <View style={styles.infoDot} />
            <Text style={styles.infoCardTitle}>
              Asansol-Durgapur Police Commissionerate
            </Text>
          </View>
          <Text style={styles.infoCardText}>
            We are dedicated to supporting and caring for our elderly residents.
            Press the <Text style={styles.infoHighlight}>HELP</Text> button
            anytime you need urgent medical, general assistance, or to directly
            speak with the incharge officers.
          </Text>
        </View>

        <View style={{height: 180}} />
      </ScrollView>

      {/* ================= BOTTOM NAV ================= */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavCard}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={goToMessage}
            activeOpacity={0.8}>
            <Text style={styles.navIcon}>✉️</Text>
            <Text style={styles.navText}>Message</Text>
          </TouchableOpacity>

          <Text style={styles.navCenterText}>Press if you need</Text>

          <TouchableOpacity
            style={styles.navItem}
            onPress={goToMyHelps}
            activeOpacity={0.8}>
            <Text style={styles.navIcon}>👥</Text>
            <Text style={styles.navText}>My Helps</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= HELP FAB ================= */}
      <TouchableOpacity
        style={styles.fabContainer}
        onPress={handleHelpPress}
        activeOpacity={0.85}>
        <View style={styles.fabPulse} />
        <View style={styles.fabCircle}>
          <Text style={styles.fabText}>HELP</Text>
        </View>
      </TouchableOpacity>

      {/* ================= DRAWER ================= */}
      <Modal
        visible={drawerVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setDrawerVisible(false)}>
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerSheet}>
            <DrawerContent
              onClose={() => setDrawerVisible(false)}
              navigation={navigation}
            />
          </View>
          <TouchableOpacity
            style={styles.drawerDismissArea}
            onPress={() => setDrawerVisible(false)}
            activeOpacity={1}
          />
        </View>
      </Modal>

      {/* ================= HELP OPTION SHEET ================= */}
      <Modal
        visible={helpOptionVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHelpOptionVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setHelpOptionVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheetContainer}>
                <View style={styles.sheetHandle} />
                <Text style={styles.bottomSheetHeader}>
                  Choose what kind of help you need
                </Text>

                <View style={styles.helpCategoriesRow}>
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => {
                      setHelpOptionVisible(false);
                      setHelpType('General');
                      setHelpFormVisible(true);
                    }}
                    activeOpacity={0.75}>
                    <View
                      style={[
                        styles.categoryIconWrap,
                        {backgroundColor: '#E0F2FE'},
                      ]}>
                      <Image
                        source={Images.gn}
                        style={styles.categoryIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.categoryLabel}>General</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => {
                      setHelpOptionVisible(false);
                      setHelpType('Emergency');
                      setHelpFormVisible(true);
                    }}
                    activeOpacity={0.75}>
                    <View
                      style={[
                        styles.categoryIconWrap,
                        {backgroundColor: '#FEE2E2'},
                      ]}>
                      <Image
                        source={Images.md}
                        style={styles.categoryIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.categoryLabel}>Emergency</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => {
                      setHelpOptionVisible(false);
                      setCallSheetVisible(true);
                    }}
                    activeOpacity={0.75}>
                    <View
                      style={[
                        styles.categoryIconWrap,
                        {backgroundColor: '#DCFCE7'},
                      ]}>
                      <Image
                        source={Images.call}
                        style={styles.categoryIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.categoryLabel}>Call Us</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.cancelSheetBtn}
                  onPress={() => setHelpOptionVisible(false)}>
                  <Text style={styles.cancelSheetText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ================= CALL SHEET ================= */}
      <Modal
        visible={callSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCallSheetVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setCallSheetVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheetContainer}>
                <View style={styles.sheetHandle} />
                <Text style={styles.bottomSheetHeader}>
                  Call any of the numbers
                </Text>

                {policeNumberOne ? (
                  <TouchableOpacity
                    style={styles.callRow}
                    onPress={() => handleDialNumber(policeNumberOne)}>
                    <View style={styles.callIconWrap}>
                      <Text style={styles.callIcon}>📞</Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.callLabel}>Police Station</Text>
                      <Text style={styles.callNumberText}>
                        {policeNumberOne}
                      </Text>
                    </View>
                    <Text style={styles.callAction}>Call</Text>
                  </TouchableOpacity>
                ) : null}

                {policeNumberTwo ? (
                  <TouchableOpacity
                    style={styles.callRow}
                    onPress={() => handleDialNumber(policeNumberTwo)}>
                    <View
                      style={[
                        styles.callIconWrap,
                        {backgroundColor: '#DCFCE7'},
                      ]}>
                      <Text style={styles.callIcon}>📱</Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.callLabel}>WhatsApp</Text>
                      <Text style={styles.callNumberText}>
                        {policeNumberTwo}
                      </Text>
                    </View>
                    <Text style={styles.callAction}>Call</Text>
                  </TouchableOpacity>
                ) : null}

                {!policeNumberOne && !policeNumberTwo ? (
                  <Text style={styles.emptyNumbersText}>
                    No contact numbers available for your station
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={styles.cancelSheetBtn}
                  onPress={() => setCallSheetVisible(false)}>
                  <Text style={styles.cancelSheetText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ================= HELP FORM ================= */}
      <Modal
        visible={helpFormVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHelpFormVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{flex: 1, justifyContent: 'flex-end'}}>
              <TouchableWithoutFeedback>
                <View
                  style={[styles.bottomSheetContainer, {paddingBottom: 24}]}>
                  <View style={styles.sheetHandle} />
                  <Text style={styles.bottomSheetHeader}>
                    Enter {helpType} Help Description
                  </Text>

                  <View style={styles.helpInputRow}>
                    <TextInput
                      ref={helpInputRef}
                      style={styles.helpTextInput}
                      placeholder="Enter what kind of help you need"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      value={helpDescription}
                      onChangeText={setHelpDescription}
                    />
                  </View>

                  <View style={styles.helpActionRow}>
                    <TouchableOpacity
                      style={styles.helpCancelBtn}
                      onPress={() => {
                        Keyboard.dismiss();
                        setHelpFormVisible(false);
                        setHelpDescription('');
                      }}>
                      <Text style={styles.helpCancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.helpSubmitBtn}
                      onPress={submitHelpRequest}
                      activeOpacity={0.8}>
                      <Text style={styles.helpSubmitText}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= VERSION UPDATE DIALOG ================= */}
      <Modal visible={updateDialogVisible} transparent animationType="fade">
        <View style={styles.updateBackdrop}>
          <View style={styles.updateDialogBox}>
            <View style={styles.updateIconWrap}>
              <Text style={styles.updateIcon}>🔔</Text>
            </View>
            <Text style={styles.updateTitle}>Notice</Text>
            <Text style={styles.updateMessage}>{updateMessage}</Text>
            <View style={styles.updateDivider} />
            <View style={styles.updateActionRow}>
              <TouchableOpacity
                style={styles.updateCancelBtn}
                onPress={() => setUpdateDialogVisible(false)}>
                <Text style={styles.updateCancelText}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.updateConfirmBtn}
                onPress={() => {
                  setUpdateDialogVisible(false);
                  Linking.openURL(API_CONFIG.PLAYSTORE_LINK);
                }}>
                <Text style={styles.updateConfirmText}>Update Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= DEBUG MODAL ================= */}
      <Modal
        visible={debugVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDebugVisible(false)}>
        <View style={styles.debugBackdrop}>
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>{debugTitle}</Text>
            <ScrollView style={{maxHeight: 400}}>
              <Text style={styles.debugMessage}>{debugMessage}</Text>
            </ScrollView>
            <View style={styles.debugDivider} />
            <TouchableOpacity
              style={styles.debugCloseBtn}
              onPress={() => setDebugVisible(false)}>
              <Text style={styles.debugCloseText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <LoadingDialog visible={loading} message="Sending request.." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F1F5F9'},

  /* ---------- APP BAR ---------- */
  appBar: {
    height: 60,
    backgroundColor: AppColors.themeColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  drawerToggle: {padding: 6},
  hamburger: {fontSize: 22, color: AppColors.white},
  appBarCenter: {alignItems: 'center'},
  appBarTitle: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  appBarSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  adlogoSmall: {width: 42, height: 34},

  /* ---------- SCROLL ---------- */
  scrollContent: {paddingBottom: 20},

  /* ---------- BANNER ---------- */
  bannerContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  bannerImage: {width: '100%', height: '100%'},
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bannerTitleSmall: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  bannerTitleBig: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 2,
  },

  /* ---------- SERVICES ---------- */
  servicesCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 14,
    marginTop: 20,
    padding: 18,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  servicesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  servicesRow: {flexDirection: 'row', justifyContent: 'space-around'},
  serviceItem: {alignItems: 'center', flex: 1},
  serviceIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceIcon: {fontSize: 24},
  serviceLabel: {fontSize: 12, fontWeight: '700', color: '#1E293B'},

  /* ---------- INFO CARD ---------- */
  infoCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 14,
    marginTop: 14,
    padding: 18,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.themeColor,
    marginRight: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  infoCardText: {fontSize: 13, color: '#475569', lineHeight: 21},
  infoHighlight: {fontWeight: '800', color: '#EF4444'},

  /* ---------- BOTTOM NAV ---------- */
  bottomNavContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  bottomNavCard: {
    backgroundColor: AppColors.white,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingVertical: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  navItem: {alignItems: 'center', justifyContent: 'center', minWidth: 70},
  navIcon: {fontSize: 20},
  navText: {
    fontSize: 11,
    color: '#0F172A',
    marginTop: 2,
    fontWeight: '600',
  },
  navCenterText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    fontStyle: 'italic',
  },

  /* ---------- FAB ---------- */
  fabContainer: {
    position: 'absolute',
    bottom: 92,
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  fabPulse: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(239,68,68,0.25)',
  },
  fabCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 12,
    shadowColor: '#EF4444',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },

  /* ---------- DRAWER ---------- */
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerSheet: {
    width: width * 0.78,
    height: '100%',
    backgroundColor: AppColors.white,
  },
  drawerDismissArea: {flex: 1},

  /* ---------- BOTTOM SHEET ---------- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    bottom: 40,
  },
  bottomSheetContainer: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 50,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 14,
  },
  bottomSheetHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },

  /* ---------- HELP CATEGORIES ---------- */
  helpCategoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 6,
  },
  categoryItem: {alignItems: 'center', padding: 6, width: 96},
  categoryIconWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryIcon: {width: 34, height: 34},
  categoryLabel: {fontSize: 13, fontWeight: '700', color: '#0F172A'},
  cancelSheetBtn: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  cancelSheetText: {color: '#64748B', fontSize: 14, fontWeight: '600'},

  /* ---------- CALL ROW ---------- */
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    width: '100%',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  callIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  callIcon: {fontSize: 20},
  callLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  callNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.themeColor,
    marginTop: 2,
  },
  callAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
    paddingHorizontal: 8,
  },
  emptyNumbersText: {
    fontSize: 14,
    color: '#64748B',
    marginVertical: 16,
    textAlign: 'center',
  },

  /* ---------- HELP FORM ---------- */
  helpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  helpTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    minHeight: 90,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 14,
    color: '#0F172A',
    textAlignVertical: 'top',
    backgroundColor: '#F8FAFC',
  },
  helpActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
  helpCancelBtn: {paddingVertical: 10, paddingHorizontal: 16},
  helpCancelText: {color: '#64748B', fontSize: 14, fontWeight: '600'},
  helpSubmitBtn: {
    backgroundColor: AppColors.themeColor,
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 10,
    elevation: 2,
  },
  helpSubmitText: {color: AppColors.white, fontSize: 14, fontWeight: '700'},

  /* ---------- UPDATE DIALOG ---------- */
  updateBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  updateDialogBox: {
    backgroundColor: AppColors.white,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    elevation: 8,
  },
  updateIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  updateIcon: {fontSize: 26},
  updateTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  updateMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  updateDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
    marginBottom: 8,
  },
  updateActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  updateCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
  },
  updateCancelText: {color: '#64748B', fontSize: 14, fontWeight: '600'},
  updateConfirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
  },
  updateConfirmText: {
    color: AppColors.themeColor,
    fontWeight: '800',
    fontSize: 15,
  },

  /* ---------- DEBUG MODAL ---------- */
  debugBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  debugBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
    elevation: 10,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  debugMessage: {
    fontSize: 12,
    color: '#334155',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
  },
  debugDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  debugCloseBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: AppColors.themeColor,
    borderRadius: 8,
  },
  debugCloseText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default HomeView;