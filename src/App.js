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
}

export default App;
