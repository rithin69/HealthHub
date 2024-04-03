import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { collection, getDocs, doc, updateDoc, addDoc, setDoc,getDoc } from 'firebase/firestore';
import { firestore } from '../utils/Firebase';

const Hospitals = () => {
    const [hospitals, setHospitals] = useState([]);
    const currentUser = useSelector(state => state.user);
    const [selectedHospitalId, setSelectedHospitalId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const fetchHospitals = async () => {
            const querySnapshot = await getDocs(collection(firestore, 'practice'));
            const fetchedHospitals = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setHospitals(fetchedHospitals);
        };

        fetchHospitals();
    }, []);

    const handleRegisterClick = async (hospitalId) => {
        if (!currentUser?.uid) return;

        const userDocRef = doc(firestore, 'patient', currentUser.uid);
        // Check if user exists in the patients collection
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            // Update if exists
            await updateDoc(userDocRef, {
                PracticeRegistered: true,
            });
        } else {
            // Create if doesn't exist
            await setDoc(userDocRef, {
                PracticeRegistered: true,
            });
        }

        await addDoc(collection(firestore, 'patient_practice_registration'), {
            patientId: currentUser.uid,
            practiceId: hospitalId,
            registrationDate: new Date(),
            registrationRequest: "Pending",
        });

        setSelectedHospitalId(hospitalId);
        setIsModalOpen(true);
        setIsRegistered(true); // Set registration flag to true
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="relative">
            {!isRegistered && (
                <h1 className="text-xl font-semibold text-center mb-4">Please Select a Hospital From The List of Hospitals</h1>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {hospitals.filter(hospital => !isRegistered || hospital.id === selectedHospitalId).map((hospital) => (
                    <div key={hospital.id} className="max-w-sm rounded overflow-hidden shadow-lg bg-white hover:scale-105 transition-transform duration-200 ease-in-out flex flex-col justify-between">
                        <div>
                            <img className="w-full h-48 object-cover" src={hospital.image} alt={hospital.name} />
                            <div className="px-6 py-4">
                                <div className="font-bold text-xl mb-2">{hospital.name}</div>
                                <p className="text-gray-700 text-base">Address: {hospital.address}</p>
                                <p className="text-gray-700 text-base">City: {hospital.city}</p>
                            </div>
                        </div>
                        {!isRegistered && (
                            <div className="px-6 py-4">
                                <button onClick={() => handleRegisterClick(hospital.id)} className="w-full bg-blue-500 text-white text-sm px-6 py-3 hover:bg-blue-700 transition-colors">Register</button>
                            </div>
                        )}
                        {isRegistered && selectedHospitalId === hospital.id && (
                            <p className="px-6 py-3 text-center text-sm">Thank you for registering. Waiting for admin's approval.</p>
                        )}
                    </div>
                ))}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">a
                    <div className="bg-white p-5 rounded-lg max-w-md mx-auto">
                        <p>Congratulations!! You have selected {hospitals.find(hospital => hospital.id === selectedHospitalId)?.name}. Waiting for admin's approval.</p>
                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 float-right" onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hospitals;

