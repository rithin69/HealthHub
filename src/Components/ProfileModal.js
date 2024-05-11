import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../utils/Firebase';

const ProfileModal = ({ isOpen, closeModal }) => {
    const currentUser = useSelector(state => state.user);
    const [profileDetails, setProfileDetails] = useState({
        gender: '',
        fullName: '',
        dob: new Date(),
        address: '',
        email: ''
    });

  
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

    const handleInputChange = (field, value) => {
        setProfileDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (date) => {
        setProfileDetails(prev => ({ ...prev, dob: date }));
    };

    const saveProfile = async () => {
        if (currentUser?.uid) {
            const userDocRef = doc(firestore, 'patient', currentUser.uid);
            const updatedData = {
                ...profileDetails,
                dob: profileDetails.dob 
            };
            await updateDoc(userDocRef, updatedData);
            closeModal();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-4/5 max-w-3xl mx-auto">
                <h1 className="text-lg font-semibold text-center mb-4 bg-green-600">My Profile</h1>
                <div className="space-y-6">
                  <div className="flex flex-col">
                    <label className="mb-1">Name :</label>  
                    <input type="text" value={profileDetails.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="Patient Name" />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1">Email :</label>  
                    <input type="email" value={profileDetails.email} onChange={e => handleInputChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="Email" />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1">Address :</label>  
                    <input type="text" value={profileDetails.address} onChange={e => handleInputChange('address', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="Address" />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1">DOB :</label>  
                    <DatePicker selected={profileDetails.dob} onChange={handleDateChange} className="w-full px-3 py-2 border border-gray-300 rounded text-gray-700" />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1">Gender :</label>  
                    <select value={profileDetails.gender} onChange={e => handleInputChange('gender', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                  </div>
                    <div className="flex justify-between mt-8">
                        <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                        <button onClick={saveProfile} className="bg-blue-500 text-white px-4 py-2 rounded bg-green-500">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
