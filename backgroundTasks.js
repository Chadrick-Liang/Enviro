import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GOOGLE_API_KEY } from "@env";
import { addPoints } from "./api/firebase";
import { ToastAndroid, AppState } from "react-native";
import dayjs from "dayjs";

const minimumDistance = 400;
const maximumSpeed = 5;
export const INTERVAL_TIME_MS = 900000; // 15 minutes

export const performLocationTask = async (
  userID,
  previousStartTime,
  currentLocation,
  lastLocation
) => {
  if (!currentLocation) return;

  try {
    const startTime = dayjs().valueOf();

    if (!lastLocation) {
      await AsyncStorage.setItem(
        "lastLocation",
        JSON.stringify(currentLocation)
      );
      console.log("set Location");
      return;
    }

    if (previousStartTime) {
      if (dayjs().valueOf() - previousStartTime < INTERVAL_TIME_MS) {
        return;
      }
    } else {
      await AsyncStorage.setItem("lastTime", dayjs().valueOf().toString());
      return;
    }

    await AsyncStorage.setItem("lastLocation", JSON.stringify(currentLocation));
    await AsyncStorage.setItem("lastTime", startTime.toString());

    const lastLocationJSON = JSON.parse(lastLocation);

    const averageSpeed = calculateAverageSpeed(
      lastLocationJSON,
      currentLocation,
      INTERVAL_TIME_MS
    );

    const distanceByWalking = calculateDistance(lastLocationJSON, currentLocation);

    console.log(averageSpeed, "End of round. AverageSpeed");
    console.log(distanceByWalking, "End of round. DistanceByWalking");

    if (averageSpeed > maximumSpeed) {
      ToastAndroid.show(
        `You Earned no points as you were too fast (${averageSpeed.toFixed(2)}km/s)`,
        ToastAndroid.SHORT
      );
      return;
    }
    if (distanceByWalking < minimumDistance) {
      ToastAndroid.show(
        `You Earned no points as you traveled too less (${distanceByWalking.toFixed(2)} meters)`,
        ToastAndroid.SHORT
      );
      return;
    }

    let distanceByCar = null;
    let attempt = 0;
    const maxRetries = 10;
    const interval = 5000;

    while (attempt < maxRetries) {
      try {
        distanceByCar = await getDistanceByCar(lastLocationJSON, currentLocation);
        console.log(`Distance by car: ${distanceByCar}`);
        break; // Exit the loop if the call is successful
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error(`Failed after ${maxRetries} attempts`);
          break; // Exit the loop after reaching max retries
        }
        console.log(
          `Attempt ${attempt} failed. Retrying in ${interval / 1000} seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    if (distanceByCar){
      const pointsEarned = (Math.round(distanceByCar) * 0.04).toFixed(2);
      ToastAndroid.show(`You earned ${pointsEarned} points, travelling ${distanceByWalking.toFixed(2)}m at an average speed of ${averageSpeed}`, ToastAndroid.SHORT);
      await addPoints(userID, pointsEarned);

      const newLog = {
        pointsEarned,
        startTime: lastTime,
        endTime: startTime,
        startLocation: {
          coords: {
            longitude: lastLocationJSON.coords.longitude,
            altitude: lastLocationJSON.coords.altitude,
            latitude: lastLocationJSON.coords.latitude,
          },
        },
        endLocation: {
          coords: {
            longitude: currentLocation.coords.longitude,
            altitude: currentLocation.coords.altitude,
            latitude: currentLocation.coords.latitude,
          },
        },
        averageSpeed,
        distanceByCar,
        distanceByWalking,
      }

      const userDataString = await AsyncStorage.getItem(userID);

      const userData = userDataString
      ? JSON.parse(userDataString)
      : { pointsLog: [], TrackerLog: [], materialLog: [] };

      if (!userData.TrackerLog) {
        userData.TrackerLog = [newLog];
      } else {
        userData.TrackerLog.push(newLog);
      }

      await AsyncStorage.setItem(userID, JSON.stringify(userData)).catch(
        (err) => {
          console.error("Error saving log to AsyncStorage:", err);
        }
      );

      console.log("Interval completed successfully")
    }else{
      throw "Location API Failed"
    }

  } catch (error) {
    console.error("Task failed:", error);
  }
};

async function getDistanceByCar(startLocation, endLocation) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${startLocation.coords.latitude},${startLocation.coords.longitude}&destinations=${endLocation.coords.latitude},${endLocation.coords.longitude}&key=${GOOGLE_API_KEY}`
    );
    const data = await response.json();
    return data.rows[0].elements[0].distance.value;
  } catch (error) {
    console.error("Error fetching distance from Google API:", error);
    return 0;
  }
}

export function calculateAverageSpeed(startLocation, endLocation, interval) {
  const distance = calculateDistance(startLocation, endLocation);
  const timeInSeconds = interval / 1000;
  return (distance / timeInSeconds) * 3.6; // Convert m/s to km/h
}

export function calculateDistance(startLocation, endLocation) {
  const lat1 = startLocation.coords.latitude;
  const lon1 = startLocation.coords.longitude;
  const lat2 = endLocation.coords.latitude;
  const lon2 = endLocation.coords.longitude;

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
