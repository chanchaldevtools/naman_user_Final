import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import AppColors from '../constants/colors';
import buttonStyles from '../constants/buttonStyles';
import Images from '../assets/images';
import { useSnackbar } from '../components/CustomSnackbar';

export const RegisterView = ({ navigation }: any) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isSelf, setIsSelf] = useState<boolean>(true);
  const [isCareOf, setIsCareOf] = useState<boolean>(false);
  const [coName, setCoName] = useState<string>('');
  const [coMobile, setCoMobile] = useState<string>('');
  const [errors, setErrors] = useState<{ coName?: string; coMobile?: string }>({});

  const { infoSnackBar } = useSnackbar();

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Image picker error:', e);
    }
  };

  const validate = () => {
    if (!selectedImage) {
      infoSnackBar('Please choose an image', 'You need to choose an image first');
      return false;
    }

    if (isCareOf) {
      const newErrors: { coName?: string; coMobile?: string } = {};
      if (!coName.trim()) {
        newErrors.coName = 'Enter C/O Name';
      }
      if (!coMobile.trim()) {
        newErrors.coMobile = 'Enter Mobile Number';
      } else if (coMobile.trim().length !== 10) {
        newErrors.coMobile = 'Mobile number should be in 10 digits';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    return true;
  };

  const handleNext = () => {
    if (!validate()) return;

    navigation.navigate('RegisterDetails', {
      selectedImagePath: selectedImage,
      isSelf,
      isCareOf,
      coName: isCareOf ? coName.trim() : '',
      coMobile: isCareOf ? coMobile.trim() : '',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image source={Images.blutop} style={styles.topCurve} resizeMode="contain" />
        <Image source={Images.bluedwn} style={styles.bottomCurve} resizeMode="contain" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.headerRight}>
              <Text style={styles.headerTitle}>CREATE ACCOUNT    </Text>
            </View>

            <View style={{ height: 20 }} />
            <Image source={Images.icon} style={styles.icon} resizeMode="contain" />
            <Text style={styles.appTitle}>NAMAN by ADPC</Text>

            <View style={{ height: 30 }} />

            {/* Profile image picker */}
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} style={styles.imagePickerBtn}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.userPhoto} />
              ) : (
                <Image source={Images.imagePlaceholder} style={styles.placeholderImg} resizeMode="contain" />
              )}
            </TouchableOpacity>

            <Text style={styles.imageLabel}>
              {selectedImage ? 'Tap to choose image again' : 'Choose user image'}
            </Text>

            <View style={{ height: 30 }} />

            {/* Account purpose selection */}
            <Text style={styles.sectionTitle}>I am creating this account for</Text>
            <View style={{ height: 12 }} />

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxTile}
                onPress={() => {
                  setIsSelf(true);
                  setIsCareOf(false);
                  setErrors({});
                }}
                activeOpacity={0.7}>
                <View style={[styles.checkboxBox, isSelf && styles.checkboxActive]}>
                  {isSelf && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>My Self</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxTile}
                onPress={() => {
                  setIsCareOf(true);
                  setIsSelf(false);
                }}
                activeOpacity={0.7}>
                <View style={[styles.checkboxBox, isCareOf && styles.checkboxActive]}>
                  {isCareOf && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Others</Text>
              </TouchableOpacity>
            </View>

            {/* Care Of Fields */}
            {isCareOf ? (
              <View style={styles.careOfContainer}>
                <View style={{ height: 16 }} />
                <Text style={styles.careOfLabel}>Enter C/O (Care of name)</Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputTitle}>Enter C/O Name</Text>
                  <TextInput
                    style={[styles.input, errors.coName ? styles.inputError : null]}
                    placeholder="Enter C/O Name"
                    placeholderTextColor="#9CA3AF"
                    value={coName}
                    onChangeText={text => {
                      setCoName(text);
                      if (errors.coName) setErrors(prev => ({ ...prev, coName: undefined }));
                    }}
                  />
                  {errors.coName ? <Text style={styles.errorText}>{errors.coName}</Text> : null}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputTitle}>Enter C/O Mobile Number</Text>
                  <TextInput
                    style={[styles.input, errors.coMobile ? styles.inputError : null]}
                    placeholder="Enter C/O Mobile Number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={10}
                    value={coMobile}
                    onChangeText={text => {
                      setCoMobile(text.replace(/[^0-9]/g, ''));
                      if (errors.coMobile) setErrors(prev => ({ ...prev, coMobile: undefined }));
                    }}
                  />
                  {errors.coMobile ? <Text style={styles.errorText}>{errors.coMobile}</Text> : null}
                </View>
              </View>
            ) : null}

            <View style={{ height: 30 }} />

            <TouchableOpacity
              style={buttonStyles.curveButtonStyleThemeColor}
              onPress={handleNext}
              activeOpacity={0.8}>
              <Text style={buttonStyles.buttonTextWhite}>Next</Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
        </KeyboardAvoidingView>
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
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
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
  icon: {
    width: 70,
    height: 70,
  },
  appTitle: {
    fontSize: 15,
    color: AppColors.black,
    marginTop: 6,
    fontWeight: '500',
  },
  imagePickerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImg: {
    width: 80,
    height: 80,
  },
  userPhoto: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.themeColorLight,
  },
  imageLabel: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    color: AppColors.black,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 30,
  },
  checkboxTile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: AppColors.themeColorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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
    fontSize: 15,
    color: AppColors.black,
  },
  careOfContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  careOfLabel: {
    fontSize: 12,
    color: AppColors.black,
    marginBottom: 10,
  },
  inputWrapper: {
    width: '100%',
    marginTop: 10,
  },
  inputTitle: {
    fontSize: 13,
    color: AppColors.black,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: AppColors.themeColorLight,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 13.5,
    color: AppColors.black,
  },
  inputError: {
    borderColor: AppColors.redAccent,
  },
  errorText: {
    color: AppColors.redAccent,
    fontSize: 11,
    marginTop: 3,
  },
});

export default RegisterView;
