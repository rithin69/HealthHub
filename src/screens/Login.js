import React, { useState } from "react";
import Header from "../Components/Header";
import { BG_URL } from "../utils/Constant";
import { checkValidData } from "../utils/Validate";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../utils/Firebase";
import { Eye, EyeOff } from "lucide-react";
import lang from "../utils/LanguageConstants";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';
import { createUserDocument } from "../utils/Firebase"
import { getFirestore, doc, updateDoc } from "firebase/firestore"; 

const Login = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [isSignInForm, setIsSignInForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [newPassword, setNewPassword] = useState(''); 
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const langKey = useSelector((store) => store.config.lang);

  const [formData, setFormData] = useState({
    fullName: "",
    dob: null,
    address: "",
    email: "",
    password: ""
  });

  const today = new Date();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // console.log(formData)
  };

  const handleGenderChange = (e) => {
    setSelectedGender(e.target.value);
  };

  const handleButtonClick = () => {
    const message = checkValidData(formData.email, formData.password);
    setErrorMessage(message);
    if (message || !agreeToTerms) return;

    if (!isSignInForm) {
      createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      )
        .then((userCredential) => {
          const user = userCredential.user;
          createUserDocument(user, {
            ...formData,
            gender: selectedGender
          });
          setIsSignInForm(true);
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
          setNewPassword(formData.password);
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
          // Update password in Firestore
          const db = getFirestore();
          const userDocRef = doc(db, "patient", user.uid);
          updateDoc(userDocRef, {
            password: formData.password
          }).then(() => {
            console.log("Password updated in Firestore");
            console.log("New password: " + newPassword);
          }).catch((error) => {
            console.error("Error updating password in Firestore: ", error);
            setErrorMessage("Error updating password. Please try again later.");
          });
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

  const handleForgotPassword = () => {
    sendPasswordResetEmail(auth, formData.email)
      .then(() => {
        setErrorMessage("Password reset email sent. Check your inbox.");
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };

  const handleToggleTerms = () => {
    setAgreeToTerms(!agreeToTerms);
  };

  const termsAndConditions = (
    <div className="relative flex items-center text-black">
      <input type="checkbox" checked={agreeToTerms} onChange={handleToggleTerms} className="mr-2" />
      <span>I agree to the <a href="#">terms and conditions</a></span>
    </div>
  );

  return (
    <div className="">
      <Header />
      <div className="absolute">
        <img
          className="h-screen object-cover brightness-75 md:w-screen"
          src={BG_URL}
          alt="bgImg"
        />
      </div>
      <div className="form relative flex h-screen items-center justify-center">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full rounded-lg bg-[#DBE9FA] bg-opacity-80 p-12 text-white md:w-3/12 z-40"
        >
          <h2 className="text-3xl font-bold text-black">
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
                  className="mb-3 w-full rounded-md bg-[#DBE9FA] p-3 text-black"
                  placeholder={lang[langKey].fullName}
                  name="fullName"
                  onChange={handleInputChange}
                />
                <DatePicker
                  selected={formData.dob ? new Date(formData.dob) : null}
                  onChange={(date) => setFormData({ ...formData, dob: date })}
                  className="mb-3 w-full rounded-md bg-[#DBE9FA] p-3 text-black"
                  dateFormat="dd/MM/yyyy"
                  placeholderText={lang[langKey].dob}
                  maxDate={today}
                  showYearDropdown 
                  showMonthDropdown 
                  dropdownMode="select"
                />
                <input
                  type="text"
                  className="mb-3 w-full rounded-md bg-[#DBE9FA] p-3 text-black"
                  placeholder={lang[langKey].address}
                  name="address"
                  onChange={handleInputChange}
                />
                <select
                  className="mb-3 w-full rounded-md bg-[#DBE9FA] p-3 text-black"
                  placeholder={lang[langKey].gender}
                  defaultValue="Gender"
                  value={selectedGender}
                  onChange={handleGenderChange} 
                >
                  <option value="" disabled>Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </>
            )}
            <input
              type="text"
              className="mb-3 w-full rounded-md bg-[#DBE9FA] p-3 text-black"
              placeholder={lang[langKey].email}
              name="email"
              onChange={handleInputChange}
            />
            <div className="relative flex items-center justify-end">
              <input
                type={showPassword ? "text" : "password"}
                className="relative w-full select-none rounded-md bg-[#DBE9FA] p-3 text-black"
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
            {termsAndConditions && (
              <div className="relative flex items-center text-black style='width: 275px !important;'">
                <input type="checkbox" checked={agreeToTerms} onChange={handleToggleTerms} className="mr-2" />
                <span>I agree to the <a href="#">terms and conditions</a></span>
              </div>            
            )}
            {/* {isSignInForm && (
              <div className="mb-3 w-full my-3">
                <select
                  className="w-full rounded-md bg-[#DBE9FA] p-3 text-white"
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
            )} */}
          </div>
          <p className="text-red-500">{errorMessage}</p>
          <button
            className="mt-5 w-full rounded-md bg-blue-600 py-3 text-white"
            onClick={handleButtonClick}
          >
            {isSignInForm ? (
              <span>{lang[langKey].signIn}</span>
            ) : (
              <span>{lang[langKey].signUp}</span>
            )}
          </button>
          <div className="my-2 flex justify-between">
            <div className="mb-3 w-full my-3">
              <a className="text-[#0000FF] hover:underline cursor-pointer" onClick={handleForgotPassword}>
                {lang[langKey].forgotPassword}
              </a>
            </div>
          </div>

          {isSignInForm && (
            <div className="py-12">
              <h1 className="mb-2 flex text-black">
                {lang[langKey].newPatient}{" "}
                <p
                  className="ml-1 cursor-pointer select-none text-[#0000FF] hover:underline"
                  onClick={toggleSignUpForm}
                >
                  {lang[langKey].signUpNow}
                </p>
              </h1>
            </div>
          )}
          {!isSignInForm && (
            <div className="pb-12">
              <h1 className="mb-2 flex text-[#000000]">
                {lang[langKey].alreadyUser}{" "}
                <p
                  className="ml-1 cursor-pointer select-none text-[#0000FF] hover:underline"
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
