import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export async function requestPermissions() {
  try {
    let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return false;
    }

    let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      Alert.alert('Permission to access background location was denied');
      return false;
    }

    const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
    if (notificationStatus !== 'granted') {
      Alert.alert('Permission to send notifications was denied');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    Alert.alert('An error occurred while requesting permissions');
    return false;
  }
}
