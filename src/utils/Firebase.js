import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc,query,where, getDocs } from 'firebase/firestore';
//import {hospital} from "./Practicesjson"

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
        fullName: fullName,
        dob,
        address,
        email,
        password,
        createdAt: new Date(),
        PatientId:uid,
        PracticeRegistered:false,
        // Adminapproved:false
        
      });
    } catch (error) {
      console.log('Error in creating user', error);
    }
  }
}



export const createHospitalDocuments = async (hospitalsArray) => {
  // console.log("Creating hospital documents...");
  const hospitalsCollectionRef = collection(firestore, 'practice');

  // Check if hospitalsArray is actually an array
  if (!Array.isArray(hospitalsArray)) {
    console.error('Expected an array for hospitalsArray, received:', hospitalsArray);
    return;  // Exit the function if it's not an array
  }

  for (const hospital of hospitalsArray) {
    const { practiceid,name, image, address, city, services} = hospital;  // Including services

    // Create a query to check if there's an existing hospital with the same name
    const hospitalQuery = query(hospitalsCollectionRef, where("name", "==", name));
    const querySnapshot = await getDocs(hospitalQuery);

    if (querySnapshot.empty) {  // If there's no existing document with the same name
      const hospitalRef = doc(hospitalsCollectionRef);  // Create a new document reference
      
      try {
        await setDoc(hospitalRef, {
          practiceid,
          name,
          image,
          address,
          city,
          services,  // Save the array of services
          createdAt: new Date()
        });
        // console.log(`Added new hospital document for ${name}`);
      } catch (error) {
        // console.error("Error adding hospital document:", name, error);
      }
    } else {
      // console.log(`Hospital with name ${name} already exists.`);
    }
  }
};



