# Enviro

**Enviro** is a cross-platform mobile application built with Expo & React Native to help users identify if their trash is recyclable, locate the nearest recycling bin with directions, 
track carbon emissions saved by travelling without vehicles and visualize their environmental impact in a mini sanctuary whose health is depenedent on the user's actions.

---

## Collaborators

- Qiu Zhi Xian
  
- Ho Jie Kai

---

## 🔍 Key Features

- **Secure Authentication**  
  • Sign up & log in with **Firebase Authentication** (email/password, Google)<br>
  • Secure logout and session management<br>
  
  <br>
  <img src="README_images/login.png" alt="login" width="200" height="444"/>

- **Recylable Identifier**  
  • Snap a picture of trash on hand<br>
  • Queries OpenAi Vision model if object is able to be recycled<br>
  
  <br>
  <img src="/README_images/identify.png" alt="identifier page" width="200" height="444"/>
  <img src="/README_images/identify2.png" alt="identifier page" width="200" height="444"/>

- **Recycling bin locator**  
  • Accesses Google's geolocation services to identify current coordinates<br>
  • Display nearest recyling bins based on current location<br>
  • Tapping on a recycling bin provides the shortest path with directions<br>
  
  <br>
  <img src="/README_images/map.png" alt="map page" width="200" height="444"/>
  <img src="/README_images/directions.png" alt="map page" width="200" height="444"/>

- **Data Visualization**  
  • Interactive line & bar charts showing trend over time<br>
  • Displays the eco points the user gained either by recycling or travelling to places without vehicles<br> 
  • Performs speed calculations via Google geolocation services to only track distance travelled on foot<br>
  
  <br>
  <img src="/README_images/tracker.png" alt="tracker page" width="200" height="444"/>

- **Global Leaderboard**  
  • Real-time ranking of users by eco points<br>
  • Powered by **Firebase Firestore**<br>
  
  <br>
  <img src="/README_images/leaderboard.png" alt="leaderboard page" width="200" height="444"/>

- **Sanctuary**  
  • Mini environment that reflects user's environmental actions through the app<br>
  • High amount of eco points results in thriving sanctuary while too low an amount will result in a polluted sanctuary<br>
  • Virutal visualization to encourage users' to consider the impact of their actions
  
  <br>
  <img src="/README_images/sanctuary.png" alt="sanctuary page" width="200" height="444"/>
   <img src="/README_images/sanctuary2.png" alt="sanctuary page" width="200" height="444"/>

---

## 🛠️ Technology Stack

| Layer               | Tools & Libraries                                                    |
|---------------------|----------------------------------------------------------------------|
| **Framework**       | Expo SDK, React Native                                               |
| **UI & Navigation** | React Navigation                                                     |
| **State Management**| React Context API + Hooks                                            |
| **Backend & Auth**  | Firebase Authentication, Firestore                                   |
| **Storage**         | AsyncStorage, Firebase Storage                                       |
| **Maps & Location** | expo-location, react-native-maps, Google Maps REST API               |
| **Networking**      | Axios                                                                |

---

## Disclaimer
The google api key associated with this app has since been disabled. Geolocation features are no longer functional.
