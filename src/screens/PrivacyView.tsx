import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import CustomAppBar from '../components/CustomAppBar';
import AppColors from '../constants/colors';

const PRIVACY_CONTENT = `This application requires basic authorization to generate login credentials. This involves some fundamental operations to assist in proper functionality. This includes some supportive aspects as:

1. Authorization - This is required for user identification and to generate login credentials.

2. Call Logs - This helps in managing the call functionality used in this application.

3. Media - This also uses media access permission while using the application.

This has a customer support team assisting with queries. Users can get it from the local police station or app store and access the features.`;

export const PrivacyView = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomAppBar title="Privacy & Policy" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.contentText}>{PRIVACY_CONTENT}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 8,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contentText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
});

export default PrivacyView;
