// App.js
import React, { useEffect } from "react";
import { StyleSheet, AppState, LogBox } from "react-native";
LogBox.ignoreAllLogs();
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import MySanctuary from "./pages/MySanctuary";
import Map from "./pages/Map";
import Camera from "./pages/Camera";
import Leaderboard from "./pages/Leaderboard";
import Statistics from "./pages/Statistics";
import Login from "./pages/Login";

import { AppProvider, useAppContext } from "./Context";

import { requestPermissions } from "./permissions";
import { performLocationTask, INTERVAL_TIME_MS } from "./backgroundTasks";

const Tab = createBottomTabNavigator();

function MainApp() {
  const { state, dispatch } = useAppContext();
  const { userID, lastTime, lastLocation, currentLocation } = state;

  useEffect(() => {
    if (userID) {
      async function syncStorage() {
        try {
          let lastTime = await AsyncStorage.getItem("lastTime");
          let lastLocation = await AsyncStorage.getItem("lastLocation");

          const locationRequestOptions = {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
          };

          const currentLocation = await Location.getCurrentPositionAsync(
            locationRequestOptions
          );

          if (currentLocation) {
            performLocationTask(
              userID,
              lastTime,
              currentLocation,
              lastLocation
            );
          }

          dispatch({ type: "SET_STORAGE_TIME", payload: lastTime });
          dispatch({ type: "SET_STORAGE_LOCATION", payload: lastLocation });
          dispatch({ type: "SET_CURRENT_LOCATION", payload: currentLocation });
        } catch (error) {
          console.error(error);
        }
      }

      function loopSyncStorage() {
        syncStorage().then(() => {
          setTimeout(loopSyncStorage, 1000);
        });
      }

      (async () => {
        const userExists = await AsyncStorage.getItem(userID);

        if (!userExists) {
          const userData = {
            TrackerLog: [],
            pointsLog: [],
            materialLog: [],
          };
          await AsyncStorage.setItem(userID, JSON.stringify(userData));
        }

        const permissionsGranted = await requestPermissions();
        if (!permissionsGranted) return;

        loopSyncStorage();
      })();
    }
  }, [userID, dispatch]);

  return (
    <NavigationContainer>
      {userID ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "My Sanctuary") {
                iconName = focused ? "home" : "home-outline";
              } else if (route.name === "Map") {
                iconName = focused ? "map" : "map-outline";
              } else if (route.name === "Camera") {
                iconName = focused ? "camera" : "camera-outline";
              } else if (route.name === "Leaderboard") {
                iconName = focused ? "trophy" : "trophy-outline";
              } else if (route.name === "Statistics") {
                iconName = focused ? "stats-chart" : "stats-chart-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "#3ACF3A",
            tabBarInactiveTintColor: "gray",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerStyle: {
              backgroundColor: "#2B485A",
            },
            headerTintColor: "#fff",
          })}
        >
          <Tab.Screen
            name="My Sanctuary"
            component={MySanctuary}
            initialParams={{ userID: userID }}
          />
          <Tab.Screen name="Map" component={Map} />
          <Tab.Screen
            name="Camera"
            component={Camera}
            initialParams={{ userID: userID }}
          />
          <Tab.Screen
            name="Leaderboard"
            component={Leaderboard}
            initialParams={{ userID: userID }}
          />
          <Tab.Screen
            name="Statistics"
            component={Statistics}
            initialParams={{ userID: userID }}
          />
        </Tab.Navigator>
      ) : (
        <Login setAppUserID={(id) => dispatch({ type: 'SET_USER_ID', payload: id })} />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
