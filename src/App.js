import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./screens/Login";
import Patient from "./screens/Patient";
import Doctor from "./screens/Doctor";
import Admin from "./screens/Admin";
import Practitioner from "./screens/Practitioner";
import { Provider } from "react-redux";
import appstore from "./utils/appstore";

function App() {
  return (
    <Provider store={appstore}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/patientdashboard" element={<Patient />} />
          <Route path="/doctordashboard/:fullName" element={<Doctor />} />  // Adjusted for dynamic fullName
          <Route path="/practitionerdashboard" element={<Practitioner />} />
          <Route path="/admindashboard" element={<Admin />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
