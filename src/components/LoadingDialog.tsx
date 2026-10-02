import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Image } from 'react-native';
import AppColors from '../constants/colors';
import Images from '../assets/images';

interface LoadingDialogProps {
  visible: boolean;
  message?: string;
  useGif?: boolean;
}

export const LoadingDialog: React.FC<LoadingDialogProps> = ({
  visible,
  message = 'Loading..',
  useGif = false,
}) => {
  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {useGif ? (
            <Image source={Images.loading} style={styles.gif} resizeMode="contain" />
          ) : (
            <ActivityIndicator size="large" color={AppColors.themeColor} />
          )}
          {message ? <Text style={styles.text}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: AppColors.white,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gif: {
    width: 60,
    height: 60,
  },
  text: {
    marginTop: 12,
    fontSize: 13,
    color: AppColors.black,
  },
});

export default LoadingDialog;
