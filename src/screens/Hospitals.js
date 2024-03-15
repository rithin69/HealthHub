import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../utils/Firebase';

const Hospitals = () => {
    const [hospitals, setHospitals] = useState([]);
    const currentUser = useSelector(state => state.user); 
    const [selectedHospitalId, setSelectedHospitalId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

        await updateDoc(doc(firestore, 'users', currentUser.uid), {
            PracticeRegistered: true,
        });
        setSelectedHospitalId(hospitalId);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="relative">
            {/* Conditional title rendering */}
            {selectedHospitalId ? (
                <h1 className="text-xl font-semibold text-center mb-4">REGISTERED PRACTICE</h1>
            ) : (
                null
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {selectedHospitalId ? (
                    hospitals.filter(hospital => hospital.id === selectedHospitalId).map(renderHospitalCard)
                ) : (
                    hospitals.map(renderHospitalCard)
                )}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg max-w-md mx-auto">
                        <p>Congratulations!! You have selected a hospital. Waiting for admin's approval.</p>
                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 float-right" onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );

    function renderHospitalCard(hospital) {
        return (
            <div key={hospital.id} className="max-w-sm rounded overflow-hidden shadow-lg bg-white transition-transform duration-200 ease-in-out hover:scale-105 flex flex-col justify-between">
                <div>
                    <img className="w-full h-48 object-cover" src={hospital.image} alt={hospital.name} />
                    <div className="px-6 py-4">
                        <div className="font-bold text-xl mb-2">{hospital.name}</div>
                        <p className="text-gray-700 text-base">Address: {hospital.address}</p>
                        <p className="text-gray-700 text-base">City: {hospital.city}</p>
                    </div>
                </div>
                <div className="px-6 py-4">
                    {selectedHospitalId === hospital.id ? (
                        <p className="text-center text-sm">Thank you for registering. Waiting for admin's approval.</p>
                    ) : (
                        <button onClick={() => handleRegisterClick(hospital.id)} className="w-full bg-blue-500 text-white text-sm px-6 py-3 hover:bg-blue-700 transition-colors">Register</button>
                    )}
                </div>
            </div>
        );
    }
};

export default Hospitals;
