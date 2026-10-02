import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import AppColors from '../constants/colors';
import Images from '../assets/images';

export const NoInternetView = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={Images.signal} style={styles.image} resizeMode="contain" />
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.subtitle}>Please check your network settings and try again.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.replace('Splash')}
          activeOpacity={0.8}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.graywhite,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  retryButton: {
    backgroundColor: '#7C4DFF',
    minWidth: 150,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  retryText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default NoInternetView;
