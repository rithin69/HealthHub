
 
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
//import { firestore, auth } from '../utils/Firebase';
import 'firebase/compat/firestore';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, addDoc } from 'firebase/firestore';
import { firestore } from '../utils/Firebase';
import axios from 'axios';
//import { ToastContainer, toast } from 'react-toastify';
//import 'react-toastify/dist/ReactToastify.css';
 
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
            setDoctorName(doctorData.doctorName || 'Unknown');
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
 
  // useEffect(() => {
  //   fetchAppointments();
  //   fetchPatients();
  // }, [user]);
//newly added
 
 
  const fetchAppointments = async () => {
    try {
      const appointmentsQuery = query(
        collection(firestore, 'appointment_booking'),
        where('assigneddoctorid', '==', user.uid),
        //where('patientId', '==', patientId),
        //where('practiceId', '==', user?.uid),,
        where('bookingconfirmed', '==', "Approved")
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
 
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);
 
  const fetchData = async () => {
    try {
      const q = query(collection(firestore, 'appointment_booking'), where('bookingconfirmed', '==', 'Pending')
       
      );
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
 
// Fetch patients when user data changes
useEffect(() => {
  const fetchPatients = async () => {
    try {
      const patientsQuery = query(
        collection(firestore, 'patient'),
        //where('doctorId', '==', user?.uid)
        where('patientName', '==', prescriptionForm.patientName) // Use the patient's name captured from the form
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
  }, [user, prescriptionForm.patientName]);
 
  useEffect(() => {
    fetchAppointments();
    //fetchPatients();
  }, [user]);
 
  // Handle changes in prescription form fields
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
        //add appointments. patientid
        issueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await addDoc(collection(firestore, 'prescriptions'), prescriptionData);
      // Send prescription email to patient
      await sendPrescriptionEmail(prescriptionData);
      // Clear the prescription form fields
      setPrescriptionForm({
          patientName: '',
          medication: '',
          dosage: '',
          instructions: '',
          testName: '', // Clear test fields
          testDetails: '',
          testScheduledDate: '',
      });
 
      // // Email prescription
      // const response = await axios.post('http://localhost:5000/send-email', {
      //   to: prescriptionForm.patientEmail, // Patient's email address
      //   subject: 'Prescription', // Email subject
      //   text: `Dear ${prescriptionForm.patientName},\n\nHere is your prescription:\n\nMedication: ${prescriptionForm.medication}\nDosage: ${prescriptionForm.dosage}\nInstructions: ${prescriptionForm.instructions}\n\nPlease follow the instructions carefully. If you have any questions, feel free to contact us.\n\nSincerely,\n${doctorName}` // Email body
      // });
 
      // console.log('Email sent:', response.data);
 
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
     
      console.log('Prescription submitted successfully');
      //toast.success('Prescription details updated successfully!');
 
 
      setPrescriptionForm({
        patientName: '',
        medication: '',
        dosage: '',
        instructions: '',
        testName: '', // Clear test fields
        testDetails: '',
        testScheduledDate: '',
      });
    } catch (error) {
      console.error('Error submitting prescription:', error);
      //toast.error('Error updating prescription details.');
    }
  };
 
  // Handle changes in medical history form fields
  const handleMedicalHistoryFormChange = (e) => {
    setMedicalHistoryForm({
      ...medicalHistoryForm,
      [e.target.name]: e.target.value,
    });
  };
 
  // Handle submission of medical history form
  const handleMedicalHistorySubmit = async (e) => {
    e.preventDefault();
    try {
      const patientRef = await getPatientRef(medicalHistoryForm.patientName);
      if (patientRef) {
        await updateDoc(patientRef, {
          medicalHistory: firebase.firestore.FieldValue.arrayUnion({
            condition: medicalHistoryForm.condition,
            notes: medicalHistoryForm.notes,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Add current timestamp
          }),
        });
        console.log('Medical history updated successfully');
        //toast.success('Medical history updated successfully!');
        setMedicalHistoryForm({
          patientName: '',
          condition: '',
          notes: '',
        });
      } else {
        console.error('Patient not found');
        //toast.error('Patient not found.');
      }
    } catch (error) {
      console.error('Error updating medical history:', error);
      //toast.error('Error updating medical history.');
    }
  };
 
  // Function to get reference to patient document
  const getPatientRef = async (patientName) => {
    const patientsQuery = query(
      collection(firestore, 'patient'),
      where('patientName', '==', patientName),
      //where('doctorId', '==', user?.uid),
    );
    const querySnapshot = await getDocs(patientsQuery);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].ref;
    }
    return null;
  };
 
  const handleAccept = async (id) => {
    try {
      await updateDoc(doc(firestore, 'appointment_booking', id), { bookingconfirmed: 'Approved' });
      setAppointments(appointments.filter(appointment => appointment.id !== id));
    } catch (error) {
      console.error('Error accepting appointment:', error);
    }
  };
 
  const handleReject = async (id) => {
    try {
      await updateDoc(doc(firestore, 'appointment_booking', id), { bookingconfirmed: 'Rejected' });
      setAppointments(appointments.filter(appointment => appointment.id !== id));
    } catch (error) {
      console.error('Error rejecting appointment:', error);
    }
  };
 
  return (
    
    <div className="flex flex-col min-h-screen">
      
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
        <h2 className="text-xl font-bold">Welcome, Dr. Andrew</h2>
      </header>
 
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}
 
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
                  <div className="flex mt-4">
                    {/* <button onClick={() => handleAccept(appointment.id)} className="bg-green-500 text-white px-4 py-2 mr-2">Accept</button> */}
                    {/* <button onClick={() => handleReject(appointment.id)} className="bg-red-500 text-white px-4 py-2">Reject</button> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
 
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4">Prescription Form</h1>
          <form onSubmit={handlePrescriptionSubmit} className="flex flex-col gap-4">
            <input type="text" name="patientName" placeholder="Patient Name" value={prescriptionForm.patientName} onChange={handlePrescriptionFormChange} />
            <input type="text" name="medication" placeholder="Medication" value={prescriptionForm.medication} onChange={handlePrescriptionFormChange} />
            <input type="text" name="dosage" placeholder="Dosage" value={prescriptionForm.dosage} onChange={handlePrescriptionFormChange} />
            <input type="text" name="instructions" placeholder="Instructions" value={prescriptionForm.instructions} onChange={handlePrescriptionFormChange} />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2">Submit Prescription</button>
          </form>
        </div>
 
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4">Medical History Form</h1>
          <form onSubmit={handleMedicalHistorySubmit} className="flex flex-col gap-4">
            <input type="text" name="patientName" placeholder="Patient Name" value={medicalHistoryForm.patientName} onChange={handleMedicalHistoryFormChange} />
            <input type="text" name="condition" placeholder="Condition" value={medicalHistoryForm.condition} onChange={handleMedicalHistoryFormChange} />
            <input type="text" name="notes" placeholder="Notes" value={medicalHistoryForm.notes} onChange={handleMedicalHistoryFormChange} />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2">Submit Medical History</button>
          </form>
        </div>
      </main>
 
      <footer className="bg-gray-200 text-gray-600 py-4 px-6 text-center">
        &copy; {new Date().getFullYear()} Health Hub
      </footer>
    </div>
  );
}
 
export default Doctor;