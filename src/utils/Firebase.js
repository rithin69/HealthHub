// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD13xG4R_YN7jt3LUQVBWmOwSdFbXSsV_8",
  authDomain: "electronic-health-applic-2ff8e.firebaseapp.com",
  databaseURL: "https://electronic-health-applic-2ff8e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "electronic-health-applic-2ff8e",
  storageBucket: "electronic-health-applic-2ff8e.appspot.com",
  messagingSenderId: "460345209150",
  appId: "1:460345209150:web:e5a5136db6097ce188bc6f",
  measurementId: "G-2ZTFJGJD2T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth();
