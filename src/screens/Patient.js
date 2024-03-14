import React, { useEffect } from 'react';
import { createHospitalDocuments } from "../utils/Firebase";
import hospital from '../utils/Practicesjson';
import Hospitals from './Hospitals';

function Patient() {
    useEffect(() => {
        // console.log(hospital);
        createHospitalDocuments(hospital);
    }, []); // Empty dependency array ensures this effect only runs once after the initial render

    return (
        <>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-center my-8">
                Please Select a Hospital From The List of Hospitals
            </h1>
            <Hospitals></Hospitals>
        </>
    );
}

export default Patient;
