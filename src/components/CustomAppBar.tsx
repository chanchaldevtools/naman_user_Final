import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import AppColors from '../constants/colors';

interface CustomAppBarProps {
  title: string;
  onBackPress?: () => void;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
}

export const CustomAppBar: React.FC<CustomAppBarProps> = ({
  title,
  onBackPress,
  showBack = true,
  rightComponent,
}) => {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.rightContainer}>{rightComponent || <View style={styles.placeholder} />}</View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: AppColors.themeColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: AppColors.white,
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 34,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '400',
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
});

export default CustomAppBar;
