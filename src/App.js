<<<<<<< HEAD
// import logo from './logo.svg';
// import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./screens/Login"
import {Provider} from "react-redux"
import appstore from "./utils/appstore"
import Patient from "./screens/Patient"
import Doctor from "./screens/Doctor";
import Admin from "./screens/Admin";
import Practitioner from "./screens/Practitioner";

function App() {
  const appRouter = createBrowserRouter([
    { path: "/", element: <Login /> },
    { path: "/patientdashboard", element: <Patient/> },
    { path: "/doctordashboard", element: <Doctor/> },
    { path: "/practitionerdashboard", element: <Practitioner/> },
    { path: "/Admindashboard", element: <Admin/> },

  ]);
  return (
    <Provider store={appstore}>
       <RouterProvider router={appRouter} />
    </Provider>
      );
=======
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
>>>>>>> 65758090ec395917be33f460e1715667859878d4
}

export default App;
