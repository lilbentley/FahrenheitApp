import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';

// Custom hook for rotation animation
const useRotateAnimation = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startRotation = () => {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  };

  const stopRotation = () => {
    Animated.loop(
      Animated.timing(rotateAnim),
    ).stop();
    rotateAnim.setValue(0);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return { rotation, startRotation, stopRotation };
};

const HomePage = () => {
  const [litFiresCount, setLitFiresCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { rotation, startRotation, stopRotation } = useRotateAnimation();

  const fetchLitFiresCount = async () => {
    setIsLoading(true);
    startRotation();
    try {
      const response = await fetch('http://10.0.2.2:3000/api/count');
      const data = await response.json();
      setLitFiresCount(data.count);
    } catch (error) {
      console.error('Failed to fetch lit fires count:', error);
      // Consider setting some state here to show an error message to the user
    } finally {
      setIsLoading(false);
      stopRotation();
    }
  };

  useEffect(() => {
    fetchLitFiresCount();
  }, []);

  const fireSpots = Array.from({ length: 5 }, (_, index) => (
    <Image
      key={index}
      source={index < litFiresCount ? require('./assets/fire.gif') : require('./assets/fire_bw.png')}
      style={styles.fireImage}
    />
  ));

  return (
    <View style={styles.container}>
      <View style={styles.fireContainer}>{fireSpots}</View>
      {isLoading ? (
        <Animated.Image
          source={require('./assets/refresh.png')}
          style={[styles.buttonImage, { transform: [{ rotate: rotation }] }]}
        />
      ) : (
        <TouchableOpacity onPress={fetchLitFiresCount}>
          <Image
            source={require('./assets/refresh.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireContainer: {
    flexDirection: 'row',
  },
  buttonImage: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
    marginTop: 20,
  },
  fireImage: {
    width: 50,
    height: 50,
  },
});

export default HomePage;
