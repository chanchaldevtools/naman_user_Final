import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Share,
} from 'react-native';
import AppColors from '../constants/colors';
import Images from '../assets/images';
import API_CONFIG from '../api/apiConfig';
import { useAuth } from '../context/AuthContext';

interface DrawerContentProps {
  onClose: () => void;
  navigation: any;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({ onClose, navigation }) => {
  const { logout } = useAuth();

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Naman ADPC',
        message: `Download the Naman Adpc app by clicking this link: ${API_CONFIG.PLAYSTORE_LINK}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRateUs = () => {
    Linking.openURL(API_CONFIG.PLAYSTORE_LINK);
  };

  const handleContactDev = () => {
    Linking.openURL(
      `mailto:${API_CONFIG.SUPPORT_EMAIL}?subject=Hello to Developers and Support Team of Naman ADPC&body=Type your suggestions/ Complain about this application`
    );
  };

  const handleDevWebsite = () => {
    Linking.openURL(API_CONFIG.DEVELOPER_WEBSITE);
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderMenuItem = (
    icon: string,
    title: string,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        onClose();
        onPress();
      }}
      activeOpacity={0.7}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={Images.ds} style={styles.bannerImage} resizeMode="cover" />
        </View>
        <View style={styles.divider} />

        {renderMenuItem('👤', 'Profile', () => navigation.navigate('Profile'))}
        {renderMenuItem('📋', 'My Helps', () => navigation.navigate('MyHelps'))}
        {renderMenuItem('📑', 'My Visits', () => navigation.navigate('VisitView'))}
        {renderMenuItem('🔒', 'Privacy Policy', () => navigation.navigate('Privacy'))}
      

        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.footer}
          onPress={handleDevWebsite}
          activeOpacity={0.8}>
          <Image source={Images.tnlogo} style={styles.tnLogo} resizeMode="contain" />
          <Text style={styles.footerText}>Design & Develop by Technext Technosoft</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    width: '100%',
    height: 140,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.themeColor,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  menuIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  menuTitle: {
    fontSize: 15,
    color: AppColors.black,
    marginLeft: 14,
    fontWeight: '400',
  },
  logoutContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: AppColors.redAccent,
    minWidth: 100,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  logoutText: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  tnLogo: {
    width: 100,
    height: 40,
    marginBottom: 4,
  },
  footerText: {
    color: AppColors.themeColor,
    fontSize: 10,
  },
});

export default DrawerContent;
