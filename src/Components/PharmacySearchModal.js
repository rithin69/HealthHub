// PharmacySearchModal.js

import React, { useState } from 'react';
import { fetchPharmacies } from '../utils/api'; // Function to fetch pharmacy data from API

const PharmacySearchModal = ({ visible, onClose }) => {
  const [pharmacies, setPharmacies] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Function to fetch pharmacies based on city and page number
  const fetchPharmaciesByCity = async (city, page) => {
    const data = await fetchPharmacies(city, page); // Implement fetchPharmacies function to make API request
    setPharmacies(data.results); // Assuming API response is an array of pharmacy objects
  };

  // Function to handle search input change
  const handleSearchChange = (e) => {
    setSearchCity(e.target.value);
  };

  // Function to handle search button click
  const handleSearch = () => {
    setCurrentPage(1); // Reset current page when performing a new search
    fetchPharmaciesByCity(searchCity, 1);
  };

  // Function to handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPharmaciesByCity(searchCity, page);
  };

  // Function to open Google Maps with directions
  const openGoogleMaps = (pharmacy) => {
    const { latitude, longitude } = pharmacy.location; // Assuming each pharmacy object has latitude and longitude properties
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`modal ${visible ? 'show' : ''}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Find a Pharmacy</h2>
        <input type="text" placeholder="Enter city name" value={searchCity} onChange={handleSearchChange} />
        <button onClick={handleSearch}>Search</button>
        <div>
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy.id}>
              <h3>{pharmacy.name}</h3>
              <p>{pharmacy.address}</p>
              <button onClick={() => openGoogleMaps(pharmacy)}>Directions</button>
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
          <span>{currentPage}</span>
          <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default PharmacySearchModal;
