import React, { useState, useEffect } from 'react';
import { firestore } from '../utils/Firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, setDoc }from 'firebase/firestore';
import axios from 'axios'; 
import SubmitModal from '../Components/SubmitModal'; 


const PractitionerComponent = () => {
    const [SubmitModal1, setSubmitModal1] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newAppointmentDate, setNewAppointmentDate] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [testResults, setTestResults] = useState('');
    const [Testmodal,setTestmodal]=useState(false);
    const [testpatientEmail,settestpatientEmail]=useState("");
    const [showDoctorSelection, setShowDoctorSelection] = useState(false);
    const [doctorsList, setDoctorsList] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedAppointmentId, setSelectedAppointmentId] = useState('');

    const closeSubmitModal1 = () => {
        setSubmitModal1(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const q = query(collection(firestore, 'appointment_booking'), where('bookingconfirmed', '==', 'Pending'));
            const querySnapshot = await getDocs(q);
            const appointmentData = await Promise.all(querySnapshot.docs.map(async (appointmentDoc) => {
                const appointment = appointmentDoc.data();
                const practiceDocRef = doc(firestore, 'practice', appointment.PracticeId);
                const [ practiceDocSnapshot] = await Promise.all([
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

    const handleAccept = async (id) => {
        try {
            setSelectedAppointmentId(id);
            const appointmentRef = doc(firestore, 'appointment_booking', id);
            const appointmentDoc = await getDoc(appointmentRef);
            const appointmentData = appointmentDoc.data();
            const doctorsQuery = query(collection(firestore, 'doctors'), where('practiceid', '==', appointmentData.PracticeId));
            const doctorsSnapshot = await getDocs(doctorsQuery);
            const doctors = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDoctorsList(doctors);
            setShowDoctorSelection(true);
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
            fetchData(); // Refetch appointments to reflect changes
        } catch (error) {
            console.error('Error assigning doctor:', error);
        }
    };    

    const handleCancelAssignDoctor = () => {
        setShowDoctorSelection(false);
        setSelectedDoctor('');
        setSelectedAppointmentId('');
    };

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

    const handleTestModalClose = () => {
        setTestmodal(false);
    };

    const handletestmodalopen = () => {
        setTestmodal(true);
    };

    const handleSendMail1 = async () => {
        try {
            const response = await axios.post('https://healthhubbackend-5ffw.onrender.com/send-email', {
                to: testpatientEmail,
                subject: 'Test Results',
                text: `Dear patient, your test results are as follows: ${testResults}`
            });
            console.log(response.data); 
            const patientQuery = query(collection(firestore, 'patient'), where('email', '==', testpatientEmail));
            const querySnapshot = await getDocs(patientQuery);
            if (!querySnapshot.empty) {
                const patientDocRef = querySnapshot.docs[0].ref;
                await updateDoc(patientDocRef, { testResults: testResults });
            } else {
                console.error('Patient with email not found:', testpatientEmail);
            }
            handleTestModalClose(); 
            setSubmitModal1(true);
        } catch (error) {
            console.error('Error sending email:', error); // Log any errors
        }
    };
    
    const handleSendMail = async () => {
        try {
            const response = await axios.post('https://healthhubbackend-5ffw.onrender.com/send-email', {
                to: patientEmail,
                subject: 'New Appointment Date',
                text: ` Hii ${appointments[0].patientName},
                 Your new appointment date is ${newAppointmentDate}

                 Please feel free to contact us if you have any questions or concerns.
                 Contact Us: healthhub75@gmail.com` 
                
            });
          
            console.log(response.data); 
            handleModalClose();
        } catch (error) {
            console.error('Error sending email:', error); 
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
                                <button onClick={() => handleReject(appointment.id)} className="bg-red-500 text-white px-4 py-2 mr-2">Reject</button>
                                <button onClick={() => handleOfferAlternative(appointment.patientemailid)} className="bg-blue-500 text-white px-4 py-2">Offer Alternative</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <label className="block text-gray-700 text-sm font-bold mb-2 cursor-pointer mt-5" >
                Click below to update the Patient's Test Result ⬇️
            </label>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-1 rounded" onClick={handletestmodalopen}> 
                Test Result
            </button>
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
            {Testmodal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg max-w-md mx-auto">
                        <h2 className="text-xl font-bold mb-4">Test Results</h2>
                        <label htmlFor="patientEmail" className="block mb-2">Patient Email ID:</label>
                        <input type="email" id="patientEmail" value={testpatientEmail} onChange={(e) => settestpatientEmail(e.target.value)} className="border border-gray-300 rounded-md mb-4 p-2 block w-full" />
                        <label htmlFor="testResults" className="block mb-2">Test Results:</label>
                        <input type="text" id="testResults" value={testResults} onChange={(e) => setTestResults(e.target.value)} className="border border-gray-300 rounded-md mb-4 p-2 block w-full" />
                        <button className="bg-blue-500 text-white px-4 py-2 mr-2" onClick={handleSendMail1}>Notify Patient</button>
                        <button className="bg-gray-300 text-gray-700 px-4 py-2" onClick={handleTestModalClose}>Cancel</button>
                    </div>
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
            <div className="flex flex-col min-h-screen">
                <div className="flex-grow">
                    <SubmitModal SubmitModal1={SubmitModal1} closeSubmitModal1={closeSubmitModal1} message="Email Sent Sucessfully 😊" />
                </div>
                <footer className="bg-gray-200 text-gray-600 py-4 px-6 text-center">
                    &copy; {new Date().getFullYear()} Health Hub
                </footer>
            </div>
        </div>
    );
};

export default PractitionerComponent;
