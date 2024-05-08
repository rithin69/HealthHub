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
          <div className="bg-gray-200 border rounded-lg shadow-sm p-4">
            <div className="flex justify-center space-x-4">
              <button onClick={() => handleTabChange('registrationRequests')} className={`${activeTab === 'registrationRequests' ? 'bg-blue-500' : 'bg-gray-400'} hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none`}>Registration Requests</button>
              <button onClick={() => handleTabChange('addNew')} className={`${activeTab === 'addNew' ? 'bg-blue-500' : 'bg-gray-400'} hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none`}>Add New</button>
            </div>
          </div>
        </div>
        {activeTab === 'registrationRequests' && <RegistrationRequests />}
        {activeTab === 'addNew' && (
          <div className="flex flex-col h-full">
            {/* Main Card: Add Medical Staff */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-lg font-semibold mb-4">Add Medical Staff</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sub-Card: Add Doctor */}
                <div className="bg-gray-100 rounded-lg shadow-sm p-4">
                  <button onClick={() => setShowDoctorModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none w-full">Add Doctor</button>
                </div>
                {/* Sub-Card: Add Practitioner */}
                <div className="bg-gray-100 rounded-lg shadow-sm p-4">
                  <button onClick={() => setShowPractitionerModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none w-full">Add Practitioner</button>
                </div>
              </div>
            </div>
            {/* Main Card: Add Medical Provider */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-lg font-semibold mb-4">Add Medical Provider</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-lg shadow-sm p-4">
                  {/* Sub-Card: Add Practice */}
                  <button onClick={() => setShowPracticeModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none w-full">Add Practice</button>
                </div>
              </div>
            </div>
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
