import React, { useState } from "react";
import Header from "../Components/Header";
import { BG_URL } from "../utils/Constant";
import { checkValidData } from "../utils/Validate";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/Firebase";
import { Eye, EyeOff } from "lucide-react";
import lang from "../utils/LanguageConstants";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';
import { createUserDocument } from "../utils/Firebase"

const Login = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [isSignInForm, setIsSignInForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const langKey = useSelector((store) => store.config.lang);

  const [formData, setFormData] = useState({
    fullName: "",
    dob: null,
    address: "",
    email: "",
    password: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // console.log(formData)
  };

  const handleButtonClick = () => {
    const message = checkValidData(formData.email, formData.password);
    setErrorMessage(message);
    if (message) return;

    if (!isSignInForm) {
      createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      )
        .then((userCredential) => {
          const user = userCredential.user;
          createUserDocument(user, {...formData});
          navigate('/patientdashboard');

        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setErrorMessage(errorCode + "-" + errorMessage);
        });
    } else {
      signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      )
        .then((userCredential) => {
          const user = userCredential.user;
          switch (selectedRole) {
            case 'patient':
              navigate('/patientdashboard');
              break;
            case 'practitioner':
              navigate('/practitionerdashboard');
              break;
            case 'doctor':
              navigate('/doctordashboard');
              break;
            case 'admin':
              navigate('/admindashboard');
              break;
            default:
              navigate('/');
          }
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setErrorMessage("Check Email/Password or Sign Up");
        });
    }
  };

  const toggleSignUpForm = () => {
    setIsSignInForm(!isSignInForm);
  };

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="">
      <Header />
      <div className="absolute">
        <img
          className=" h-screen object-cover brightness-75 md:w-screen"
          src={BG_URL}
          alt="bgImg"
        />
      </div>
      <div className="form relative flex h-screen items-center justify-center">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full rounded-lg bg-black bg-opacity-80 p-12 text-white md:w-3/12 z-40"
        >
          <h2 className="text-3xl font-bold text-white">
            {isSignInForm ? (
              <span>{lang[langKey].signIn}</span>
            ) : (
              <span>{lang[langKey].signUp}</span>
            )}
          </h2>
          <div className=" my-6">
            {!isSignInForm && (
              <>
                <input
                  type="text"
                  className="mb-3 w-full rounded-md bg-zinc-800 p-3 text-white"
                  placeholder={lang[langKey].fullName}
                  name="fullName"
                  onChange={handleInputChange}
                />
                <DatePicker
                  selected={formData.dob ? new Date(formData.dob) : null}
                  onChange={(date) => setFormData({ ...formData, dob: date })}
                  className="mb-3 w-full rounded-md bg-zinc-800 p-3 text-white"
                  dateFormat="dd/MM/yyyy"
                  placeholderText={lang[langKey].dob}
                />
                <input
                  type="text"
                  className="mb-3 w-full rounded-md bg-zinc-800 p-3 text-white"
                  placeholder={lang[langKey].address}
                  name="address"
                  onChange={handleInputChange}
                />
              </>
            )}
            <input
              type="text"
              className="mb-3 w-full rounded-md bg-zinc-800 p-3 text-white"
              placeholder={lang[langKey].email}
              name="email"
              onChange={handleInputChange}
            />
            <div className="relative flex items-center justify-end">
              <input
                type={showPassword ? "text" : "password"}
                className="relative w-full select-none rounded-md bg-zinc-800 p-3 text-white"
                placeholder={isSignInForm ? lang[langKey].password : lang[langKey].createPwd}
                name="password"
                onChange={handleInputChange}
              />
              {showPassword ? (
                <Eye
                  color="#545454"
                  className="absolute right-0 mr-3 cursor-pointer select-none"
                  onClick={togglePasswordVisibility}
                  size={20}
                />
              ) : (
                <EyeOff
                  size={20}
                  color="#545454"
                  className="absolute right-0 mr-3 cursor-pointer select-none"
                  onClick={togglePasswordVisibility}
                />
              )}
            </div>
            {isSignInForm && (
              <div className="mb-3 w-full my-3">
                <select
                  className="w-full rounded-md bg-zinc-800 p-3 text-white"
                  defaultValue=""
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="" disabled>Select your role</option>
                  <option value="patient">{lang[langKey].patient}</option>
                  <option value="practitioner">{lang[langKey].practitioner}</option>
                  <option value="doctor">{lang[langKey].doctor}</option>
                  <option value="admin">{lang[langKey].admin}</option>
                </select>
              </div>
            )}
          </div>
          <p className="text-red-500">{errorMessage}</p>
          <button
            className="mt-5 w-full rounded-md bg-red-600 py-3 text-white"
            onClick={handleButtonClick}
          >
            {isSignInForm ? (
              <span>{lang[langKey].signIn}</span>
            ) : (
              <span>{lang[langKey].signUp}</span>
            )}
          </button>
          <div className="my-2 flex justify-between">
            <p className="text-gray-400">
              <input type="checkbox" />
              {lang[langKey].remember}
            </p>
            <p className="cursor-pointer text-gray-400 hover:underline">
              {lang[langKey].needHelp}
            </p>
          </div>

          {isSignInForm && (
            <div className="py-12">
              <h1 className="mb-2 flex text-gray-400">
                {lang[langKey].newPatient}{" "}
                <p
                  className="ml-1 cursor-pointer select-none text-white hover:underline"
                  onClick={toggleSignUpForm}
                >
                  {lang[langKey].signUpNow}
                </p>
              </h1>
            </div>
          )}
          {!isSignInForm && (
            <div className="pb-12">
              <h1 className="mb-2 flex text-gray-400">
                {lang[langKey].alreadyUser}{" "}
                <p
                  className="ml-1 cursor-pointer select-none text-white hover:underline"
                  onClick={toggleSignUpForm}
                >
                  {lang[langKey].signInNow}
                </p>
              </h1>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
