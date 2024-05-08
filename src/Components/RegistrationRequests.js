// RegistrationRequests.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../utils/Firebase';

const RegistrationRequests = () => {
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrationRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'patient_practice_registration'));
        const requests = querySnapshot.docs.map(async queryDoc => {
          const data = queryDoc.data();
          if (data.registrationRequest === 'Pending') {
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
          }
        });

        Promise.all(requests).then(result => {
          const pendingRequests = result.filter(request => request !== undefined);
          setRegistrationRequests(pendingRequests);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchRegistrationRequests();
  }, []);

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

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

  return (
    <div className="bg-gray-100 flex flex-col items-center">
      <div className="bg-gray-300 border rounded-lg shadow-sm container mx-auto py-8 px-8">
        <h3 className="text-3xl font-bold text-center mb-8">Registration Requests</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow-sm">
            {/* Table header */}
            <thead className="bg-gray-200 text-gray-700 uppercase ">
              <tr className="text-left">
                <th className="px-6 py-3 w-1/4">Patient Name</th> 
                <th className="px-6 py-3 w-1/4">Practice Name</th> 
                <th className="px-6 py-3 w-1/4">Registration Date and Time</th> 
                <th className="px-6 py-3 w-1/4">Actions</th> 
                <th className="px-6 py-3 w-1/4">Status</th> 
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-gray-600">
              {registrationRequests.map(request => (
                <tr key={request.id} className="border-b hover:bg-gray-100">
                  <td className="px-6 py-4">{request.patientName}</td> 
                  <td className="px-6 py-4">{request.practiceName}</td>
                  <td className="px-6 py-4">{formatDate(request.registrationDate)}</td> 
                  <td className="px-6 py-4">{request.registrationRequest}</td> 
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded focus:outline-none" onClick={() => handleApprove(request.id)}>Approve</button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded focus:outline-none" onClick={() => handleReject(request.id)}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );  
};

export default RegistrationRequests;
