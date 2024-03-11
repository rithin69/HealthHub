import React, { useEffect } from "react";
import { LOGO_URL } from "../utils/Constant";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../utils/Firebase";
import { addUser, removeUser } from "../utils/Userslice";
import { Home, LogOut } from "lucide-react";
import { useLocation } from 'react-router-dom';

// import mobileLogo from "../assets/mobileLogo.png";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const location = useLocation();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email, displayName } = user;
        dispatch(addUser({ uid: uid, email: email, displayName: displayName }));
        // console.log(uid,email,displayName);
        // navigate("/patient");
      } else {
        dispatch(removeUser());
        navigate("/");
      }
    });
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {})
      .catch((error) => {
        // An error happened.
      });
  };
  return (
    <div className="absolute z-10 flex w-full flex-row items-center justify-between bg-gradient-to-b from-black px-3 md:flex-row">
  
      <img
        className="hidden cursor-pointer md:block md:w-56"
        src={LOGO_URL}
        alt="Logo"
        // onClick={handleLogoClick}
      />

      
      {user && location.pathname !== '/' && (
        <div className="flex items-center "> 
          <button
            className="my-auto flex items-center rounded-md bg-red-600 px-3 py-2 font-semibold text-white z-50"
            onClick={handleSignOut}
          >
            <LogOut size={20} strokeWidth={2.75} className="md:hidden" />
            <p className="hidden md:block">Sign Out</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
