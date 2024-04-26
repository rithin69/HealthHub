import React, { useState } from 'react';

const AddPracticeModal = ({ showModal, setShowModal, handleAddPractice }) => {
  const [practiceForm, setPracticeForm] = useState({
    name: '',
    address: '',
    city: '',
    image: '',
    services: ''
  });

  const handlePracticeFormChange = (e) => {
    setPracticeForm({
      ...practiceForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddPractice(practiceForm);
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Add Practice</h3>
            <form onSubmit={handleAddPractice}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" name="name" id="name" value={practiceForm.name} onChange={handlePracticeFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" name="address" id="address" value={practiceForm.address} onChange={handlePracticeFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" name="city" id="city" value={practiceForm.city} onChange={handlePracticeFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image URL</label>
                <input type="text" name="image" id="image" value={practiceForm.image} onChange={handlePracticeFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="mb-4">
                <label htmlFor="services" className="block text-sm font-medium text-gray-700">Services</label>
                <input type="text" name="services" id="services" value={practiceForm.services} onChange={handlePracticeFormChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="mr-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
                <button type="submit" className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add Practice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPracticeModal;
