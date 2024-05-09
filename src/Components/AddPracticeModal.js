import React, { useState, useRef } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../utils/Firebase';

const AddPracticeModal = ({ onClose }) => {
    const [showPracticeModal, setShowPracticeModal] = useState(false);
    const [practiceForm, setPracticeForm] = useState({
      name: '',
      address: '',
      city: '',
      image: '',
      services: ''
    });
    const [practiceIdCounter, setPracticeIdCounter] = useState(11); 
    const [successMessage, setSuccessMessage] = useState('');

    const modalRef = useRef(null);
  
    const handlePracticeFormChange = (e) => {
      setPracticeForm({
        ...practiceForm,
        [e.target.name]: e.target.value
      });
    };
  
    const handleAddPractice = async (e) => {
      e.preventDefault();
      try {
    
        const practiceId = practiceIdCounter.toString(); 
        await addDoc(collection(firestore, 'practice'), {
          practiceid: practiceId,
          ...practiceForm,
          createdInAddPracticeModal: true,
          createdAt: serverTimestamp()
        });
        setSuccessMessage('Practice added successfully.');
        console.log('Practice added successfully:', practiceForm);
       
        setPracticeIdCounter(prevCounter => prevCounter + 1);
        
        setPracticeForm({
          name: '',
          address: '',
          city: '',
          image: '',
          services: ''
        });
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 2000);
      } catch (error) {
        console.error('Error adding practice:', error);
      }
    };

    return (
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
                    {successMessage && (
                      <div className="bg-green-200 text-green-700 px-4 py-2 rounded mb-4">{successMessage}</div>
                    )}
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

export default AddPracticeModal;
