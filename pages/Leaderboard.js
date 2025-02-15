import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  StatusBar,
  RefreshControl,
} from "react-native";
import { getTop10EcoPoints } from "../api/firebase"; // Ensure this path is correct
import SanctuaryModal from "../components/SanctuaryModal";

export default function Leaderboard({ route }) {
  console.log(route, "route");
  const { userID } = route.params;
  const [leaderboard, setLeaderboard] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTop10 = async () => {
    const response = await getTop10EcoPoints();
    const sortedLeaderboard = response.sort(
      (a, b) => b.EcoPoints - a.EcoPoints
    );
    console.log(sortedLeaderboard);
    setLeaderboard(sortedLeaderboard); // Sort by points descending
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTop10();
    setRefreshing(false);
  };

  useEffect(() => {
    loadTop10();
  }, []);

  const renderItem = ({ item, index }) => (
    <View
      style={{
        backgroundColor: userID === item.UserID ? "#6A8997" : "#4A6572",
        padding: 20,
        marginVertical: 8,
        width: 325,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ flexDirection: "row", width: "100%" }}>
        <View style={{ alignSelf: "flex-start" }}>
          <Image
            source={
              item.userImage
                ? { uri: userImage }
                : require("../assets/DefaultProfile.png")
            }
            style={styles.profilePicture}
          />
        </View>

        <View>
          <Text style={styles.userName}>
            {parseInt(index) + 4}th. {item.UserName}{" "}
            {userID === item.UserID && "(You)"}
          </Text>
          <Text style={styles.points}>{item.EcoPoints} points</Text>
        </View>
      </View>
      <View style={{position: "absolute", bottom: 20, right: 20}}>
        <SanctuaryModal name={item.userName} points={item.currentPoints} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        {leaderboard.length > 1 && (
          <SecondPlace
            userImage={null}
            userName={leaderboard[1].UserID === userID ? "You" : leaderboard[1].UserName}
            points={leaderboard[1].EcoPoints}
            currentPoints={leaderboard[1].currentPoints}
          />
        )}
        {leaderboard.length > 0 && (
          <FirstPlace
            userImage={null}
            userName={leaderboard[0].UserID === userID ? "You" : leaderboard[0].UserName}
            points={leaderboard[0].EcoPoints}
            currentPoints={leaderboard[0].currentPoints}
          />
        )}
        {leaderboard.length > 2 && (
          <ThirdPlace
            userImage={null}
            userName={leaderboard[2].UserID === userID ? "You" : leaderboard[2].UserName}
            points={leaderboard[2].EcoPoints}
            currentPoints={leaderboard[2].currentPoints}
          />
        )}
      </View>

      <FlatList
        data={leaderboard.length > 3 ? leaderboard.slice(3) : []} // Show the rest after top 3
        renderItem={renderItem}
        keyExtractor={(item) => item.UserID}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ alignItems: "center", width: "100%" }} // Center align the FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2B485A",
    alignItems: "center",
    paddingTop: 50,
    justifyContent: "center",
  },
  leaderboardItem: {
    flexDirection: "row",
    backgroundColor: "#4A6572",
    padding: 20,
    marginVertical: 8,
    width: "90%",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  topLeaderboardItem: {
    flexDirection: "row",
    backgroundColor: "#FFD700",
    padding: 20,
    marginVertical: 8,
    width: "90%",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
    marginRight: 10,
  },
  points: {
    color: "#E0E0E0",
    fontSize: 16,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderColor: "white",
    borderWidth: 2,
  },
  visit: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

const ThirdPlace = ({ userImage, userName, points, currentPoints }) => {
  return (
    <View
      style={{
        backgroundColor: "#A4CABC",
        borderRadius: 20,
        alignItems: "center",
        margin: 5,
        height: 180, // Adjust height for ThirdPlace
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -35, // Adjust this value as needed to position the crown
          width: 60,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/Bronze Crown.png")}
          style={{
            width: 60,
            height: 40,
            resizeMode: "contain",
          }}
        />
      </View>
      <View
        style={{
          alignItems: "center",
          padding: 10,
        }}
      >
        <Image
          source={
            userImage
              ? { uri: userImage }
              : require("../assets/DefaultProfile.png")
          }
          style={{
            width: 70,
            height: 70,
            borderRadius: 50,
            borderWidth: 3,
            borderColor: "#E69900",
          }}
        />
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 15,
            marginTop: 10,
            color: "#333",
          }}
        >
          {userName}
        </Text>
        <Text
          style={{
            color: "black",
            fontSize: 14,
            fontWeight: "bold",
            marginVertical: 5,
            fontWeight: "500",
          }}
        >
          {points}{" "}
          <Text style={{ color: "black", fontWeight: "500" }}>points</Text>
        </Text>
        <SanctuaryModal points={currentPoints} name={userName} />
      </View>
    </View>
  );
};

const SecondPlace = ({ userImage, userName, points, currentPoints }) => {
  return (
    <View
      style={{
        backgroundColor: "#A4CABC",
        borderRadius: 20,
        alignItems: "center",
        margin: 5,
        height: 200, // Adjust height for SecondPlace
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -35, // Adjust this value as needed to position the crown
          width: 60,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/Silver Crown.png")}
          style={{
            width: 60,
            height: 40,
            resizeMode: "contain",
          }}
        />
      </View>
      <View
        style={{
          alignItems: "center",
          padding: 10,
        }}
      >
        <Image
          source={
            userImage
              ? { uri: userImage }
              : require("../assets/DefaultProfile.png")
          }
          style={{
            width: 70,
            height: 70,
            borderRadius: 50,
            borderWidth: 3,
            borderColor: "#CECFD2",
          }}
        />
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 15,
            marginTop: 30,
            color: "#333",
          }}
        >
          {userName}
        </Text>
        <Text
          style={{
            color: "black",
            fontSize: 14,
            fontWeight: "bold",
            marginVertical: 5,
          }}
        >
          {points}{" "}
          <Text style={{ color: "black", fontWeight: "500" }}>points</Text>
        </Text>
        <SanctuaryModal name={userName} points={currentPoints} />
      </View>
    </View>
  );
};

const FirstPlace = ({ userImage, userName, points, currentPoints }) => {
  return (
    <View
      style={{
        backgroundColor: "#A4CABC",
        borderRadius: 20,
        alignItems: "center",
        margin: 5,
        height: 220, // Adjust height for FirstPlace
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -35, // Adjust this value as needed to position the crown
          width: 60,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/Gold Crown.png")}
          style={{
            width: 60,
            height: 40,
            resizeMode: "contain",
          }}
        />
      </View>
      <View
        style={{
          alignItems: "center",
          padding: 10,
        }}
      >
        <Image
          source={
            userImage
              ? { uri: userImage }
              : require("../assets/DefaultProfile.png")
          }
          style={{
            width: 70,
            height: 70,
            borderRadius: 50,
            borderWidth: 3,
            borderColor: "#FFD700",
          }}
        />
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 15,
            marginTop: 50,
            color: "#333",
          }}
        >
          {userName}
        </Text>
        <Text
          style={{
            color: "black",
            fontSize: 14,
            fontWeight: "bold",
            marginVertical: 5,
          }}
        >
          {points}{" "}
          <Text style={{ color: "black", fontWeight: "500" }}>points</Text>
        </Text>
        <SanctuaryModal name={userName} points={currentPoints} />
      </View>
    </View>
  );
};
