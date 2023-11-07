import React, { useState } from 'react';
import { View, Image, StyleSheet, TextInput, Button, Alert } from 'react-native';


const HomePage = () => {
  const [litFiresCount] = useState(4);
 

  const fireSpots = new Array(5).fill(0);

 
  
  return (
    <View style={styles.container}>
      <View style={styles.fireContainer}>
        {fireSpots.map((_, index) => (
          <Image
            key={index}
            source={index < litFiresCount ? require('./assets/fire.gif') : require('./assets/fire_bw.png')}
            style={styles.fireImage}
          />
        ))}
      </View>

      <View style={styles.loginForm}>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <Button title="Send Phone Number" onPress={handleSendPhoneNumber} />

        <TextInput
          style={styles.input}
          placeholder="Confirmation Code"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
        />
        <Button title="Verify Code" onPress={handleSendCode} />
      </View>
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
  loginForm: {
    marginVertical: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  },
  fireImage: {
    width: 50,
    height: 50,
  },
});

export default HomePage;
