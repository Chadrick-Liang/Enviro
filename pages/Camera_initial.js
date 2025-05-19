import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from "react-native-vector-icons/Ionicons";
import * as MediaLibrary from 'expo-media-library';

import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, Modal, ActivityIndicator } from 'react-native';

import { sendToOpenAI } from '../firebaseConfig';
import { addMaterialPoints, convertTypeToPoints } from '../api/firebase';

import { useAppContext } from '../Context';

export default function Identifier({ navigation }) {
  const {state} = useAppContext()
  const {userID} = state


  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState('off');
  const [loading, setLoading] = useState(false);  // State for loading indicator
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      const photoUpload = photo.base64;
      const photoUri = photo.uri;

      console.log('Base64 String:', photoUpload.slice(0, 100) + '...');
      console.log(`URI: ${photoUri}`);

      setLoading(true);  // Show loading indicator
      try {
        let apiResponse = null

        while (!apiResponse) {
          try {
            apiResponse = await sendToOpenAI(photoUpload);
            console.log(`API Response: ${apiResponse}`);
          } catch (error) {
            console.error(`Error while sending to OpenAI: ${error.message}`);
          }
        }
        
        if (apiResponse) {
          const jsonString = apiResponse.replace(/'/g, '"');
          console.log(`JSON String: ${jsonString}`);
          const jsonResult = JSON.parse(jsonString);
          console.log(`the answer is ${jsonResult.isRecyclable}`)

          if (jsonResult.isRecyclable == 'yes' || jsonResult.recyclable == 'yes') {
            //since firebase disabled, turn off points award query.
            //let pointsAwarded = await convertTypeToPoints(userID, jsonResult.materialType)
            //await addMaterialPoints(userID, pointsAwarded, jsonResult.materialType)
            //navigation.push('Recyclable', { uri: photoUri, pointsAwarded });
            navigation.push('Recyclable', { uri: photoUri});
          } else {
            navigation.push('Not Recyclable', { uri: photoUri });
          } 
        }



      } catch (error) {
        Alert.alert('Error', 'An error occurred while processing the photo.');
        console.error('Error:', error);
      } finally {
        setLoading(false);  // Hide loading indicator
      }
    }
  };

  function toggleFlash() {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} flash={flash}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleFlash}>
            {flash === 'off' ? (
              <Ionicons name={'flash-off'} size={35} color={'white'} />
            ) : (
              <Ionicons name={'flash'} size={35} color={'white'} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Ionicons name={'radio-button-on-sharp'} size={60} color={'white'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Ionicons name={'camera-reverse'} size={35} color={'white'} />
          </TouchableOpacity>
        </View>
      </CameraView>

      {loading && (
        <Modal
          transparent={true}
          animationType="none"
          visible={loading}
          onRequestClose={() => {}}
        >
          <View style={styles.modalBackground}>
            <View style={styles.activityIndicatorWrapper}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'black',
    height: 150,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute'
  },
  button: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
});
