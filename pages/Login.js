import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, ImageBackground, TextInput, TouchableOpacity, Image, Pressable, ToastAndroid, Keyboard } from 'react-native';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const image = require('../assets/splash_tree.png');

export default function Login({ setAppUserID }) {

  const [email, setEmail] = useState('test@gmail.com');
  const [password, setPassword] = useState('123456');

  /*const [fontsLoaded] = useFonts({
    "Sf": require("../assets/fonts/sf.OTF"),
  })

  if (!fontsLoaded) {
    return undefined;
  }*/

  const onHandleSignIn = async () => {
    Keyboard.dismiss()
    try {
      if (email !== '' && password !== '') {
        let userCredentials = await signInWithEmailAndPassword(auth, email, password);
        if (userCredentials.user && userCredentials.user.uid) {
          setAppUserID(userCredentials.user.uid)
        } else {
          const showToast = () => {
            ToastAndroid.show('Unable to Sign in', ToastAndroid.SHORT);
          };
          showToast()
        }
      }

    } catch (error) {
      const showToast = () => {
        ToastAndroid.show('Invalid Email or password', ToastAndroid.SHORT);
      };
      showToast()
    }

  };

  return (
    <View style={styles.container}>
      <ImageBackground source={image} style={styles.image} resizeMethod='cover'>
        <View style={styles.page}>
          <Text style={styles.header}>Welcome! Let's protect mother Earth together!</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter email'
            autoCapitalize='none'
            keyboardType='email-address'
            textContentType='emailAddress'
            value={email}
            onChangeText={text => setEmail(text)} />
          <TextInput
            style={styles.input}
            placeholder='Enter password'
            autoCapitalize='none'
            autoCorrect={false}
            secureTextEntry={true}
            textContentType='password'
            value={password}
            onChangeText={text => setPassword(text)} />
          <TouchableOpacity
            style={styles.button}
            onPress={onHandleSignIn}>
            <Text style={{ color: "white", fontWeight: '500', fontSize: 25 }}>Login</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'center',
    width: '100%',
  },
  page: {
    width: '95%',
    height: '90%',
    padding: '2%',
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: "center",
    justifyContent: 'flex-start',
    padding: 10
  },
  header: {
    fontSize: 35,
    marginTop: '15%',
    marginBottom: '10%',
  },
  input: {
    backgroundColor: '#E8ECF4',
    width: '95%',
    height: 50,
    borderRadius: 5,
    padding: 10,
    margin: 15,
  },
  button: {
    alignItems: "center",
    padding: 10,
    width: '95%',
    borderRadius: 5,
    backgroundColor: '#2B485A',
    marginTop: '10%',
  },
});
