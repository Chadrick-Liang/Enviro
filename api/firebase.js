const baseFirebaseUrl =
  "https://enviro-62562-default-rtdb.asia-southeast1.firebasedatabase.app/";

import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
export const getUser = async (UserID) => {
  const firebaseUrl = baseFirebaseUrl + UserID + ".json";
  try {
    const response = await fetch(firebaseUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user from Firebase:", error);
    throw error; // Rethrow the error to handle it further up the call stack if needed
  }
};

export const addPoints = async (UserID, points, date = dayjs().valueOf()) => {
  console.log(`Adding ${points} points to user ID: ${UserID}`);
  const firebaseUrl = `${baseFirebaseUrl}/${UserID}.json`; 

  try {
    const userDetails = await getUser(UserID); // Assuming getUser fetches user details from somewhere

    // Update EcoPoints in Firebase
    if (userDetails && typeof userDetails.EcoPoints === "number") {
      userDetails.EcoPoints += points;
    } else {
      userDetails.EcoPoints = points; // Initialize EcoPoints if it doesn't exist
    }

    const response = await fetch(firebaseUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDetails),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    console.log("Points added to Firebase, now updating local storage");

    // Fetch, update, and save back to AsyncStorage
    const userStorageString = await AsyncStorage.getItem(UserID);
    let userStorage = userStorageString ? JSON.parse(userStorageString) : {};

    if (userStorage.pointsLog) {
      userStorage.pointsLog.push({
        points: points,
        date: date,
      });
    } else {
      userStorage.pointsLog = [
        {
          points: points,
          date: date,
        },
      ];
    }

    await AsyncStorage.setItem(UserID, JSON.stringify(userStorage)); // Make sure to stringify

    console.log(userStorage, "Updated user storage");

    const updatedData = await response.json();
    return updatedData;
  } catch (error) {
    console.error("Error updating points in Firebase and AsyncStorage:", error);
    throw error; // Rethrow the error to handle it further up the call stack if needed
  }
};

export const getTop10EcoPoints = async () => {
  const firebaseUrl = baseFirebaseUrl + ".json";
  try {
    const response = await fetch(firebaseUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    // Convert the data into an array of users
    const users = Object.keys(data).map((key) => ({
      UserID: key,
      ...data[key],
    }));

    // Sort users by EcoPoints in descending order
    users.sort((a, b) => b.EcoPoints - a.EcoPoints);

    // Get the top 10 users
    const top10Users = users.slice(0, 10);

    return top10Users;
  } catch (error) {
    console.error("Error fetching users from Firebase:", error);
    throw error; // Rethrow the error to handle it further up the call stack if needed
  }
};

export const resetAll = async (UserID) => {
  console.log(`Resetting ${UserID}`);
  const firebaseUrl = baseFirebaseUrl + UserID + ".json";

  try {
    const userDetails = await getUser(UserID); // Assuming getUser fetches user details from somewhere

    userDetails.EcoPoints = 0;

    const response = await fetch(firebaseUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDetails),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    await AsyncStorage.removeItem(UserID);
    const updatedData = await response.json();
    console.log("returning");
    return updatedData;
  } catch (error) {
    console.error("Error updating points in Firebase and AsyncStorage:", error);
    throw error; // Rethrow the error to handle it further up the call stack if needed
  }
};

export const addMaterialPoints = async (
  UserID,
  points,
  materialType,
  date = dayjs().valueOf()
) => {
  console.log(`Adding ${points} points to user ID: ${UserID}`);
  const firebaseUrl = `${baseFirebaseUrl}/${UserID}.json`;

  try {
    const userDetails = await getUser(UserID); // Assuming getUser fetches user details from somewhere

    // Update EcoPoints in Firebase
    if (userDetails && typeof userDetails.EcoPoints === "number") {
      userDetails.EcoPoints += points;
    } else {
      userDetails.EcoPoints = points; // Initialize EcoPoints if it doesn't exist
    }

    const response = await fetch(firebaseUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDetails),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    console.log("Points added to Firebase, now updating local storage");

    // Fetch, update, and save back to AsyncStorage
    const userStorageString = await AsyncStorage.getItem(UserID);
    let userStorage = userStorageString ? JSON.parse(userStorageString) : {};

    if (userStorage.materialLog) {
      userStorage.materialLog.push({
        points: points,
        date: date,
        materialType: materialType,
      });
    } else {
      userStorage.materialLog = [
        {
          points: points,
          date: date,
          materialType: materialType,
        },
      ];
    }

    if (userStorage.pointsLog) {
      userStorage.pointsLog.push({
        points: points,
        date: date,
      });
    } else {
      userStorage.pointsLog = [
        {
          points: points,
          date: date,
        },
      ];
    }

    console.log(userStorage, 'currentUserStorage')
    await AsyncStorage.setItem(UserID, JSON.stringify(userStorage)); // Make sure to stringify

    console.log(userStorage, "Updated user storage");

    const updatedData = await response.json();
    return updatedData;
  } catch (error) {
    console.error("Error updating points in Firebase and AsyncStorage:", error);
    throw error; // Rethrow the error to handle it further up the call stack if needed
  }
};

export const convertTypeToPoints = async(userID, materialType) => {
  const now = dayjs().valueOf()

  const userDetails = await AsyncStorage.getItem(userID);
  const userDetailsJSON = JSON.parse(userDetails)
  materialLog = userDetailsJSON.materialLog
  console.log(materialLog, 'the material LOG')
  if (materialLog){
    let existingMaterialsToday = materialLog.filter((item)=>{
      return dayjs(item.date).isSame(now, 'day')
    }).map((logs) => {
      return logs.materialType
    })


    if (existingMaterialsToday.includes(materialType)){
      return 3
    }else{
      return 5
    }
  }else{
    return 5
  }
  materialLog: [{
    points: points,
    date: date,
    materialType: materialType,
  }]

};
