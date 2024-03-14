import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../utils/Firebase'; // Correct the path as necessary
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Hospitals = () => {
    const [hospitals, setHospitals] = useState([]);

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const querySnapshot = await getDocs(collection(firestore, 'practice'));
                const hospitalList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    services: doc.data().services || [], // Ensure 'services' is an array
                    selectedDate: null // Add a selectedDate field to each hospital
                }));
                setHospitals(hospitalList);
            } catch (error) {
                console.error("Error fetching hospitals: ", error);
                setHospitals([]); // Set to an empty array in case of error
            }
        };

        fetchHospitals();
    }, []);

    const bookAppointment = (hospitalId, date) => {
        console.log(`Booking appointment for ${hospitalId} on ${date}`);
        // Implement booking logic here
    };

    const handleDateChange = (hospitalId, date) => {
        setHospitals(hospitals.map(hospital => 
            hospital.id === hospitalId ? { ...hospital, selectedDate: date } : hospital
        ));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {hospitals.map((hospital) => (
                <div key={hospital.id} className="max-w-sm rounded overflow-hidden shadow-lg bg-white cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out flex flex-col justify-between">
                    <div>
                        <img className="w-full h-48 object-cover" src={hospital.image} alt={`Image of ${hospital.name}`} />
                        <div className="px-6 py-4">
                            <div className="font-bold text-xl mb-2">{hospital.name}</div>
                            <p className="text-gray-700 text-base">Address: {hospital.address}</p>
                            <p className="text-gray-700 text-base">City: {hospital.city}</p>
                            <div>
                                <label htmlFor={`${hospital.id}-services`} className="block text-sm font-medium text-gray-700">Select Service:</label>
                                <select id={`${hospital.id}-services`} name="services" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    <option value="">Please select a service</option>
                                    {hospital.services.map((service, index) => (
                                        <option key={index} value={service}>{service}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4">
                        <div>
                            <label htmlFor={`${hospital.id}-appointmentDate`} className="block text-sm font-medium text-gray-700">Appointment Date:</label>
                            <DatePicker 
                                selected={hospital.selectedDate}
                                onChange={(date) => handleDateChange(hospital.id, date)}
                                placeholderText="Please select a date"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                id={`${hospital.id}-appointmentDate`}
                            />
                        </div>
                        <button 
                            className="mt-4 w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition-colors duration-150 ease-in-out"
                            onClick={() => bookAppointment(hospital.id, hospital.selectedDate)}
                        >
                            Book Appointment
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Hospitals;
