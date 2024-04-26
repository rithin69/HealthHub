import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { collection, getDocs, doc, updateDoc, addDoc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { firestore } from '../utils/Firebase';

const Hospitals = () => {
    const [hospitals, setHospitals] = useState([]);

    const currentUser = useSelector(state => state.user);

    const [selectedHospitalId, setSelectedHospitalId] = useState(localStorage.getItem('selectedHospitalId'));

    const [isRegistered, setIsRegistered] = useState(localStorage.getItem('isRegistered') === 'true');

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [selectedService, setSelectedService] = useState('');

    const [services, setServices] = useState([]);

    const [registrationRequest, setRegistrationRequest] = useState(null);

    const [bookingConfirmed, setBookingConfirmed] = useState();

    //const [blockappo,setblockappo]=useState(true);


    useEffect(() => {
        const fetchHospitals = async () => {
            localStorage.setItem('userUID', currentUser.uid || "sadasdasd");
            const querySnapshot = await getDocs(collection(firestore, 'practice'));
            const fetchedHospitals = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setHospitals(fetchedHospitals);
        };
        fetchHospitals();
    }, []);

    useEffect(() => {
        const fetchRegistrationStatus = async () => {
            if (currentUser?.uid) {
                const userDocRef = doc(firestore, 'patient', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists() && userDocSnap.data().PracticeRegistered) {
                    setIsRegistered(true);
                    setSelectedHospitalId(userDocSnap.data().selectedHospitalId);

                    const registrationRef = collection(firestore, 'patient_practice_registration');
                    const querySnapshot = await getDocs(query(registrationRef, where("patientId", "==", currentUser.uid)));


                    if (!querySnapshot.empty) {
                        // console.log("dasdasd")

                        const registrationData = querySnapshot.docs[0].data();
                        let registrationRequest = registrationData.registrationRequest;
                        setRegistrationRequest(registrationRequest);
                    } else {

                        setRegistrationRequest("Pending");
                    }
                    const bookingRef1 = collection(firestore, 'appointment_booking');
                   // console.log(currentUser.uid);
                    const bookingSnapshot = await getDocs(query(bookingRef1, where("patientId", "==", currentUser.uid)));
                    const bookingExists = !bookingSnapshot.empty && bookingSnapshot.docs.some(doc => doc.data().bookingconfirmed);
                    //console.log(bookingSnapshot.empty);
                    //console.log(bookingSnapshot.docs.some(doc => doc.data().bookingconfirmed));
                    //console.log(bookingExists)
                    setBookingConfirmed(bookingExists);
                    if (bookingExists) {
                        const bookingData = bookingSnapshot.docs.find(doc => doc.data().bookingconfirmed).data();
                        setSelectedService(bookingData.consultingService);
                        setSelectedDate(new Date(bookingData.appointmentDate));
                    }


                }

            }
        };

        fetchRegistrationStatus();
    }, [currentUser?.uid]);

    useEffect(() => {
        if (isRegistered && selectedHospitalId) {
            const hospitalDocRef = doc(firestore, 'practice', selectedHospitalId);
            const fetchServices = async () => {
                const hospitalDocSnap = await getDoc(hospitalDocRef);
                if (hospitalDocSnap.exists()) {
                    setServices(hospitalDocSnap.data().services);
                }
                console.log(selectedService);
            };
            fetchServices();
        }
    }, [isRegistered, selectedHospitalId]);

    useEffect(() => {
        console.log('isRegistered:', isRegistered);
        console.log('registrationRequest:', registrationRequest);
        console.log('bookingConfirmed:', bookingConfirmed);
    }, [isRegistered, registrationRequest, bookingConfirmed]); 

    // Handling the click on the register button
    const handleRegisterClick = async (hospitalId) => {
        if (!currentUser?.uid) return;

        // Assuming `currentUser.uid` is correctly fetched from your store
        const userDocRef = doc(firestore, 'patient', currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            await updateDoc(userDocRef, {
                PracticeRegistered: true,
                selectedHospitalId: hospitalId,
            });
        } else {
            await setDoc(userDocRef, {
                PracticeRegistered: true,
                selectedHospitalId: hospitalId,
            });
        }

        await addDoc(collection(firestore, 'patient_practice_registration'), {
            patientId: currentUser.uid,
            practiceId: hospitalId,
            registrationDate: new Date(),
            registrationRequest: "Pending",
        });

        setSelectedHospitalId(hospitalId);
        setIsRegistered(true);

        // Show the modal
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleBookingConfirmation = async () => {
        const registrationRef = collection(firestore, 'patient_practice_registration');
        const querySnapshot = await getDocs(query(registrationRef, where("patientId", "==", currentUser.uid)));

        // Ensure we have a registration record to work with
        if (!querySnapshot.empty) {
            const registrationDoc = querySnapshot.docs[0];
            const formattedDate = selectedDate.toISOString().split('T')[0]; // Format date as you like

            // Create a new document in the 'appointment_booking' collection
            const bookingRef = collection(firestore, 'appointment_booking');

            await addDoc(bookingRef, {
                appointmentDate: formattedDate,
                consultingService: selectedService,
                PracticeId: selectedHospitalId,
                PatientPracticeregistrationId: registrationDoc.id,
                bookingconfirmed: true,
                patientId:currentUser.uid
            });

            setBookingConfirmed(true);
            // setblockappo(false);
            // Optionally, clear selectedService and selectedDate here or keep them for showing to the user
        }
    };


    return (
        <div className="relative">

            {registrationRequest === 'Rejected' ? (
                <h1 className="text-2xl font-semibold text-center mb-4 text-red-500">Sorry, your Registration Request got Rejected.</h1>
            ) : registrationRequest === 'Approved' && !bookingConfirmed ? (
                <h1 className="text-2xl font-semibold text-center mb-4 text-blue-600">Admin has approved your Registration request. Please book an appointment.</h1>
            ) : !isRegistered ? (
                <h1 className="text-xl font-semibold text-center mb-4">Please Select a Hospital From The List of Hospitals</h1>
            ) : bookingConfirmed ? (
                <h1 className="text-2xl font-semibold text-center mb-4 text-green-600">Thank you for booking an appointment with us!</h1>
            ) : registrationRequest==="Pending"?(
                <h1 className="text-2xl font-semibold text-center mb-4 text-blue-600">Your Selected Hospital. Waiting for Admin's Approval...</h1>
            ) : <h1 className="text-2xl font-semibold text-center mb-4 text-blue-600">Your Selected Hospital. Waiting for Admin's Approval...</h1>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {hospitals.filter(hospital => !isRegistered || hospital.id === selectedHospitalId).map((hospital) => (
                    <div
                        key={hospital.id}
                        className="max-w-sm rounded overflow-hidden shadow-lg bg-white hover:scale-105 transition-transform duration-200 ease-in-out flex flex-col justify-between"
                    >
                        <div>
                            <img
                                className="w-full h-48 object-cover"
                                src={hospital.image}
                                alt={hospital.name}
                            />
                            <div className="px-6 py-4">
                                <div className="font-bold text-xl mb-2">{hospital.name}</div>
                                <p className="text-gray-700 text-base">Address: {hospital.address}</p>
                                <p className="text-gray-700 text-base">City: {hospital.city}</p>
                            </div>
                        </div>
                        {!isRegistered && (
                            <div className="px-6 py-4">
                                <button
                                    onClick={() => handleRegisterClick(hospital.id)}
                                    className="w-full bg-blue-500 text-white text-sm px-6 py-3 hover:bg-blue-700 transition-colors"
                                >
                                    Register
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg max-w-md mx-auto">
                        <p>Congratulations!! You have selected {hospitals.find(hospital => hospital.id === selectedHospitalId)?.name}. Waiting for admin's approval.</p>
                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 float-right" onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
            
            

            {isRegistered && registrationRequest === 'Approved' && !bookingConfirmed && (
                <>
                    
                    <div className="px-6 py-4">
                        <label htmlFor="service" className="block text-sm font-medium text-gray-700">Select Service</label>
                        <select id="service" name="service" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                            <option value="">Select a service</option>
                            {services.map((service) => (
                                <option key={service} value={service}>{service}</option>
                            ))}
                        </select>
                    </div>
                    <div className="px-6 py-4">
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Select Date</label>
                        <DatePicker id="date" name="date" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" selected={selectedDate} onChange={(date) => setSelectedDate(date)} />
                    </div>
                    <div className="px-6 py-4">
                        <button className="w-full bg-blue-500 text-white text-sm px-6 py-3 hover:bg-blue-700 transition-colors" onClick={() => { handleBookingConfirmation() }} >Submit</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Hospitals;