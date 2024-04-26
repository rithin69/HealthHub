import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, updateDoc, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../utils/Firebase';

const Admin = () => {
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorForm, setDoctorForm] = useState({ 
    doctorName: '',
    email: '',
    password: '',
    phone: '',
    practiceid: '', // Selected hospital practice ID
    specialization: '',
    createdAt: new Date()  
  });
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [showModal, setShowModal] = useState(false); // Define showModal state
  const [practices, setPractices] = useState([]);
  const modalRef = useRef(); 
  const [successMessage, setSuccessMessage] = useState('');
  const [practiceForm, setPracticeForm] = useState({
    name: '',
    address: '',
    city: '',
    image: '',
    practiceid: '', // New practice ID
    services: ''
  });
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practitionerForm, setPractitionerForm] = useState({
    practitionerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    degree: '',
    practiceid: '', // Selected hospital practice ID
  });
  const [showPractitionerModal, setShowPractitionerModal] = useState(false);
  const practitionerModalRef = useRef();
  const [newPractices, setNewPractices] = useState([]);

  useEffect(() => {
    const fetchRegistrationRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'patient_practice_registration'));
        const requests = querySnapshot.docs.map(async queryDoc => {
          const data = queryDoc.data();
          let patientName = '';
          const patientDocRef = doc(firestore, 'patient', data.patientId);
          const patientDocSnap = await getDoc(patientDocRef);
          if (patientDocSnap.exists()) {
            const patientData = patientDocSnap.data();
            patientName = patientData.fullName;
          }
  
          let practiceName = '';
          const practiceDocRef = doc(firestore, 'practice', data.practiceId);
          const practiceDocSnap = await getDoc(practiceDocRef);
          if (practiceDocSnap.exists()) {
            const practiceData = practiceDocSnap.data();
            practiceName = practiceData.name;
          }
  
          return {
            id: queryDoc.id,
            patientName: patientName || 'Unknown',
            practiceName: practiceName || 'Unknown',
            ...data
          };
        });
        Promise.all(requests).then(result => {
          setRegistrationRequests(result);
          setLoading(false);
        });
        const hospitalsSnapshot = await getDocs(collection(firestore, 'practice'));
        const hospitalsData = hospitalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPractices(hospitalsData);
        console.log(hospitalsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchRegistrationRequests();

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);  

  const handleApprove = async (requestId) => {
    try {
      await updateDoc(doc(firestore, 'patient_practice_registration', requestId), { registrationRequest: 'Approved' });
      const updatedRequests = registrationRequests.filter(request => request.id !== requestId);
      setRegistrationRequests(updatedRequests);
      console.log('Request approved:', requestId);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };
  
  const handleReject = async (requestId) => {
    try {
      await updateDoc(doc(firestore, 'patient_practice_registration', requestId), { registrationRequest: 'Rejected' });
      const updatedRequests = registrationRequests.filter(request => request.id !== requestId);
      setRegistrationRequests(updatedRequests);
      console.log('Request rejected:', requestId);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleDoctorFormChange = (e) => {
    setDoctorForm({
      ...doctorForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      // Add new doctor to 'doctors' collection
      await addDoc(collection(firestore, 'doctors'), doctorForm);
      console.log('Doctor added successfully:', doctorForm);
      setSuccessMessage(`Doctor ${doctorForm.doctorName} added successfully`);
      // Clear doctor form fields
      setDoctorForm({
        doctorName: '',
        email: '',
        password: '',
        phone: '',
        practiceid: '',
        specialization: '',
        createdAt: new Date()
      });

      // Close modal
      setShowModal(false);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error adding doctor:', error);
    }
  };

  const handlePractitionerFormChange = (e) => {
    setPractitionerForm({
      ...practitionerForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleAddPractitioner = async (e) => {
    e.preventDefault();
    try {
      // Add new practitioner to 'practitioner' collection
      await addDoc(collection(firestore, 'practitioner'), practitionerForm);
      console.log('Practitioner added successfully:', practitionerForm);
      // Clear practitioner form fields
      setPractitionerForm({
        practitionerName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        degree: '',
        practiceid: '',
      });
      // Close modal
      setShowPractitionerModal(false);
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error adding practitioner:', error);
    }
  };  

  const handlePracticeFormChange = (e) => {
    setPracticeForm({
      ...practiceForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddPractice = async (e) => {
    e.preventDefault();
    try {
      // Increment the practiceid by finding the current number of practices and adding 1
      const practicesCollection = collection(firestore, 'practice');
      const practicesSnapshot = await getDocs(practicesCollection);
      const practiceCount = practicesSnapshot.size;
      const practiceId = practiceCount + 11;

      // Add new practice to 'practice' collection with incremented practiceid
      await addDoc(practicesCollection, {
        ...practiceForm,
        practiceid: practiceId,
        createdAt: serverTimestamp()
      });

      console.log('Practice added successfully:', practiceForm);
      setSuccessMessage(`Practice ${practiceForm.name} added successfully`);

      // Clear practice form fields
      setPracticeForm({
        name: '',
        address: '',
        city: '',
        image: '',
        practiceid: '',
        services: '',
        createdAt: new Date()
      });

      // Inside the handleAddPractice function after adding the practice to Firestore
      const addedPracticeRef = await addDoc(collection(firestore, 'practice'), practiceForm);
      const addedPracticeDoc = await getDoc(addedPracticeRef);
      const newPractice = { id: addedPracticeDoc.id, ...addedPracticeDoc.data() };
      // Now you can use newPractice to update the state or perform any other actions
      setNewPractices([...newPractices, newPractice]);

      // Close modal
      setShowModal(false);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error adding practice:', error);
    }
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Registration Requests</h2>
        <div className="mb-8">
          <button onClick={() => setShowModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none">Add Doctor</button>
          <button onClick={() => setShowPracticeModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none">Add Practice</button>
          <button onClick={() => setShowPractitionerModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none">Add Practitioner</button>
        </div>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg shadow-sm">
              <thead className="bg-gray-200 text-gray-700 uppercase ">
                <tr className="text-left">
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Practice Name</th>
                  <th className="px-4 py-3">Registration Date and Time</th>
                  <th className="px-4 py-3">Registration Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {registrationRequests.map(request => (
                  <tr key={request.id} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-4">{request.patientName}</td>
                    <td className="px-4 py-4">{request.practiceName}</td>
                    <td className="px-4 py-4">{formatDate(request.registrationDate)}</td>
                    <td className="px-4 py-4">{request.registrationRequest}</td>
                    <td className="px-4 py-4 flex items-center space-x-2">
                      <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded focus:outline-none" onClick={() => handleApprove(request.id)}>Approve</button>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded focus:outline-none" onClick={() => handleReject(request.id)}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal for adding a new doctor */}
        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" ref={modalRef}>
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
                              onClick={() => setShowModal(false)}
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
        )}

        {/* Modal for adding a new practitioner */}
        {showPractitionerModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" ref={practitionerModalRef}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Practitioner</h3>
                      <form onSubmit={handleAddPractitioner}>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-2">Practitioner Name</label>
                            <input type="text" name="practitionerName" value={practitionerForm.practitionerName} onChange={handlePractitionerFormChange} className="w-full border rounded py-2 px-3" />
                          </div>
                          <div>
                            <label className="block mb-2">Email</label>
                            <input type="email" name="email" value={practitionerForm.email} onChange={handlePractitionerFormChange} className="w-full border rounded py-2 px-3" />
                          </div>
                          <div>
                            <label className="block mb-2">Phone</label>
                            <input type="text" name="phone" value={practitionerForm.phone} onChange={handlePractitionerFormChange} className="w-full border rounded py-2 px-3" />
                          </div>
                          <div>
                            <label className="block mb-2">Practice</label>
                            <select name="practiceid" value={practitionerForm.practiceid} onChange={handlePractitionerFormChange} className="w-full border rounded py-2 px-3">
                              <option value="">Select Practice</option>
                              {newPractices.map(practice => (
                                <option key={practice.id} value={practice.id}>{practice.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none">Add Practitioner</button>
                          </div>
                          <div className="absolute top-0 right-0 p-4">
                            <button
                              onClick={() => setShowPractitionerModal(false)}
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
        )}

        {/* Modal for adding a new practice */}
        {showPracticeModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" ref={modalRef}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Practice</h3>
                      <form onSubmit={handleAddPractice}>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block mb-2">Practice Name</label>
                            <input type="text" name="name" value={practiceForm.name} onChange={handlePracticeFormChange} className="w-full border rounded py-2 px-3" />
                          </div>
                          <div>
                            <label className="block mb-2">Address</label>
                            <input type="text" name="address" value={practiceForm.address} onChange={handlePracticeFormChange} className="w-full border rounded py-2 px-3" />
                          </div>
                          <div>
                            <label className="block mb-2">City</label>
                            <input type="text" name="city" value={practiceForm.city} onChange={handlePracticeFormChange} className="w-full border rounded py-2 px-3" />
                          </div>
                          <div>
                            <label className="block mb-2">Image</label>
                            <input type="text" name="image" value={practiceForm.image} onChange={handlePracticeFormChange} className="w-full border rounded py-2 px-3" />
                          </div>
                          <div className="col-span-1">
                            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none">Add Practice</button>
                          </div>
                          <div className="absolute top-0 right-0 p-4">
                            <button
                              onClick={() => setShowPracticeModal(false)}
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
        )}


        {/* Success message */}
        {successMessage && (
          <div className="bg-white text-black-900 px-4 py-2 fixed top-0 left-0 right-0 mx-auto mt-4 max-w-sm text-center rounded-md shadow-md">
            {successMessage} <span className="text-green-500">&#10003;</span>
          </div>
        )}
      </div>
    </div>
  );  
};

export default Admin;
