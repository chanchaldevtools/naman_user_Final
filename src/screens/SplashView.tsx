import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import NetInfo from '@react-native-community/netinfo';
import Images from '../assets/images';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export const SplashView = ({ navigation }: any) => {
  const { userId, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(async () => {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        navigation.replace('NoInternet');
        return;
      }

      if (userId) {
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [userId, isLoading, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#0047AB" stopOpacity="1" />
            <Stop offset="100%" stopColor="#00CCFF" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#grad)" />
      </Svg>

      <View style={styles.content}>
        <Image source={Images.adlogo} style={styles.adlogo} resizeMode="contain" />
        <View style={{ height: 25 }} />
        <Image source={Images.logo} style={styles.namanLogo} resizeMode="contain" />
        <View style={{ height: 40 }} />
        <Text style={styles.initiativeText}>AN INITIATIVE FOR SENIOR CITIZEN</Text>
        <View style={{ height: 20 }} />
        <Text style={styles.policeText}>ASANSOL-DURGAPUR POLICE COMMISSIONERATE</Text>
        <View style={{ height: 40 }} />
        <View style={styles.courtesyContainer}>
          <Text style={styles.courtesyText}>COURTESY -</Text>
          <Text style={styles.companyText}>TECHNEXT TECHNOSOFT PVT. LTD.</Text>
        </View>
        <View style={{ height: 20 }} />
        <View style={styles.tnLogoContainer}>
          <Image source={Images.tnlogo} style={styles.tnlogo} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  adlogo: {
    width: 220,
    height: 120,
  },
  namanLogo: {
    width: 140,
    height: 70,
  },
  initiativeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  policeText: {
    color: '#FFFF00',
    fontSize: 12.5,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  courtesyContainer: {
    alignItems: 'center',
  },
  courtesyText: {
    color: '#FFFF00',
    fontSize: 12,
    marginBottom: 4,
  },
  companyText: {
    color: '#FFFF00',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tnLogoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  tnlogo: {
    width: 140,
    height: 45,
  },
});

export default SplashView;
