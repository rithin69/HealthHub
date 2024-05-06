import React, { useState, useEffect } from 'react';
import { createHospitalDocuments } from "../utils/Firebase";
import hospital from '../utils/Practicesjson';
import Hospitals from './Hospitals';
import PharmacyModal from '../Components/PharmacyModal';

function Patient() {
    const [showPharmacyModal, setShowPharmacyModal] = useState(false);
    useEffect(() => {
        // console.log(hospital);
        createHospitalDocuments(hospital);
    }, []); // Empty dependency array ensures this effect only runs once after the initial render

    return (
        <>
            <nav className="flex justify-between items-center py-4 px-6 bg-gray-200">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
                    HEALTHUB
                </h1>
                <button className="text-lg text-gray-800" onClick={() => setShowPharmacyModal(true)}>
                    Find Pharmacy
                </button>
            </nav>
            <Hospitals />
            {showPharmacyModal && <PharmacyModal onClose={() => setShowPharmacyModal(false)} />}
        </>
    );
}

export default Patient;
