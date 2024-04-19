//import React from 'react'
//import Header from '../Components/Header'

//import React, { useState, useEffect } from 'react';
//import { firestore } from '../utils/Firebase';

//import firebase from 'firebase/app';
//import 'firebase/auth';
//import 'firebase/firestore';


// Initialize Firebase



//function Doctor() {
  //return (
  //<Header/>
 // )

import React, { useState, useEffect } from 'react';
 //import { collection, getDocs, where, query, addDoc } from 'firebase/firestore';
 //import { firestore } from '../utils/Firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { collection, getDocs, doc, updateDoc, addDoc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { firestore } from '../utils/Firebase';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Your Firebase configuration
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
firebase.initializeApp(firebaseConfig);






function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientName: '',
    doctorName: '',
    medication: '',
    dosage: '',
    instructions: '',
  });
  const [medicalHistoryForm, setMedicalHistoryForm] = useState({
    patientName: '',
    condition: '',
    notes: '',
  });

  useEffect(() => {
    // Get the current user
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        // Fetch appointments for the current doctor
        const fetchAppointments = async () => {
          try {
            const appointmentsQuery = query(
              collection(firestore, 'appointments'),
              where('doctorId', '==', user.uid)
            );
            const querySnapshot = await getDocs(appointmentsQuery);
            const appointmentsData = querySnapshot.docs.map((doc) => doc.data());
            setAppointments(appointmentsData);
          } catch (error) {
            console.error('Error fetching appointments:', error);
          }
        };
        await fetchAppointments();

        // Fetch patients for the current doctor
        const fetchPatients = async () => {
          try {
            const patientsQuery = query(
              collection(firestore, 'patient'),
              where('doctorId', '==', user.uid)
            );
            const querySnapshot = await getDocs(patientsQuery);
            const patientsData = querySnapshot.docs.map((doc) => doc.data());
            setPatients(patientsData);
          } catch (error) {
            console.error('Error fetching patients:', error);
          }
        };
        await fetchPatients();
      } else {
        setUser(null);
        setAppointments([]);
        setPatients([]);
      }
    });

    return unsubscribe;
  }, []);

  const handlePrescriptionFormChange = (e) => {
    setPrescriptionForm({
      ...prescriptionForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      const prescriptionData = {
        ...prescriptionForm,
        patientId: patients.find((patient) => patient.fullName === prescriptionForm.patientName)?.id || '',
        doctorId: user.uid,
        issueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await addDoc(collection(firestore, 'prescriptions'), prescriptionData);
      console.log('Prescription submitted successfully');
      toast.success('Prescription details updated successfully!'); // Display success message
      
      // Reset the form after submission
      setPrescriptionForm({
        patientName: '',
        doctorName: '',
        medication: '',
        dosage: '',
        instructions: '',
      });
    } catch (error) {
      console.error('Error submitting prescription:', error);
      toast.error('Error updating prescription details.'); // Display error message
    }
  };

  const handleMedicalHistoryFormChange = (e) => {
    setMedicalHistoryForm({
      ...medicalHistoryForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleMedicalHistorySubmit = async (e) => {
    e.preventDefault();
    try {
      const patientId = patients.find((patient) => patient.fullName === medicalHistoryForm.patientName)?.id;
      if (patientId) {
        const patientRef = doc(firestore, 'patient', patientId);
        await updateDoc(patientRef, {
          medicalHistory: firebase.firestore.FieldValue.arrayUnion({
            condition: medicalHistoryForm.condition,
            notes: medicalHistoryForm.notes,
          }),
        });
        console.log('Medical history updated successfully');
        toast.success('Medical history updated successfully!'); // Display success message
        // Reset the form after submission

        setMedicalHistoryForm({
          patientName: '',
          condition: '',
          notes: '',
        });
      } else {
        console.error('Patient not found');
        toast.error('Patient not found.'); // Display error message

      }
    } catch (error) {
      console.error('Error updating medical history:', error);
      toast.error('Error updating medical history.'); // Display error message
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
      </header>

      <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />


      {/* Main Content */}
      <main className="flex-grow p-6">
        {/* Sidebar */}
        <div className="w-64 bg-gray-200 p-4 rounded-lg">
          <nav>
            <ul>
              <li>
                <a href="#" className="block py-2 px-4 rounded hover:bg-gray-300">
                  Appointments
                </a>
              </li>
              <li>
                <a href="#" className="block py-2 px-4 rounded hover:bg-gray-300">
                  Patient Records
                </a>
              </li>
              <li>
                <a href="#" className="block py-2 px-4 rounded hover:bg-gray-300">
                  Prescriptions
                </a>
              </li>
              <li>
                <a href="#" className="block py-2 px-4 rounded hover:bg-gray-300">
                  Referrals
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Content Area */}
        <div className="ml-6 flex-grow">
          <h2 className="text-xl font-bold mb-4">Welcome, Dr. {user?.displayName}</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-2">Appointments</h3>
            <ul>
              {appointments.map((appointment) => (
                <li key={appointment.id}>{appointment.patientName} - {appointment.date}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg shadow mt-4">
            <h3 className="text-lg font-bold mb-2">Patients</h3>
            <ul>
              {patients.map((patient) => (
                <li key={patient.id}>{patient.fullName}</li>
              ))}
            </ul>
          </div>

          {/* Prescription Form */}
          <div className="bg-white p-4 rounded-lg shadow mt-4">
            <h3 className="text-lg font-bold mb-2">Generate Prescription</h3>
            <form onSubmit={handlePrescriptionSubmit}>
              <div className="mb-4">
                <label htmlFor="patientName" className="block font-bold mb-2">
                  Patient Name
                </label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={prescriptionForm.patientName}
                  onChange={handlePrescriptionFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="doctorName" className="block font-bold mb-2">
                  Doctor Name
                </label>
                <input
                  type="text"
                  id="doctorName"
                  name="doctorName"
                  value={user?.displayName || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="medication" className="block font-bold mb-2">
                  Medication
                </label>
                <input
                  type="text"
                  id="medication"
                  name="medication"
                  value={prescriptionForm.medication}
                  onChange={handlePrescriptionFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="dosage" className="block font-bold mb-2">
                  Dosage
                </label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={prescriptionForm.dosage}
                  onChange={handlePrescriptionFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="instructions" className="block font-bold mb-2">
                  Instructions
                </label>
                <textarea
                  id="instructions"
                  name="instructions"
                  value={prescriptionForm.instructions}
                  onChange={handlePrescriptionFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Submit Prescription
              </button>
            </form>
          </div>

          {/* Medical History Form */}
          <div className="bg-white p-4 rounded-lg shadow mt-4">
            <h3 className="text-lg font-bold mb-2">Record Medical History</h3>
            <form onSubmit={handleMedicalHistorySubmit}>
              <div className="mb-4">
                <label htmlFor="patientName" className="block font-bold mb-2">
                  Patient Name
                </label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={medicalHistoryForm.patientName}
                  onChange={handleMedicalHistoryFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="condition" className="block font-bold mb-2">
                  Condition
                </label>
                <input
                  type="text"
                  id="condition"
                  name="condition"
                  value={medicalHistoryForm.condition}
                  onChange={handleMedicalHistoryFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="notes" className="block font-bold mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={medicalHistoryForm.notes}
                  onChange={handleMedicalHistoryFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Record Medical History
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-gray-600 py-4 px-6 text-center">
        &copy; {new Date().getFullYear()} Health Practices Network
      </footer>
    </div>
  );




}

export default DoctorDashboard;
 
//export default Doctor