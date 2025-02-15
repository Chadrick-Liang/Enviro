import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, Image, ImageBackground, View } from 'react-native';

const Camera_success = ({ navigation, route }) => {

  const data = route.params.uri;
  const pointsAwarded = route.params.pointsAwarded
  //console.log(data);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={data ? { uri: data } : require('../assets/splash_tree.png')} style={styles.image} resizeMethod='cover' blurRadius={8}>
        <View style={styles.container}>
          <Image style={styles.logo} source={require('../assets/green_tick.png')} />
          <Text style={styles.text}>RECYCLABLE!</Text>
          <Text style={styles.points}>+{pointsAwarded} eco points</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
          navigation.pop();
          navigation.navigate('Map')}}>
          <Text style={{ color: "white", fontWeight: '500', fontSize: 25 }}>Locate Bin</Text>
        </TouchableOpacity>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#f0f0f0',
  },
  image: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'space-around',
    width: '100%',
  },
  logo: {
    maxWidth: 100,
    maxHeight: 100,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 35,
    color: '#3ACF3A',
    fontWeight: 'bold',
  },
  points: {
    fontSize: 25,
    color: '#3ACF3A',
    fontWeight: 'bold',
  },
  button: {
    alignItems: "center",
    padding: 10,
    width: '95%',
    borderRadius: 5,
    backgroundColor: '#228C22',
    marginBottom: '10%',
  },
});

export default Camera_success;
