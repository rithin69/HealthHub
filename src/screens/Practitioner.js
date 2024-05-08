import React, { useState, useEffect } from 'react';
import { firestore } from '../utils/Firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, addDoc } from 'firebase/firestore';
import axios from 'axios';

const PractitionerComponent = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newAppointmentDate, setNewAppointmentDate] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [prescriptionForm, setPrescriptionForm] = useState({
        patientName: '',
        medication: '',
        dosage: '',
        instructions: '',
    });
    const [showDoctorSelection, setShowDoctorSelection] = useState(false);
    const [doctorsList, setDoctorsList] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedAppointmentId, setSelectedAppointmentId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const q = query(collection(firestore, 'appointment_booking'), where('bookingconfirmed', '==', 'Pending'));
            const querySnapshot = await getDocs(q);
            const appointmentData = await Promise.all(querySnapshot.docs.map(async (appointmentDoc) => {
                const appointment = appointmentDoc.data();
                // const patientDocRef = doc(firestore, 'patient', appointment.patientId);
                const practiceDocRef = doc(firestore, 'practice', appointment.PracticeId);
                const [ practiceDocSnapshot] = await Promise.all([
                    // getDoc(patientDocRef),
                    getDoc(practiceDocRef)
                ]);
                // const patientName = patientDocSnapshot.exists ? patientDocSnapshot.data().patientName : 'Unknown Patient';
                const hospitalName = practiceDocSnapshot.exists ? practiceDocSnapshot.data().name : 'Unknown Hospital';
                return {
                    id: appointmentDoc.id,
                    // patientName,
                    hospitalName,
                    ...appointment
                };
            }));
            setAppointments(appointmentData);
            console.log(appointments)
            setLoading(false); // Set loading to false when data fetching is complete
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };
  
    const handleAccept = async (id) => {
        try {
            const appointmentRef = doc(firestore, 'appointment_booking', id);
            const appointmentDoc = await getDoc(appointmentRef);
            const appointmentData = appointmentDoc.data();

            const doctorsQuery = query(collection(firestore, 'doctors'), where('practiceid', '==', appointmentData.PracticeId));
            const doctorsSnapshot = await getDocs(doctorsQuery);
            const doctors = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setDoctorsList(doctors);
            setShowDoctorSelection(true);
            await updateDoc(doc(firestore, 'appointment_booking', id), { bookingconfirmed: 'Approved' });
            setAppointments(appointments.filter(appointment => appointment.id !== id));
            setSelectedAppointmentId(id);
        } catch (error) {
            console.error('Error accepting appointment:', error);
        }
    };

    const handleAssignDoctor = async () => {
        try {
            const appointmentRef = doc(firestore, 'appointment_booking', selectedAppointmentId);
            await updateDoc(appointmentRef, { 
                bookingconfirmed: 'Approved',
                assignedDoctorId: selectedDoctor
            });
            setAppointments(appointments.filter(appointment => appointment.id !== selectedAppointmentId));
            setShowDoctorSelection(false);
            setSelectedAppointmentId('');
        } catch (error) {
            console.error('Error assigning doctor:', error);
        }
    };

    const handleCancelAssignDoctor = () => {
        setShowDoctorSelection(false);
        setSelectedDoctor('');
        setSelectedAppointmentId('');
    };
//reject
    const handleReject = async (id) => {
        try {
            await updateDoc(doc(firestore, 'appointment_booking', id), { bookingconfirmed: 'Rejected' });
            setAppointments(appointments.filter(appointment => appointment.id !== id));
        } catch (error) {
            console.error('Error rejecting appointment:', error);
        }
    };

    const handleOfferAlternative = (patientEmail) => {
      setShowModal(true);
      setPatientEmail(patientEmail);
  };

  const handleModalClose = () => {
      setShowModal(false);
      setNewAppointmentDate('');
  };

  const handleSendMail = async () => {
      try {
          // Make a POST request to the backend server endpoint
          const response = await axios.post('http://localhost:5000/send-email', {
              to: patientEmail, // Patient's email address
              subject: 'New Appointment Date', // Email subject
              text: ` Hii ${appointments[0].patientName},
               Your new appointment date is ${newAppointmentDate}

               Please feel free to contact us if you have any questions or concerns.
               Contact Us: healthhub75@gmail.com` // Email body
             
          });
         //// console.log(appointments);
          console.log(response.data); // Log success message
          handleModalClose(); // Close the modal after sending the email
      } catch (error) {
          console.error('Error sending email:', error); // Log any errors
      }
  };


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
          issueDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
      };
      await addDoc(collection(firestore, 'prescriptions'), prescriptionData);
      console.log('Prescription submitted successfully');
      // Send prescription email to patient
      await sendPrescriptionEmail(prescriptionData);
      // Clear the prescription form fields
      setPrescriptionForm({
          patientName: '',
          medication: '',
          dosage: '',
          instructions: '',
      });

