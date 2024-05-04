import React, { useState, useEffect } from 'react';
import { firestore } from '../utils/Firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';

const PractitionerComponent = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

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
            await updateDoc(doc(firestore, 'appointment_booking', id), { bookingconfirmed: 'Approved' });
            setAppointments(appointments.filter(appointment => appointment.id !== id));
        } catch (error) {
            console.error('Error accepting appointment:', error);
        }
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PractitionerComponent;
