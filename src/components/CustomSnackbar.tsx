import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import AppColors from '../constants/colors';

type SnackbarType = 'success' | 'error' | 'info' | 'white';

interface SnackbarContextType {
  showSnackbar: (title: string, message: string, type?: SnackbarType) => void;
  successSnackBar: (title: string, message: string) => void;
  errorSnackBar: (title: string, message: string) => void;
  infoSnackBar: (title: string, message: string) => void;
  whiteSnackbar: (title: string, message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType>({
  showSnackbar: () => {},
  successSnackBar: () => {},
  errorSnackBar: () => {},
  infoSnackBar: () => {},
  whiteSnackbar: () => {},
});

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('info');
  const [fadeAnim] = useState(new Animated.Value(0));

  const showSnackbar = useCallback(
    (snackTitle: string, snackMessage: string, snackType: SnackbarType = 'info') => {
      setTitle(snackTitle);
      setMessage(snackMessage);
      setType(snackType);
      setVisible(true);

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
      });
    },
    [fadeAnim]
  );

  const successSnackBar = useCallback(
    (t: string, m: string) => showSnackbar(t, m, 'success'),
    [showSnackbar]
  );
  const errorSnackBar = useCallback(
    (t: string, m: string) => showSnackbar(t, m, 'error'),
    [showSnackbar]
  );
  const infoSnackBar = useCallback(
    (t: string, m: string) => showSnackbar(t, m, 'info'),
    [showSnackbar]
  );
  const whiteSnackbar = useCallback(
    (t: string, m: string) => showSnackbar(t, m, 'white'),
    [showSnackbar]
  );

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return AppColors.green;
      case 'error':
        return AppColors.redAccent;
      case 'info':
        return AppColors.blue;
      case 'white':
        return AppColors.white;
      default:
        return AppColors.blue;
    }
  };

  const getTextColor = () => {
    return type === 'white' ? AppColors.black : AppColors.white;
  };

  return (
    <SnackbarContext.Provider
      value={{
        showSnackbar,
        successSnackBar,
        errorSnackBar,
        infoSnackBar,
        whiteSnackbar,
      }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.container,
            type === 'white' ? styles.topPosition : styles.bottomPosition,
            { backgroundColor: getBackgroundColor(), opacity: fadeAnim },
          ]}>
          <Text style={[styles.title, { color: getTextColor() }]}>{title}</Text>
          {message ? <Text style={[styles.message, { color: getTextColor() }]}>{message}</Text> : null}
        </Animated.View>
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  bottomPosition: {
    bottom: 54,
  },
  topPosition: {
    top: 50,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default SnackbarProvider;
