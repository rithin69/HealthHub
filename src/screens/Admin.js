import React, { useState } from 'react';
import RegistrationRequests from '../Components/RegistrationRequests';
import AddDoctorModal from '../Components/AddDoctorModal';
import AddPracticeModal from '../Components/AddPracticeModal';
import AddPractitionerModal from '../Components/AddPractitionerModal';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('registrationRequests');
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showPractitionerModal, setShowPractitionerModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h2>
        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            <button onClick={() => handleTabChange('registrationRequests')} className={`${activeTab === 'registrationRequests' ? 'bg-blue-500' : 'bg-blue-300'} hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none`}>Registration Requests</button>
            <button onClick={() => handleTabChange('addNew')} className={`${activeTab === 'addNew' ? 'bg-blue-500' : 'bg-blue-300'} hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none`}>Add New</button>
          </div>
        </div>
        {activeTab === 'registrationRequests' && <RegistrationRequests />}
        {activeTab === 'addNew' && (
          <div>
            <button onClick={() => setShowDoctorModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none">Add Doctor</button>
            <button onClick={() => setShowPractitionerModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none">Add Practitioner</button>
            <button onClick={() => setShowPracticeModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none">Add Practice</button>
          </div>
        )}
        {/* Modals */}
        {showDoctorModal && <AddDoctorModal onClose={() => setShowDoctorModal(false)} />}
        {showPractitionerModal && <AddPractitionerModal onClose={() => setShowPractitionerModal(false)} />}
        {showPracticeModal && <AddPracticeModal onClose={() => setShowPracticeModal(false)} />}
      </div>
    </div>
  );   
};

export default Admin;
