import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HelloScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
});

export default HelloScreen;