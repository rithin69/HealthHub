import React, { useState } from 'react';

const AddPractitionerModal = ({ showModal, setShowModal, handleAddPractitioner }) => {
  const [practitionerForm, setPractitionerForm] = useState({
    practitionerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    degree: '',
    practiceid: ''
  });

  const handlePractitionerFormChange = (e) => {
    setPractitionerForm({
      ...practitionerForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddPractitioner(practitionerForm);
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Add Practitioner</h3>
            <form onSubmit={handleAddPractitioner}>
              <div className="mb-4">
                <label htmlFor="practitionerName" className="block text-sm font-medium text-gray-700">Practitioner Name</label>
                <input type="text" name="practitionerName" id="practitionerName" value={practitionerForm.practitionerName} onChange={handlePractitionerFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" id="email" value={practitionerForm.email} onChange={handlePractitionerFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" id="password" value={practitionerForm.password} onChange={handlePractitionerFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="text" name="phone" id="phone" value={practitionerForm.phone} onChange={handlePractitionerFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" name="address" id="address" value={practitionerForm.address} onChange={handlePractitionerFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700">Degree</label>
                <input type="text" name="degree" id="degree" value={practitionerForm.degree} onChange={handlePractitionerFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="practiceid" className="block text-sm font-medium text-gray-700">Practice ID</label>
                <input type="text" name="practiceid" id="practiceid" value={practitionerForm.practiceid} onChange={handlePractitionerFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="mr-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
                <button type="submit" className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add Practitioner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPractitionerModal;
