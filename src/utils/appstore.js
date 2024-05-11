import { configureStore}  from "@reduxjs/toolkit"
import configReducer from "./ConfigSlice";
import  useReducer  from "./Userslice";

const appstore=configureStore({
    reducer:{
    config: configReducer,
    user: useReducer,

    }
})

export default appstore;
