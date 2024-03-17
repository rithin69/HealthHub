import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../utils/Firebase';

const Admin = () => {
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('Error fetching registration requests:', error);
      }
    };
  
    fetchRegistrationRequests();
  }, []);  

  const handleApprove = async (requestId) => {
    try {
      await updateDoc(doc(firestore, 'patient_practice_registration', requestId), { registrationRequest: 'Approved' });
      console.log('Request approved:', requestId);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await updateDoc(doc(firestore, 'patient_practice_registration', requestId), { registrationRequest: 'Rejected' });
      console.log('Request rejected:', requestId);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ backgroundImage: 'url(../../images/background_image.jpeg)' }}>
      <h2 className="text-2xl font-semibold mb-4">Registration Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-2">Patient Name</th>
              <th className="px-4 py-2">Practice Name</th>
              <th className="px-4 py-2">Registration Date</th>
              <th className="px-4 py-2">Registration Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrationRequests.map(request => (
              <tr key={request.id} className="border-b">
                <td className="px-4 py-2">{request.patientName}</td>
                <td className="px-4 py-2">{request.practiceName}</td>
                <td className="px-4 py-2">{formatDate(request.registrationDate)}</td>
                <td className="px-4 py-2">{request.registrationRequest}</td>
                <td className="px-4 py-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2" onClick={() => handleApprove(request.id)}>Approve</button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded" onClick={() => handleReject(request.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Admin;
