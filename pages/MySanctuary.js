import React, { useRef, useEffect, useState } from "react";
import { Video } from "expo-av";
import { View, StyleSheet, Text } from "react-native";
import SanctuaryAnimation from "../components/SanctuaryAnimation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppContext } from "../Context";
import dayjs from "dayjs";

const MySanctuary = () => {
  const { state } = useAppContext();
  const { userID } = state;

  const [points, setPoints] = useState(null);

  const fetchLogsFromStorage = async (userID) => {
    try {
      const itemString = await AsyncStorage.getItem(userID);

      if (!itemString) {
        setPoints(30);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const items = JSON.parse(itemString);
      const totalPoints = items.pointsLog
        .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
        .filter((log) => {
          const logDate = new Date(log.date);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === today.getTime();
        })
        .reduce((total, log) => total + log.points, 0);
      setPoints(totalPoints ? totalPoints + 30 : 30);
    } catch (error) {
      setPoints(30);
    }
  };

  useEffect(() => {
    fetchLogsFromStorage(userID);
  }, [userID,state]);

  return points  && <ViewSanctuary points={points} />;
};

export function ViewSanctuary({ points, name = null }) {
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) {
        video.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <Text style={{ fontWeight: "bold", color: "white", fontSize: 20 }}>
          {name ? `${name}'s Sanctuary` : "My Sanctuary"}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(points, 100)}%` }, // Ensure the width does not exceed 100%
            ]}
          />
        </View>
        <Text style={styles.progressText}>{points}</Text>
      </View>
      <SanctuaryAnimation points={points} />
    </View>
  );
}

export default MySanctuary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  progressBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: 50, // Adjust this value to set the distance between the progress bar and the top of the video
    zIndex: 20,
  },
  progressBar: {
    width: "80%", // Adjust this value to set the width of the progress bar
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#76c7c0",
    borderRadius: 10,
  },
  progressText: {
    position: "relative",
    bottom: 20,
    fontSize: 16,
    color: "#000",
  },
});
