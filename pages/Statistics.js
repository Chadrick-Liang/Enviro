import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PointsGraph from "../components/PointsGraph";
import {
  INTERVAL_TIME_MS,
  calculateAverageSpeed,
  calculateDistance,
} from "../backgroundTasks";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { getUser, addPoints, resetAll } from "../api/firebase";
import EcoPointsInfo from "../components/EcoPointsInfo";
import dayjs from "dayjs";
import { useAppContext } from "../Context";

export default function Statistics() {
  const { state } = useAppContext();
  const { userID, storageLocation, currentLocation, storageTime } = state;

  const [logs, setLogs] = useState([]);
  const [pointsLog, setPointsLog] = useState([]);
  const [materialLog, setMaterialLog] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPoints, setTotalPoints] = useState(null);
  const [timeDifference, setTimeDifference] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [storage, setStorage] = useState(null);

  const [pointsGraphData, setPointsGraphData] = useState(Array(7).fill(0));

  const processPointsData = (pointsLog) => {
    const now = dayjs();
    const weekStart = now.startOf("week");
    let weekPoints = Array(7).fill(0);

    pointsLog.forEach((point) => {
      const pointDate = dayjs(point.date);
      const diff = pointDate.diff(weekStart, "day");
      if (diff >= 0 && diff < 7) {
        weekPoints[diff] += point.points;
      }
    });

    return weekPoints;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (storageTime) {
        const targetTime = dayjs(Number(storageTime)).add(
          INTERVAL_TIME_MS,
          "millisecond"
        );
        setTimeDifference(calculateTimeDifference(targetTime));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [storageTime]);

  // const fetchLogs = async () => {
  //   setLoading(true);
  //   setError("");
  //   try {
  //     // const storedLogs = await fetchLogsFromStorage();
  //     // setLogs(storedLogs);
  //   } catch (err) {
  //     console.error("Error fetching logs:", err);
  //     setError(err.message);
  //     Alert.alert("Error", err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const calculateTimeDifference = (targetDate) => {
    const now = dayjs();
    const targetTime = targetDate;

    const timeDifferenceMs = targetTime.diff(now);

    if (timeDifferenceMs <= 0) {
      return "The target date is in the past.";
    }

    const minutes = Math.floor(timeDifferenceMs / (1000 * 60));
    const seconds = Math.floor((timeDifferenceMs % (1000 * 60)) / 1000);

    return `${minutes} minutes and ${seconds} seconds to next interval`;
  };

  const fetchLogsFromStorage = async () => {
    try {
      setLoading(true);
      setError("");
      const itemString = await AsyncStorage.getItem(userID);
      console.log(itemString);
      setStorage(itemString);

      if (!itemString) {
        setLogs([]);
        setPointsLog([]);
        setMaterialLog([]);
        return [];
      }

      const items = JSON.parse(itemString);
      const sortedPointsLog = items.pointsLog.sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
      );
      setPointsLog(sortedPointsLog);

      const weekPoints = processPointsData(sortedPointsLog);
      setPointsGraphData(weekPoints);

      const materialLog = items.materialLog.sort(
        (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
      );

      if (materialLog) {
        setMaterialLog(materialLog);
      } else {
        setMaterialLog([]);
      }

      const mergedLogs = [
        ...items.TrackerLog.map((item) => ({
          ...item,
          logType: "Tracker",
        })),
        ...items.materialLog.map((item) => ({
          ...item,
          logType: "Material",
        })),
      ].sort(
        (a, b) =>
          dayjs(a.date ?? a.endTime).valueOf() -
          dayjs(b.date ?? b.endTime).valueOf()
      );

      console.log(
        mergedLogs.map((item) => dayjs(item.date ?? item.endTime)),
        "times"
      );
      setLogs(mergedLogs ?? []);
    } catch (error) {
      console.error("Error fetching logs from AsyncStorage:", error);
      setError(error);
    }
  };

  useEffect(() => {
    fetchLogsFromStorage();
    const interval = setInterval(fetchLogsFromStorage, INTERVAL_TIME_MS);
    return () => clearInterval(interval);
  }, []);

  const loadUserPoints = async () => {
    try {
      const userDetails = await getUser(userID);
      setTotalPoints(userDetails.EcoPoints);
    } catch (error) {
      console.error("Error loading user points:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    loadUserPoints();
  }, []);

  return (
    <FlatList
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await loadUserPoints();
            await fetchLogsFromStorage();
            setRefreshing(false);
          }}
        />
      }
      style={styles.container}
      data={logs}
      ListHeaderComponent={
        <>
          {/* <Button title={"reset"} onPress={() => resetAll(userID)} />
          <Button
            title={"Add Points"}
            onPress={() =>
              addPoints(userID, 5, dayjs().subtract(1, "day").toISOString())
            }
          /> */}
          {/* <Text>{storage}</Text> */}

          <View style={styles.card}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardText}>You've restored</Text>
                <Text style={styles.cardPoints}>
                  {totalPoints ?? "Loading"}
                </Text>
                <Text style={styles.cardText}>Eco Points</Text>
                <EcoPointsInfo />
              </View>
              <Image
                source={require("../assets/Trees.png")}
                style={styles.cardImage}
              />
            </View>
          </View>
          {/* <Text>{storageTime}</Text>
          <Text>{storageLocation}</Text> */}
          {currentLocation && storageLocation && (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <AnimatedCircularProgress
                size={130}
                width={10}
                fill={
                  (calculateDistance(
                    JSON.parse(storageLocation),
                    currentLocation
                  ) /
                    0.4) *
                  100
                }
                tintColor="#A4E0B8"
                backgroundColor="#039016"
                style={{ alignItems: "center", justifyContent: "center" }}
              >
                {(fill) => (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {(
                        calculateDistance(
                          JSON.parse(storageLocation),
                          currentLocation
                        ) / 1000
                      ).toFixed(2)}
                    </Text>
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "white" }}>Kilometers</Text>
                    </View>
                    <Text style={{ color: "white" }}>Traveled</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>
          )}

          {currentLocation ? (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: 10,
                  marginRight: 10,
                  gap: 20,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    padding: 12,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <AnimatedCircularProgress
                    size={130}
                    width={10}
                    fill={(currentLocation.coords.speed / 5) * 100}
                    tintColor="#039016"
                    backgroundColor="#A4E0B8"
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    {() => (
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {currentLocation.coords.speed.toFixed(2)}
                        </Text>
                        <View
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "white" }}>km/h</Text>
                        </View>
                        <Text style={{ color: "white" }}>Speed</Text>
                      </View>
                    )}
                  </AnimatedCircularProgress>
                </View>

                <View
                  style={{
                    flex: 1,
                    padding: 12,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <AnimatedCircularProgress
                    size={130}
                    width={10}
                    fill={
                      (calculateAverageSpeed(
                        JSON.parse(storageLocation),
                        currentLocation,
                        dayjs().valueOf() - storageTime
                      ) /
                        5) *
                      100
                    }
                    tintColor="#039016"
                    backgroundColor="#A4E0B8"
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    {(fill) => (
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {calculateAverageSpeed(
                            JSON.parse(storageLocation),
                            currentLocation,
                            dayjs().valueOf() - storageTime
                          ).toFixed(2)}
                        </Text>
                        <View
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "white" }}>km/h</Text>
                        </View>
                        <Text style={{ color: "white" }}>Av. Speed</Text>
                      </View>
                    )}
                  </AnimatedCircularProgress>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: "#A4E0B8",
                  borderRadius: 14,
                  padding: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 7,
                  elevation: 5,
                  marginBottom: 10,
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "#333333",
                    fontWeight: "500",
                    textAlign: "center",
                  }}
                >
                  Since{" "}
                  {new Date(Number(storageTime)).toLocaleTimeString("en-US", {
                    hour12: false,
                  })}
                  , {timeDifference}
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  color: "white",
                  textAlign: "center",
                }}
              >
                Loading speed data...
              </Text>
              <ActivityIndicator />
            </View>
          )}
          <View style={{ marginTop: 20 }}>
            <Text
              style={{ marginLeft: 16, color: "white", fontWeight: "bold" }}
            >
              Eco Points gained this week:{" "}
            </Text>
          </View>

          <PointsGraph data={pointsGraphData} />
        </>
      }
      ListFooterComponent={
        <>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text>
              {logs.length > 0
                ? logs.map((log) => <Text key={log.key}>{log.key}, </Text>)
                : "No logs available"}
            </Text>
          )}
        </>
      }
      renderItem={renderLogItem}
      keyExtractor={(item) => item.key}
      ListEmptyComponent={<Text style={styles.emptyText}>No Past History</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#2B485A",
  },
  card: {
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EBEDDD",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    margin: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardText: {
    fontSize: 18,
    fontWeight: "400",
    color: "#333",
  },
  cardPoints: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4caf50",
  },
  cardImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  infoBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#e0ffe0",
    borderRadius: 10,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#006400",
    marginBottom: 10,
  },
  logItem: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: "#6A976A",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 3,
  },
  logText: {
    fontSize: 16,
    color: "white",
  },
  boldText: {
    fontWeight: "bold",
    color: "white",
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

const renderLogItem = ({ item }) => {
  if (item.logType === "Tracker") {
    return (
      <View style={styles.logItem}>
        <Text style={{ color: "white" }}>Eco Tracker</Text>
        <Text style={styles.logText}>
          You gained <Text style={styles.boldText}>{item.pointsEarned}</Text>{" "}
          points walking {item.distanceByWalking.toFixed(2)} meters instead of
          using transport.
        </Text>

        <Text></Text>
        <View style={styles.statItem}>
          <Text style={styles.logText}>
            <Text style={styles.boldText}>Date:</Text>{" "}
            {dayjs().isSame(dayjs(item.endTime), "day")
              ? "Today"
              : dayjs(item.endTime).format("DD MMMM YYYY")}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.logText}>
            <Text style={styles.boldText}>Time:</Text>{" "}
            {dayjs(item.date).format("hh:mm A")}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.logText}>
            <Text style={styles.boldText}>Average Speed:</Text>{" "}
            {item.averageSpeed.toFixed(2)} km/h
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.logText}>
            <Text style={styles.boldText}>Distance (if traveled by car):</Text>{" "}
            {item.distanceByCar.toFixed(2)} meters
          </Text>
        </View>
        {/* 
          <View style={styles.statItem}>
            <Text style={styles.boldText}>Distance (by walking):</Text>{" "}
            {item.distanceByWalking ? item.distanceByWalking.toFixed(2) : 0}{" "}
            meters
          </View>

          <View style={styles.statItem}>
            <Text style={styles.boldText}>Start Coordinates:</Text>{" "}
            {item.startLocation.coords.latitude.toFixed(6)},{" "}
            {item.startLocation.coords.longitude.toFixed(6)}
          </View>

          <View style={styles.statItem}>
            <Text style={styles.boldText}>End Coordinates:</Text>{" "}
            {item.endLocation.coords.latitude.toFixed(6)},{" "}
            {item.endLocation.coords.longitude.toFixed(6)}
          </View> */}
      </View>
    );
  } else if (item.logType === "Material") {
    return (
      <View style={[styles.logItem, { backgroundColor: "#6A8997" }]}>
        <Text style={{ color: "white" }}>AIDentifier</Text>
        <Text style={styles.logText}>
          You gained <Text style={styles.boldText}>{item.points}</Text> points
          by recycling {item.materialType}
        </Text>
        <Text></Text>
        <Text style={styles.logText}>
          <Text style={styles.boldText}>Date:</Text>{" "}
          {dayjs().isSame(dayjs(item.date), "day")
            ? "Today"
            : dayjs(item.date).format("DD MMMM YYYY")}
        </Text>
        <Text style={styles.logText}>
          <Text style={styles.boldText}>Time:</Text>{" "}
          {dayjs(item.date).format("hh:mm A")}
        </Text>

        <Text style={styles.logText}>
          <Text style={styles.boldText}>Material Recycled: </Text>{" "}
          {item.materialType ?? "Mixed"}
        </Text>
        {/* <Text style={styles.logText}>
          <Text style={styles.boldText}>Points Earned: </Text> {item.points}
        </Text> */}
        {/* <Text style={styles.logText}>
          <Text style={styles.boldText}>Time:</Text> {JSON.stringify(item.date)}
        </Text> */}
      </View>
    );
  } //          Item: {item.date} {item.points} {item.materialType}
};
