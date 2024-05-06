// //import React from 'react'
// //import Header from '../Components/Header'

// //import React, { useState, useEffect } from 'react';
// //import { firestore } from '../utils/Firebase';

// //import firebase from 'firebase/app';
// //import 'firebase/auth';
// //import 'firebase/firestore';


// // Initialize Firebase



// //function Doctor() {
//   //return (
//   //<Header/>
//  // )

// import React, { useState, useEffect } from 'react';
//  //import { collection, getDocs, where, query, addDoc } from 'firebase/firestore';
//  //import { firestore } from '../utils/Firebase';
// import firebase from 'firebase/compat/app';
// import 'firebase/compat/auth';
// import 'firebase/compat/firestore';
// import { collection, getDocs, doc, updateDoc, addDoc, setDoc, getDoc, query, where } from 'firebase/firestore';
// import { firestore } from '../utils/Firebase';

// //import { useAuthState } from 'react-firebase-hooks/auth';
// //import { useDocument } from 'react-firebase-hooks/firestore';


// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// // Your Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyD13xG4R_YN7jt3LUQVBWmOwSdFbXSsV_8",
//   authDomain: "electronic-health-applic-2ff8e.firebaseapp.com",
//   databaseURL: "https://electronic-health-applic-2ff8e-default-rtdb.europe-west1.firebasedatabase.app",
//   projectId: "electronic-health-applic-2ff8e",
//   storageBucket: "electronic-health-applic-2ff8e.appspot.com",
//   messagingSenderId: "460345209150",
//   appId: "1:460345209150:web:e5a5136db6097ce188bc6f",
//   measurementId: "G-2ZTFJGJD2T"
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);






function Doctor() {
  const [user, setUser] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [appointmentBooking, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
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

//   //useEffect(() => {
//    // const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
//     //  if (user) {
//    //     setUser(user);
//    //   } else {
//    //     setUser(null);
//    //   }
//    // });

   // return unsubscribe;
 // }, []);
 useEffect(() => {
  const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      setUser(user);
      try {
      const doctorDoc = await getDoc(doc(firestore, 'doctors', user.uid));
      const doctorData = doctorDoc.data();
      setDoctorName(doctorData?.doctorName || 'Unknown');
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
  const fetchAppointments = async () => {
    try {
      const appointmentsQuery = query(
        collection(firestore, 'appointment_booking'),
        where('doctorId', '==', user.uid),
        where('practiceId', '==', user.uid),
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

  if (user) {
    fetchAppointments();
  }
}, [user]);


 //useEffect(() => {
 // const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
 //   if (user) {
 //     setUser(user);
 //     try {
 //       const appointmentsQuery = query(
 //         collection(firestore, 'appointment_booking'),
 //         where('doctorId', '==', user.uid),
 //         where('bookingconfirmed', '==', true)
 //       );
 //       const appointmentsSnapshot = await getDocs(appointmentsQuery);
 //       const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({ 
 //         id: doc.id,
 //         ...doc.data(),
 //       }));
 //       setAppointments(appointmentsData);
 //     } catch (error) {
 //       console.error('Error fetching appointments:', error);
 //     }
 //   } else {
 //     setUser(null);
 //     setAppointments([]);
 //     setPatients([]);
 //   }
  //});

  //return unsubscribe;
//}, []);

useEffect(() => {
  const fetchPatients = async () => {
    try {
      const patientsQuery = query(
        collection(firestore, 'patient'),
        where('doctorId', '==', user?.uid)
      );
      const patientsSnapshot = await getDocs(patientsQuery);
      const patientsData = patientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

//   if (user) {
//     fetchPatients();
//   }
// }, [user]);

//   const handlePrescriptionFormChange = (e) => {
//     setPrescriptionForm({
//       ...prescriptionForm,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handlePrescriptionSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const prescriptionData = {
//         ...prescriptionForm,
//         issueDate: new Date(),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };
//       await addDoc(collection(firestore, 'prescriptions'), prescriptionData);
//       console.log('Prescription submitted successfully');
//       toast.success('Prescription details updated successfully!');
//       setPrescriptionForm({
//         patientName: '',
//         medication: '',
//         dosage: '',
//         instructions: '',
//       });
//     } catch (error) {
//       console.error('Error submitting prescription:', error);
//       toast.error('Error updating prescription details.');
//     }
//   };

//   const handleMedicalHistoryFormChange = (e) => {
//     setMedicalHistoryForm({
//       ...medicalHistoryForm,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleMedicalHistorySubmit = async (e) => {
//     e.preventDefault();
//     try {
//       //console.log('Submitting medical history:', medicalHistoryForm);
//       const patientRef = await getPatientRef(medicalHistoryForm.patientName);
//       //console.log('Patient reference:', patientRef);
//       if (patientRef) {
//         await updateDoc(patientRef, {
//           medicalHistory: firebase.firestore.FieldValue.arrayUnion({
//             condition: medicalHistoryForm.condition,
//             notes: medicalHistoryForm.notes,
//           }),
//         });
//         console.log('Medical history updated successfully');
//         toast.success('Medical history updated successfully!');
//         setMedicalHistoryForm({
//           patientName: '',
//           condition: '',
//           notes: '',
//         });
//       } else {
//         console.error('Patient not found');
//         toast.error('Patient not found.');
//       }
//     } catch (error) {
//       console.error('Error updating medical history:', error);
//       toast.error('Error updating medical history.');
//     }
//   };

  const getPatientRef = async (patientName) => {
    const patientsQuery = query(
      collection(firestore, 'patient'),
      where('patientName', '==', patientName),
      where('doctorId', '==', user.uid),
    );
    const querySnapshot = await getDocs(patientsQuery);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].ref;
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
        <h2 className="text-xl font-bold">Welcome, Dr. {doctorName}</h2>
      </header>

//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />

<main className="flex-grow p-6">
        <div className="flex flex-col w-full">
          <div className="flex flex-col bg-white p-4 rounded-lg shadow mt-4">
            <h3 className="text-lg font-bold mb-2">Upcoming Appointments</h3>
            <div className="overflow-x-auto">
              <table className="table-auto w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Patient Name</th>
                    <th className="px-6 py-4 whitespace-nowrap">Appointment Date</th>
                    <th className="px-6 py-4 whitespace-nowrap">Consulting Service</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentBooking.map((appointmentBooking) => (
                    <tr key={appointmentBooking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{appointmentBooking.patientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{appointmentBooking.appointmentDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{appointmentBooking.consultingService}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{appointmentBooking.bookingconfirmed ? 'Confirmed' : 'Not Confirmed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col bg-white p-4 rounded-lg shadow mt-4">
            <h3 className="text-lg font-bold mb-2">Generate Prescription</h3>
            <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
              <div>
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
              <div>
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
              <div>
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
              <div>
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

          <div className="flex flex-col bg-white p-4 rounded-lg shadow mt-4">
            <h3 className="text-lg font-bold mb-2">Record Medical History</h3>
            <form onSubmit={handleMedicalHistorySubmit} className="space-y-4">
              <div>
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
              <div>
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
              <div>
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

//       <footer className="bg-gray-200 text-gray-600 py-4 px-6 text-center">
//         &copy; {new Date().getFullYear()} Health Hub
//       </footer>
//     </div>
//   );
// }

export default Doctor;
 
// //export default Doctor