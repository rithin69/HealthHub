import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, addDoc } from 'firebase/firestore';
import { firestore } from '../utils/Firebase';
import axios from 'axios';

const firebaseConfig = {
  // Your Firebase config details
  apiKey: "AIzaSyD13xG4R_YN7jt3LUQVBWmOwSdFbXSsV_8",
    authDomain: "electronic-health-applic-2ff8e.firebaseapp.com",
    databaseURL: "https://electronic-health-applic-2ff8e-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "electronic-health-applic-2ff8e",
    storageBucket: "electronic-health-applic-2ff8e.appspot.com",
    messagingSenderId: "460345209150",
    appId: "1:460345209150:web:e5a5136db6097ce188bc6f",
    measurementId: "G-2ZTFJGJD2T"

};

firebase.initializeApp(firebaseConfig);

function Doctor() {
  const [user, setUser] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientName: '',
    medication: '',
    dosage: '',
    instructions: '',
    testName: '',
    testDetails: '',
    testScheduledDate: '',
  });

  const [medicalHistoryForm, setMedicalHistoryForm] = useState({
    patientName: '',
    condition: '',
    notes: '',
  });

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        try {
          const doctorDoc = await getDoc(doc(firestore, 'doctors', user.uid));
          if (doctorDoc.exists()) {
            const doctorData = doctorDoc.data();
            setDoctorName(doctorData.doctorName || 'Dr. Andrew');
          } else {
            setDoctorName('Unknown');
          }
        } catch (error) {
          console.error('Error fetching doctor data:', error);
          setDoctorName('Unknown');
        }
      } else {
        setUser(null);
        setDoctorName('');
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchAppointments = async () => {
    try {
      const appointmentsQuery = query(
        collection(firestore, 'appointment_booking'),
        where('doctorId', '==', user.uid),
        where('bookingconfirmed', '==', true)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchData = async () => {
    try {
      const q = query(collection(firestore, 'appointment_booking'), where('bookingconfirmed', '==', 'Pending'));
      const querySnapshot = await getDocs(q);
      const appointmentData = await Promise.all(querySnapshot.docs.map(async (appointmentDoc) => {
        const appointment = appointmentDoc.data();
        const practiceDocRef = doc(firestore, 'practice', appointment.PracticeId);
        const [practiceDocSnapshot] = await Promise.all([
          getDoc(practiceDocRef)
        ]);
        const hospitalName = practiceDocSnapshot.exists ? practiceDocSnapshot.data().name : 'Unknown Hospital';
        return {
          id: appointmentDoc.id,
          hospitalName,
          ...appointment
        };
      }));
      setAppointments(appointmentData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchPatients = async () => {
    try {
      const patientsQuery = query(
        collection(firestore, 'patient'),
        where('patientName', '==', prescriptionForm.patientName)
      );
      const patientsSnapshot = await getDocs(patientsQuery);
      const patientsData = patientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatients(patientsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  if (user) {
    fetchPatients();
  }

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
        doctorId: user.uid,
        issueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        medicalTests: [
          {
            testName: prescriptionForm.testName,
            testDetails: prescriptionForm.testDetails,
            testScheduledDate: prescriptionForm.testScheduledDate,
          }
        ],
      };
      await addDoc(collection(firestore, 'prescriptions'), prescriptionData);
      await sendPrescriptionEmail(prescriptionData);
      setPrescriptionForm({
          patientName: '',
          medication: '',
          dosage: '',
          instructions: '',
          testName: '',
          testDetails: '',
          testScheduledDate: '',
      });
      console.log('Prescription submitted successfully');
    } catch (error) {
      console.error('Error submitting prescription:', error);
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
      const patientRef = await getPatientRef(medicalHistoryForm.patientName);
      if (patientRef) {
        await updateDoc(patientRef, {
          medicalHistory: firebase.firestore.FieldValue.arrayUnion({
            condition: medicalHistoryForm.condition,
            notes: medicalHistoryForm.notes,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }),
        });
        console.log('Medical history updated successfully');
        setMedicalHistoryForm({
          patientName: '',
          condition: '',
          notes: '',
        });
      } else {
        console.error('Patient not found');
      }
    } catch (error) {
      console.error('Error updating medical history:', error);
    }
  };

  const getPatientRef = async (patientName) => {
    const patientsQuery = query(
      collection(firestore, 'patient'),
      where('patientName', '==', patientName),
    );
    const querySnapshot = await getDocs(patientsQuery);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].ref;
    }
    return null;
  };

  const sendPrescriptionEmail = async (prescriptionData) => {
    try {
      const response = await axios.post('http://localhost:5000/send-email', {
        to: prescriptionData.patientEmail,
        subject: 'Prescription Details',
        text: `Dear ${prescriptionData.patientName}, Here are your prescription details:
          Medication: ${prescriptionData.medication}
          Dosage: ${prescriptionData.dosage}
          Instructions: ${prescriptionData.instructions}
          Issue Date: ${prescriptionData.issueDate}
          Suggested Tests: ${prescriptionData.testName}
          Scheduled Test date: ${prescriptionData.testScheduledDate}`
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error sending prescription email:', error);
    }
  };


  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
        <h2 className="text-xl font-bold">Welcome, {doctorName}</h2>
      </header>

      <main className="flex-grow p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4">Appointments</h1>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {appointments.map(appointment => (
                <div key={appointment.id} className="border p-4 bg-slate-300 ">
                  <p><strong>Patient Name:</strong> {appointment.patientName}</p>
                  <p><strong>Patient Email:</strong> {appointment.patientemailid}</p>
                  <p><strong>Consulting Service:</strong> {appointment.consultingService}</p>
                  <p><strong>Appointment Date:</strong> {appointment.appointmentDate}</p>
                  <div className="flex mt-4"></div>
                </div>
              ))}
            </div>
          )}
        </div>

      
        <div className="container mx-auto">
          <div className="border rounded-lg p-4 bg-blue-200 mb-4 w-1/2">
            <h1 className="text-2xl font-bold mb-4">Prescription Form</h1>
            <form onSubmit={handlePrescriptionSubmit} className="flex flex-col gap-4">
              <label className="font-bold" htmlFor="patientName">Patient Name</label>
              <input type="text" id="patientName" name="patientName" value={prescriptionForm.patientName} onChange={handlePrescriptionFormChange} />

              <label className="font-bold" htmlFor="medication">Medication</label>
              <input type="text" id="medication" name="medication" value={prescriptionForm.medication} onChange={handlePrescriptionFormChange} />

              <label className="font-bold" htmlFor="dosage">Dosage</label>
              <input type="text" id="dosage" name="dosage" value={prescriptionForm.dosage} onChange={handlePrescriptionFormChange} />

              <label className="font-bold" htmlFor="instructions">Instructions</label>
              <input type="text" id="instructions" name="instructions" value={prescriptionForm.instructions} onChange={handlePrescriptionFormChange} />

              <label className="font-bold" htmlFor="testName">Test Name</label>
              <input type="text" id="testName" name="testName" value={prescriptionForm.testName} onChange={handlePrescriptionFormChange} />

              <label className="font-bold" htmlFor="testDetails">Test Details</label>
              <input type="text" id="testDetails" name="testDetails" value={prescriptionForm.testDetails} onChange={handlePrescriptionFormChange} />

              <label className="font-bold" htmlFor="testScheduledDate">Test Scheduled Date</label>
              <input type="text" id="testScheduledDate" name="testScheduledDate" value={prescriptionForm.testScheduledDate} onChange={handlePrescriptionFormChange} />

              <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-4">Submit Prescription</button>
            </form>
          </div>
        </div>

        <div className="container mx-auto">
          <div className="border rounded-lg p-4 bg-blue-200 mb-4 w-1/2">
            <h1 className="text-2xl font-bold mb-4">Medical History Form</h1>
            <form onSubmit={handleMedicalHistorySubmit} className="flex flex-col gap-4">
              <label className="font-bold" htmlFor="patientName">Patient Name</label>
              <input type="text" id="patientName" name="patientName" value={medicalHistoryForm.patientName} onChange={handleMedicalHistoryFormChange} />

              <label className="font-bold" htmlFor="condition">Condition</label>
              <input type="text" id="condition" name="condition" value={medicalHistoryForm.condition} onChange={handleMedicalHistoryFormChange} />

              <label className="font-bold" htmlFor="notes">Notes</label>
              <input type="text" id="notes" name="notes" value={medicalHistoryForm.notes} onChange={handleMedicalHistoryFormChange} />

              <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-4">Submit Medical History</button>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-gray-200 text-gray-600 py-4 px-6 text-center">
        &copy; {new Date().getFullYear()} Health Hub
      </footer>
    </div>
  );
}

export default Doctor;