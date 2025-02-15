import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Identifier from './Camera_initial';
import Camera_success from './Camera_success';
import Camera_failure from './Camera_failure';

import { Button, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';


const Stack = createNativeStackNavigator();

export default function Camera() {

  return (
    <Stack.Navigator initialRouteName='Camera_initial'>
      <Stack.Screen name='AIdentifier' component={Identifier} />
      <Stack.Screen name='Recyclable' component={Camera_success} />
      <Stack.Screen name='Not Recyclable' component={Camera_failure} />
    </Stack.Navigator>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});