// Admin.js
import React, { useState } from 'react';
import RegistrationRequests from '../Components/RegistrationRequests';
import AddDoctorModal from '../Components/AddDoctorModal';
import AddPracticeModal from '../Components/AddPracticeModal';
import AddPractitionerModal from '../Components/AddPractitionerModal';

const Admin = () => {
  const [selectedTab, setSelectedTab] = useState('registration');
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [showPractitionerModal, setShowPractitionerModal] = useState(false);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  return (
    <div className="w-full mx-auto px-4">
      <div className="flex justify-between mb-8">
        <button className={`flex-1 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 font-bold`} onClick={() => handleTabChange('registration')}>Registration Requests</button>
        <button className={`flex-1 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 font-bold`} onClick={() => handleTabChange('add')}>Add Medical Member/Practice</button>
      </div>
      
      {selectedTab === 'registration' && (
        <div className="w-full">
          <RegistrationRequests />
        </div>
      )}
      
      {selectedTab === 'add' && (
        <div className="w-full">
          <h3 className="text-xl font-semibold mb-4">Add Doctor/Practice/Practitioner</h3>
          <div className="flex flex-col space-y-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded focus:outline-none" onClick={() => setShowDoctorModal(true)}>Add Doctor</button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded focus:outline-none" onClick={() => setShowPracticeModal(true)}>Add Practice</button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded focus:outline-none" onClick={() => setShowPractitionerModal(true)}>Add Practitioner</button>
          </div>
        </div>
      )}
  
      <AddDoctorModal showModal={showDoctorModal} setShowModal={setShowDoctorModal} />
      <AddPracticeModal showModal={showPracticeModal} setShowModal={setShowPracticeModal} />
      <AddPractitionerModal showModal={showPractitionerModal} setShowModal={setShowPractitionerModal} />
    </div>
  );  
};

export default Admin;