import React, { useState, useEffect } from 'react';
import { createHospitalDocuments } from "../utils/Firebase";
import hospital from '../utils/Practicesjson';
import Hospitals from './Hospitals';
import PharmacySearchModal from '../Components/PharmacySearchModal';

function Patient() {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        // console.log(hospital);
        createHospitalDocuments(hospital);
    }, []); // Empty dependency array ensures this effect only runs once after the initial render

    return (
        <>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-center my-8 ">
                HEALTHUB
            </h1>
            {/* <button onClick={handleOpenModal}>Find a Pharmacy</button> */}
            {/* <PharmacySearchModal visible={isModalVisible} onClose={handleCloseModal} /> */}
            <Hospitals></Hospitals>
        </>
    );
}

export default Patient;
