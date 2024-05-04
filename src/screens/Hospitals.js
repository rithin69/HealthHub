import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { collection, getDocs, doc, updateDoc, addDoc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { firestore } from '../utils/Firebase';
import AppointmentList from '../Components/AppointmentList';

const Hospitals = () => {
    const [appointments, setAppointments] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const currentUser = useSelector(state => state.user);
    const [selectedHospitalId, setSelectedHospitalId] = useState();
    const [isRegistered, setIsRegistered] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedService, setSelectedService] = useState('');
    const [services, setServices] = useState([]);
    const [registrationRequest, setRegistrationRequest] = useState(null);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [bookingButtonDisabled, setBookingButtonDisabled] = useState(bookingConfirmed === undefined || !bookingConfirmed);
    const [showBookingForm, setShowBookingForm] = useState(true);
    const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileDetails, setProfileDetails] = useState({
        gender: '',
        patientName: '',
        dob: new Date(), // Default to today's date
        address: '',
        email: ''
    });
    const bookingButtonRef = React.createRef();

    const closeModal = () => setIsModalOpen(false);

    const convertFirestoreTimestampToDate = (timestamp) => {
        return timestamp ? new Date(timestamp.seconds * 1000) : new Date();
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (currentUser?.uid) {
                const userDocRef = doc(firestore, 'patient', currentUser.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const dobDate = userData.dob ? convertFirestoreTimestampToDate(userData.dob) : new Date();
                    setProfileDetails({ ...userData, dob: dobDate });
                }
            }
        };

        fetchUserProfile();
    }, [currentUser?.uid]);

    const toggleHamburgerMenu = () => {
        setShowHamburgerMenu(!showHamburgerMenu);
    };

    const saveProfile = async () => {
        if (currentUser?.uid && isEditingProfile) {
            const userDocRef = doc(firestore, 'patient', currentUser.uid);
            await updateDoc(userDocRef, {...profileDetails, dob: profileDetails.dob});
            setIsEditingProfile(false);
            setShowHamburgerMenu(false);
        }
    };

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
                        const registrationData = querySnapshot.docs[0].data();
                        setRegistrationRequest(registrationData.registrationRequest);
                    } else {
                        setRegistrationRequest("Pending");
                    }
                    const bookingRef1 = collection(firestore, 'appointment_booking');
                    const bookingSnapshot = await getDocs(query(bookingRef1, where("patientId", "==", currentUser.uid)));
                    const bookingExists = !bookingSnapshot.empty && bookingSnapshot.docs.some(doc => doc.data().bookingconfirmed);
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
    }, [currentUser?.uid, bookingConfirmed]);

    const handleRegisterClick = async (hospitalId) => {
        if (!currentUser?.uid) return;

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
        setIsModalOpen(true);
        setShowBookingForm(true);
    };

    const handleBookingConfirmation = async () => {
        const registrationRef = collection(firestore, 'patient_practice_registration');
        const querySnapshot = await getDocs(query(registrationRef, where("patientId", "==", currentUser.uid)));

        if (!querySnapshot.empty) {
            const registrationDoc = querySnapshot.docs[0];
            const formattedDate = selectedDate.toISOString().split('T')[0];

            const bookingRef = collection(firestore, 'appointment_booking');
            await addDoc(bookingRef, {
                appointmentDate: formattedDate,
                consultingService: selectedService,
                PracticeId: selectedHospitalId,
                PatientPracticeregistrationId: registrationDoc.id,
                bookingconfirmed: "Pending",
                patientId: currentUser.uid
            });

            setBookingConfirmed(true);
            setShowBookingForm(prevState => !prevState);
        }
    };

    const handleBookingConfirmation1 = () => {
        setShowBookingForm(prevState => !prevState);
    };

    return (
        <div className="relative">
            <button onClick={toggleHamburgerMenu} className="hamburger-button">Menu</button>

            {showHamburgerMenu && (
                <div className="menu">
                    <button onClick={() => setIsEditingProfile(!isEditingProfile)}>
                        {isEditingProfile ? 'View Profile' : 'Edit Profile'}
                    </button>
                </div>
            )}

            {isEditingProfile ? (
                <div className="profile-form">
                    <input type="text" value={profileDetails.patientName} onChange={e => setProfileDetails({...profileDetails, patientName: e.target.value})} />
                    <input type="email" value={profileDetails.email} onChange={e => setProfileDetails({...profileDetails, email: e.target.value})} />
                    <input type="text" value={profileDetails.address} onChange={e => setProfileDetails({...profileDetails, address: e.target.value})} />
                    <DatePicker selected={profileDetails.dob} onChange={date => setProfileDetails({...profileDetails, dob: date})} />
                    <select value={profileDetails.gender} onChange={e => setProfileDetails({...profileDetails, gender: e.target.value})}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    <button onClick={saveProfile}>Save Changes</button>
                </div>
            ) : (
                <div className="profile-view">
                    <p>Name: {profileDetails.patientName}</p>
                    <p>Email: {profileDetails.email}</p>
                    <p>Address: {profileDetails.address}</p>
                    <p>Date of Birth: {profileDetails.dob.toLocaleDateString()}</p>
                    <p>Gender: {profileDetails.gender}</p>
                </div>
            )}

            {registrationRequest === 'Rejected' ? (
                <h1 className="text-2xl font-semibold text-center mb-4 text-red-500">Sorry, your Registration Request got Rejected.</h1>
            ) : registrationRequest === 'Approved' && !bookingConfirmed ? (
                <h1 className="text-2xl font-semibold text-center mb-4 text-blue-600">Admin has approved your Registration request. Please book an appointment.</h1>
            ) : !isRegistered ? (
                <h1 className="text-xl font-semibold text-center mb-4">Please Select a Hospital From The List of Hospitals</h1>
            ) : bookingConfirmed ? (
                <h1 className="text-2xl font-semibold text-center mb-4 text-green-600">Thank you for booking an appointment with us!</h1>
                                
            ) : registrationRequest === "Pending" ? (
                <h1 className="text-2xl font-semibold text-center mb-4 text-blue-600">Your Selected Hospital. Waiting for Admin's Approval...</h1>
            ) : (
                <h1 className="text-2xl font-semibold text-center mb-4 text-blue-600">Your Selected Hospital. Waiting for Admin's Approval...</h1>
            )}

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
                        {isRegistered && hospital.id === selectedHospitalId && (
                            <div className="px-6 py-4">
                                <button
                                    ref={bookingButtonRef}
                                    disabled={bookingButtonDisabled}
                                    onClick={handleBookingConfirmation1}
                                    className={`w-full bg-green-500 text-white text-sm px-6 py-3 hover:bg-green-700 transition-colors ${bookingButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    Book Appointment Again
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

            {isRegistered && registrationRequest === 'Approved' && (
                <>
                    {showBookingForm && (
                        <>
                            <div className="px-6 py-4">
                                <label htmlFor="service" className="block text-sm font-medium text-gray-700">Select Service</label>
                                <select id="service" name="service" className="mt-1 block w-3/12 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
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
                                <button className="w-3/12 bg-blue-500 text-white text-sm px-6 py-3 hover:bg-blue-700 transition-colors" onClick={handleBookingConfirmation} >Submit</button>
                            </div>
                        </>
                    )}
                    <AppointmentList appointments={appointments} />
                </>
            )}
        </div>
    );
};

export default Hospitals;