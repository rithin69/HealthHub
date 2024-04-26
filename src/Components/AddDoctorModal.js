import React, { useState } from 'react';

const AddDoctorModal = ({ showModal, setShowModal, handleAddDoctor }) => {
  const [doctorForm, setDoctorForm] = useState({
    doctorName: '',
    email: '',
    password: '',
    phone: '',
    practiceid: '',
    specialization: ''
  });

  const handleDoctorFormChange = (e) => {
    setDoctorForm({
      ...doctorForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddDoctor(doctorForm);
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Add Doctor</h3>
            <form onSubmit={handleAddDoctor}>
              <div className="mb-4">
                <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">Doctor Name</label>
                <input type="text" name="doctorName" id="doctorName" value={doctorForm.doctorName} onChange={handleDoctorFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" id="email" value={doctorForm.email} onChange={handleDoctorFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" id="password" value={doctorForm.password} onChange={handleDoctorFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="text" name="phone" id="phone" value={doctorForm.phone} onChange={handleDoctorFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="practiceid" className="block text-sm font-medium text-gray-700">Practice ID</label>
                <input type="text" name="practiceid" id="practiceid" value={doctorForm.practiceid} onChange={handleDoctorFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Specialization</label>
                <input type="text" name="specialization" id="specialization" value={doctorForm.specialization} onChange={handleDoctorFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="mr-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
                <button type="submit" className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddDoctorModal;
