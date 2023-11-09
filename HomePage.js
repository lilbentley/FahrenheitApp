import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Animated, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Shadow } from 'react-native-shadow-2';

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
  const [error, setError] = useState(null);
  const { rotation, startRotation, stopRotation } = useRotateAnimation();
  const [mostSevereArticle, setMostSevereArticle] = useState('');


  const formatText = (text) => {
    if (typeof text !== 'string') {
      // Return a default message or just an empty string if text is not a string
      return '';
    }
    let formattedText = text
      .replace(/\d+\)/g, '') // Remove the numbering like "1)"
      .replace(/([a-z0-9"])([A-Z])/g, '$1. $2') // Add period between sentences without proper punctuation
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trimStart(); // Remove spaces at the beginning of the message
  
    return formattedText;
  };

  const fetchLitFiresCount = async () => {
    setIsLoading(true);
    setError(null); // Reset error state before making a new request
    startRotation();
    try {
      const response = await fetch('http://10.0.2.2:3000/api/count');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();


      if (data.mostSevereArticleContent) {
        const formattedText = formatText(data.mostSevereArticleContent);
        setMostSevereArticle(formattedText);
      } else {
        // Handle the case where mostSevereArticleContent is not provided
        setMostSevereArticle('No content available.');
      }


      
    } catch (error) {
      console.error('Failed to fetch lit fires count:', error);
      setError('Failed to connect to the server. Please try again later.'); // Set error message
    } finally {
      setIsLoading(false);
      stopRotation();
    }
  };

  useEffect(() => {
    fetchLitFiresCount();
    setMostSevereArticle('Loading article...');
  }, []);

  const fireSpots = Array.from({ length: 5 }, (_, index) => (
    <Image
      key={index}
      source={index < litFiresCount ? require('./assets/fire.gif') : require('./assets/fire_bw.png')}
      style={styles.fireImage}
    />
  ));

  return (
    <LinearGradient
      colors={['#ad7676', '#5b868f']} // Use your own gradient colors
      style={styles.linearGradient}
    >
      <View style={styles.container}>
      <Text style={styles.title}>Fahrenheit</Text>

      <View style={styles.articleShadowContainer}>
          <Shadow
            style={styles.shadow}
            startColor={'#00000030'}
            finalColor={'#00000000'}
            offset={[0, 0]}
            distance={10}
            paintInside={false}
          >
            <View style={styles.articleContainer}>
              <Text style={styles.articleText}>{mostSevereArticle}</Text>
            </View>
          </Shadow>
        </View>

      {error && <Text style={styles.errorText}>{error}</Text>} 
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({

  linearGradient: {
    flex: 1,
  },
  
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
    marginTop: 50,
    
  },
  fireImage: {
    width: 50,
    height: 50,
    
  },
  errorText: {
    color: 'red', // You can style your error message as you like
    textAlign: 'center',
    margin: 10,
  },

  title: {
    fontSize: 56,
    fontFamily: 'BonaNova-Regular', // Replace with the actual name of your custom font
    textAlign: 'center',
    color: '#efefef',
    width: 500,
    height: 200,
    
    

    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 5, height: 10},
    textShadowRadius: 70,
   
  },

  articleShadowContainer: {
    alignSelf: 'stretch',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  shadow: {
    borderRadius: 20,
    alignSelf: 'stretch', // Ensure the shadow stretches to match the width of the article container
  },
  articleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
    padding: 20,
    borderRadius: 20,
    height: 200, // Fixed height for the article container
  },
  articleText: {
    fontFamily: 'BonaNova-Regular', // Replace with the actual name of your custom font
    fontSize: 18,
    color: '#333', // Dark text color for readability
  },
  

});

export default HomePage;
