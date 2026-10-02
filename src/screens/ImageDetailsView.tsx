import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAppBar from '../components/CustomAppBar';
import AppColors from '../constants/colors';

const { width, height } = Dimensions.get('window');

export const ImageDetailsView = ({ route, navigation }: any) => {
  const { imageUrl, title } = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomAppBar title={ title } onBackPress={() => navigation.goBack()} />

      <View style={styles.container}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.black,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.black,
  },
  image: {
    width: width,
    height: height * 0.8,
  },
});

export default ImageDetailsView;
