import React, { useRef, useEffect, useState } from "react";
import { Video } from "expo-av";
import { View, StyleSheet, Text } from "react-native";

const ProgressBar = ({ progress = 0 }) => {
  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );
};

const SanctuaryAnimation = ({ username = null, points = 50 }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) {
        video.unloadAsync();
      }
    };
  }, []);

  const getVideoSource = () => {
    if (points > 60) {
      return "https://firebasestorage.googleapis.com/v0/b/enviro-62562.appspot.com/o/Stage2.mp4?alt=media&token=fdd93b0a-40a8-46c2-bd82-0bc188cea77a"; // Replace with your Firebase URL
    } else if (points > 30) {
      return "https://firebasestorage.googleapis.com/v0/b/enviro-62562.appspot.com/o/Stage1.mp4?alt=media&token=4c4ca3de-04d8-4a0e-8e32-5ed0a879b7c1"; // Replace with your Firebase URL
    } else {
      return "https://firebasestorage.googleapis.com/v0/b/enviro-62562.appspot.com/o/Stage0.mp4?alt=media&token=1738ee39-8ccd-4768-9f49-b8e8669edba0"; // Replace with your Firebase URL
    }
  };

  return (
      <Video
        ref={videoRef}
        source={{ uri: getVideoSource() }} // Pass the URI instead of requiring assets
        resizeMode="cover"
        shouldPlay
        isLooping
        style={styles.video}
        onError={(error) => {
          console.error("Video playback error:", error);
        }}
        onLoad={() => {
          console.log("loading");
        }}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish && !status.isLooping) {
            videoRef.current.setPositionAsync(0);
          }
        }}
      ></Video>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // Needed to position the progress bar container relative to the video
  },
  video: {
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  progressBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: 20, // Adjust this value to set the distance between the progress bar and the top of the video
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
    marginTop: 5,
    fontSize: 16,
    color: "#000",
  },
});

export default SanctuaryAnimation;
