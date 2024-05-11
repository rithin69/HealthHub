import React, { useState, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import { fetchPharmacies } from '../utils/api';

function PharmacyModal({ onClose }) {
    const [pharmacies, setPharmacies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [center, setCenter] = useState({ lat: 51.5074, lng: -0.1278 }); 
    const [currentPage, setCurrentPage] = useState(1);
    const pharmaciesPerPage = 5;

    useEffect(() => {
        
        fetchPharmacies()
            .then(data => {
               
                const promises = data.map(pharmacy => fetchCoordinates(pharmacy));
                Promise.all(promises)
                    .then(results => {
                        const pharmaciesWithCoordinates = results.filter(result => result !== null);
                        setPharmacies(pharmaciesWithCoordinates);
                        setSearchResults(pharmaciesWithCoordinates);
                    })
                    .catch(error => {
                        console.error('Error fetching coordinates:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching pharmacies:', error);
            });
    }, []);

    useEffect(() => {
   
        setSearchResults(pharmacies.filter(pharmacy =>
            pharmacy.ADDRESS_FIELD1.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pharmacy.ADDRESS_FIELD2.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pharmacy.ADDRESS_FIELD3.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pharmacy.ADDRESS_FIELD4.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pharmacy.POST_CODE.toLowerCase().includes(searchTerm.toLowerCase())
        ));
        setCurrentPage(1);
    }, [searchTerm, pharmacies]);

    const fetchCoordinates = async (pharmacy) => {
        const { ADDRESS_FIELD1, ADDRESS_FIELD2, ADDRESS_FIELD3, ADDRESS_FIELD4, POST_CODE } = pharmacy;
        const address = `${ADDRESS_FIELD1}, ${ADDRESS_FIELD2}, ${ADDRESS_FIELD3}, ${ADDRESS_FIELD4}, ${POST_CODE}`;

      
        const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyAlWCF6E4dmnc7-_7zlYoNw_AifnIZT8Zs`;

     
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            return { ...pharmacy, lat, lng };
        } else {
            console.error('Error fetching coordinates:', data.status);
            return null;
        }
    };

    const handlePharmacyClick = (pharmacy) => {
        setSelectedPharmacy(pharmacy);
    };

    const handleCloseModal = () => {
        setSelectedPharmacy(null);
        onClose();
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const paginate = (array, pageSize, pageNumber) => {
        return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    };

    const handleGetDirections = (pharmacy) => {
      
        const { lat, lng } = pharmacy;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, '_blank');
    };

    const handleSearch = () => {
        
        const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchTerm)}&key=AIzaSyAlWCF6E4dmnc7-_7zlYoNw_AifnIZT8Zs`;

   
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
               
                const { results } = data;
                if (results && results.length > 0) {
                    const { lat, lng } = results[0].geometry.location;
                    setCenter({ lat, lng });
                    setSearchTerm(''); 
                } else {
                    throw new Error('No results found');
                }
            })
            .catch(error => {
                console.error('Error fetching coordinates:', error);
            });
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-8 w-full max-w-3xl overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Find Pharmacy</h2>
                <div className="mb-4 flex">
                    <input
                        type="text"
                        placeholder="Enter city name, address, or PIN code"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="border border-gray-300 rounded-l-lg px-4 py-2 w-full"
                    />
                    <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded-r-lg">Search</button>
                </div>
                <div style={{ height: '300px', width: '100%' }}>
                    <GoogleMapReact
                        defaultCenter={center}
                        defaultZoom={11}
                        center={center}
                    >
                        {searchResults.slice(0, 10).map(pharmacy => (
                            <Marker
                                key={pharmacy["PHARMACY_ODS_CODE_(F-CODE)"]}
                                lat={pharmacy.lat} 
                                lng={pharmacy.lng} 
                                onClick={() => handlePharmacyClick(pharmacy)}
                            />
                        ))}
                    </GoogleMapReact>
                </div>
                <div className="mt-4">
                    <h3 className="font-bold">Pharmacies:</h3>
                    {paginate(searchResults, pharmaciesPerPage, currentPage).map(pharmacy => (
                        <div key={pharmacy["PHARMACY_ODS_CODE_(F-CODE)"]} className="border-t border-gray-200 py-2">
                            <h4 className="font-semibold">{pharmacy.PHARMACY_TRADING_NAME}</h4>
                            <p>{pharmacy.ADDRESS_FIELD1}, {pharmacy.ADDRESS_FIELD2}, {pharmacy.ADDRESS_FIELD3}, {pharmacy.ADDRESS_FIELD4}</p>
                            <p>{pharmacy.POST_CODE}</p>
                            <button onClick={() => handleGetDirections(pharmacy)} className="bg-blue-500 text-white px-2 py-1 rounded-md">Get Directions</button>
                        </div>
                    ))}
                    
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-200 rounded-lg mr-2"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === Math.ceil(searchResults.length / pharmaciesPerPage)}
                            className="px-3 py-1 bg-gray-200 rounded-lg"
                        >
                            Next
                        </button>
                    </div>
                </div>
                {selectedPharmacy && (
                    <div className="mt-4">
                        <h3 className="font-bold">Selected Pharmacy:</h3>
                        <p>{selectedPharmacy.PHARMACY_TRADING_NAME}</p>
                        <p>{selectedPharmacy.ADDRESS_FIELD1}, {selectedPharmacy.ADDRESS_FIELD2}, {selectedPharmacy.ADDRESS_FIELD3}, {selectedPharmacy.ADDRESS_FIELD4}</p>
                        <p>{selectedPharmacy.POST_CODE}</p>
                    </div>
                )}
                <button onClick={handleCloseModal} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Close
                </button>
            </div>
        </div>
    );
}

const Marker = ({ onClick }) => <div onClick={onClick} className="text-red-600 text-xl">&#x1F3E0;</div>; 

export default PharmacyModal;
