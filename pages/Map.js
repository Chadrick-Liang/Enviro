
import { Dimensions, StyleSheet, Text, View, Image, ScrollView } from 'react-native';
import { useState, useEffect, useRef } from 'react';


import MapView, { Marker } from 'react-native-maps';
import * as Location from "expo-location";

import binCoordinates from '../assets/lat_lng_data.json'

import { GOOGLE_API_KEY } from '@env'
import MapViewDirections from 'react-native-maps-directions';

import BottomSheet, { BottomSheetMethods } from '@devvie/bottom-sheet';
import { askGoogle } from '../api/googleApi';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
/*latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,*/

function calculateDistance(startLocation, endLocation) {
  const lat1 = startLocation.myLocation.latitude;
  const lon1 = startLocation.myLocation.longitude;
  const lat2 = parseFloat(endLocation.coord.lat);
  const lon2 = parseFloat(endLocation.coord.lng);
  //console.log(lat1);

  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
    Math.cos(phi2) *
    Math.sin(deltaLambda / 2) *
    Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

export default function Map() {

  const initialLocation = {
    latitude: 1.372000,
    longitude: 103.796346,
    latitudeDelta: 0.3600,
    longitudeDelta: 0.3600,
  }


  const [myLocation, setMyLocation] = useState(null);
  const [nearestKeyList, setKeyList] = useState([]);

  const [directionsRequested, requestDirections] = useState(true);
  /*const[destLat, setDestLat] = useState(null);
  const[destLng, setDestLng] = useState(null);*/
  const [destCoord, setDestCoord] = useState(null);

  const [directions, setDirections] = useState("Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.")

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setMyLocation(currentLocation.coords)
      //console.log(myLocation.latitude)
      //console.log(myLocation.longitude)
      let distanceList = [];
      if (myLocation) {
        binCoordinates.map((coord) => (distanceList.push(calculateDistance({ myLocation }, { coord }))));
      }

      //console.log(distanceList);
      let sortedValues = [...distanceList].sort((a, b) => a - b);
      let smallestValues = sortedValues.slice(0, 10);
      let keyList = [];
      for (let i = 0; i < smallestValues.length; i++) {
        keyList.push(distanceList.indexOf(smallestValues[i]));
      }
      //console.log(keyList);
      setKeyList([...keyList]);
      //console.log(nearestKeyList);

    }
    catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    getLocation();
    //console.log(my current location is ${myLocation.latitude}, ${myLocation.longitude})
    //console.log(nearestKeyList);

  }, [myLocation])

  const sheetRef = useRef(null);

  const updateTextAndOpen = async (dest) => {
    let newText = await askGoogle(`${myLocation.latitude},${myLocation.longitude}`, `${dest}`);
    setDirections(newText)
    sheetRef.current?.open();
  }
  //coord.title
  return (
    <View style={styles.container}>
      {myLocation ? (
        <View>
          <MapView
            style={styles.map}
            initialRegion={{
              ...myLocation,
              latitudeDelta: 0.0300,
              longitudeDelta: 0.0300,
            }}
            Region={{
              ...myLocation,
              latitudeDelta: 0.0300,
              longitudeDelta: 0.0300,
            }}
            provider='google'
          >
            <Marker
              coordinate={{
                latitude: myLocation.latitude,
                longitude: myLocation.longitude
              }}
              title='My Location'
              description='Current location coordinates'
            />

            {
              binCoordinates.map(function renderMarkers(coord) {
                //console.log(nearestKeyList)
                if (nearestKeyList.includes(coord.key)) {
                  return (
                    <Marker
                      coordinate={{
                        latitude: parseFloat(coord.lat),
                        longitude: parseFloat(coord.lng),
                      }}
                      title={coord.title}
                      description={coord.desc}
                      key={coord.key}
                      onPress={() => {
                        requestDirections(true);
                        setDestCoord({
                          latitude: parseFloat(coord.lat),
                          longitude: parseFloat(coord.lng)
                        });
                        //console.log(`This is input origin ${myLocation.latitude},${myLocation.longitude}`);
                        //console.log(`this is input destination ${coord.title}`)
                        updateTextAndOpen(coord.title);
                        /*console.log(directionsRequested);
                        console.log(destCoord)*/
                      }}
                    >
                      <Image
                        source={require('../assets/bin.png')}
                        style={styles.markerImage}
                      />
                    </Marker>
                  );
                } else {
                  //console.log('fail');
                }
              })
            }

            { //directionsRequested &&
              <MapViewDirections
                origin={{ latitude: myLocation.latitude, longitude: myLocation.longitude }}
                destination={destCoord}
                apikey={GOOGLE_API_KEY}
                strokeWidth={5}
                strokeColor='blue'
                optimizeWaypoints={true}
                mode="WALKING"
                precision='high'
              />}


          </MapView>
          <BottomSheet
            style={{ padding: 30 }}
            ref={sheetRef}
            customBackdropComponent={() => {
              return (<View style={{
                height: '100%', backgroundColor: 'black',
                /*zIndex: 999*/
                opacity: 0,
              }}
                onPress={() => console.log('pressed')}
                customBackdropPosition="top"></View>);
            }}
            closeOnBackdropPress={true}>
            <ScrollView style={{ paddingBottom: 200 }}>
              <Text
                onPress={() => sheetRef.current?.close()}
                style={{ fontSize: 13, fontWeight: 'bold' }}>
                {directions}
              </Text>
            </ScrollView>
          </BottomSheet>
        </View>
      ) : /*(
        <MapView
          style={styles.map}
          initialRegion={initialLocation}
          provider='google'
        >
        </MapView>
      )*/null}
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
  map: {
    width: windowWidth,
    height: windowHeight,
  },
  markerImage: {
    width: 45,
    height: 45,
  }
});