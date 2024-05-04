import React from 'react';

const AppointmentList = ({ appointments }) => {
  return (
    <div className="bg-white p-5 rounded-lg w-3/5-md mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">My Appointments</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Appointment Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Service
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              STATUS
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <tr key={appointment.appointmentDate}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {appointment.appointmentDate}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {appointment.consultingService}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.bookingconfirmed === 'Approved' ? "bg-green-100 text-green-800" : appointment.bookingconfirmed === 'Pending' ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {appointment.bookingconfirmed }
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentList;