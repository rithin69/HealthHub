import React, { useState, useEffect } from 'react';
import { firestore } from '../utils/Firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';

const AddDoctorModal = ({ onClose }) => {
  const [doctorForm, setDoctorForm] = useState({
    doctorName: '',
    email: '',
    password: '',
    phone: '',
    practiceid: '',
    specialization: '',
    createdAt: new Date()  
  });
  const [practices, setPractices] = useState([]);

  useEffect(() => {
    // Fetch practices from Firestore
    const fetchPractices = async () => {
      const practiceCollection = collection(firestore, 'practice');
      const practiceSnapshot = await getDocs(practiceCollection);
      const practiceList = practiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPractices(practiceList);
    };

    fetchPractices();
  }, []);

  const handleDoctorFormChange = (e) => {
    setDoctorForm({
      ...doctorForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(firestore, 'doctors'), doctorForm);
      console.log('Doctor added successfully:', doctorForm);
      // Clear doctor form fields
      setDoctorForm({
        doctorName: '',
        email: '',
        password: '',
        phone: '',
        practiceid: '',
        degree: '',
        specialization: '',
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error adding doctor:', error);
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Doctor</h3>
                <form onSubmit={handleAddDoctor}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Doctor Name</label>
                      <input type="text" name="doctorName" value={doctorForm.doctorName} onChange={handleDoctorFormChange} className="w-full border rounded py-2 px-3" />
                    </div>
                    <div>
                      <label className="block mb-2">Email</label>
                      <input type="email" name="email" value={doctorForm.email} onChange={handleDoctorFormChange} className="w-full border rounded py-2 px-3" />
                    </div>
                    <div>
                      <label className="block mb-2">Password</label>
                      <input type="password" name="password" value={doctorForm.password} onChange={handleDoctorFormChange} className="w-full border rounded py-2 px-3" />
                    </div>
                    <div>
                      <label className="block mb-2">Phone</label>
                      <input type="text" name="phone" value={doctorForm.phone} onChange={handleDoctorFormChange} className="w-full border rounded py-2 px-3" />
                    </div>
                    <div>
                      <label className="block mb-2">Practice</label>
                      <select name="practiceid" value={doctorForm.practiceid} onChange={handleDoctorFormChange} className="w-full border rounded py-2 px-3">
                        <option value="">Select Practice</option>
                        {practices.map(practice => (
                          <option key={practice.id} value={practice.id}>{practice.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2">Degree</label>
                      <input type="text" name="degree" value={doctorForm.degree} onChange={handleDoctorFormChange} className="w-full border rounded py-2 px-3" />
                    </div>
                    <div>
                      <label className="block mb-2">Specialisation</label>
                      <input type="text" name="specialization" value={doctorForm.specialization} onChange={handleDoctorFormChange} className="w-full border rounded py-2 px-3" />
                    </div>
                    <div className="col-span-2">
                      <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none">Add Doctor</button>
                    </div>
                    <div className="absolute top-0 right-0 p-4">
                      <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-800 focus:outline-none"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default AddDoctorModal;
