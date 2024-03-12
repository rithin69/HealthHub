import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';

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
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export const createUserDocument = async (user, additionalData) => {
  if (!user) return;

  const userRef = doc(firestore, 'patient', user.uid);
  
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) {
    const { uid } = user;
    const {fullName,
      dob,
      address,
      email,
      password} = additionalData;
    
    try {
      await setDoc(userRef, {
        fullName,
        dob,
        address,
        email,
        password,
        createdAt: new Date(),
        uid
        
      });
    } catch (error) {
      console.log('Error in creating user', error);
    }
  }
}