// Close the prescription form modal
setShowPrescriptionForm(false);
} catch (error) {
    console.error('Error submitting prescription:', error);
}
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
          Issue Date: ${prescriptionData.issueDate}`
      });
      console.log(response.data);
  } catch (error) {
      console.error('Error sending prescription email:', error);
  }
};



    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4">Pending Appointments</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {appointments.map(appointment => (
                        <div key={appointment.id} className="border p-4">
                            <p><strong>Patient Name:</strong> {appointment.patientName}</p>
                            <p><strong>Appointment Date:</strong> {appointment.appointmentDate}</p>
                            <p><strong>Consulting Service:</strong> {appointment.consultingService}</p>
                            <p><strong>Hospital Name:</strong> {appointment.hospitalName}</p>
                            <div className="flex mt-4">
                                <button onClick={() => handleAccept(appointment.id)} className="bg-green-500 text-white px-4 py-2 mr-2">Accept</button>
                                <button onClick={() => handleReject(appointment.id)} className="bg-red-500 text-white px-4 py-2">Reject</button>
                                <button onClick={() => handleOfferAlternative(appointment.patientemailid)} className="bg-blue-500 text-white px-4 py-2">Offer Alternative</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg max-w-md mx-auto">
                        <h2 className="text-xl font-bold mb-4">Offer Alternative Appointment</h2>
                        <label htmlFor="newAppointmentDate" className="block mb-2">New Appointment Date:</label>
                        <input type="date" id="newAppointmentDate" value={newAppointmentDate} onChange={(e) => setNewAppointmentDate(e.target.value)} className="border border-gray-300 rounded-md mb-4 p-2 block w-full" />
                        <label htmlFor="patientEmail" className="block mb-2">Patient Email ID:</label>
                        <input type="email" id="patientEmail" value={patientEmail} disabled className="border border-gray-300 rounded-md mb-4 p-2 block w-full" />
                        <button className="bg-blue-500 text-white px-4 py-2 mr-2" onClick={handleSendMail}>Send Mail</button>
                        <button className="bg-gray-300 text-gray-700 px-4 py-2" onClick={handleModalClose}>Cancel</button>
                    </div>
                </div>
            )}

            <button className="bg-blue-500 text-white px-4 py-2 mt-4" onClick={() => setShowPrescriptionForm(true)}>Prescription Form</button>
            {showPrescriptionForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg max-w-md mx-auto">
                        <h2 className="text-xl font-bold mb-4">Prescription Form</h2>
                        <form onSubmit={handlePrescriptionSubmit}>
                            <label htmlFor="patientName" className="block mb-2">Patient Name:</label>
                            <input type="text" id="patientName" name="patientName" value={prescriptionForm.patientName} onChange={handlePrescriptionFormChange} className="border border-gray-300 rounded-md mb-4 p-2 block w-full" />
                            <label htmlFor="medication" className="block mb-2">Medication:</label>
                            <input type="text" id="medication" name="medication" value={prescriptionForm.medication} onChange={handlePrescriptionFormChange} className="border border-gray-300 rounded-md mb-4 p-2 block w-full" />
                            <label htmlFor="dosage" className="block mb-2">Dosage:</label>
                            <input type="text" id="dosage" name="dosage" value={prescriptionForm.dosage} onChange={handlePrescriptionFormChange} className="border border-gray-300 rounded-md mb-4 p-2 block w-full" />
                            <label htmlFor="instructions" className="block mb-2">Instructions:</label>
                            <textarea id="instructions" name="instructions" value={prescriptionForm.instructions} onChange={handlePrescriptionFormChange} className="border border-gray-300 rounded-md mb-4 p-2 block w-full"></textarea>
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 mr-2">Submit Prescription</button>
                            <button type="button" onClick={() => setShowPrescriptionForm(false)} className="bg-gray-300 text-gray-700 px-4 py-2">Cancel</button>
                        </form>
                    </div>
                </div>
            )}
            {showDoctorSelection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg max-w-md mx-auto">
                        <h2 className="text-xl font-bold mb-4">Select Doctor</h2>
                        <select
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            className="border border-gray-300 rounded-md mb-4 p-2 block w-full"
                        >
                            <option value="">Select Doctor</option>
                            {doctorsList.map(doctor => (
                                <option key={doctor.id} value={doctor.id}>{doctor.doctorName}</option>
                            ))}
                        </select>
                        <button className="bg-blue-500 text-white px-4 py-2 mr-2" onClick={handleAssignDoctor}>Assign Doctor</button>
                        <button className="bg-gray-300 text-gray-700 px-4 py-2" onClick={handleCancelAssignDoctor}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PractitionerComponent;

