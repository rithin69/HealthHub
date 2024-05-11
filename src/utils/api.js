import pharmaciesData from './consol_pharmacy_list_202324q3.json';
export const fetchPharmacies = async () => {
    try {
        return pharmaciesData;
    } catch (error) {
        console.error('Error fetching pharmacies:', error);
        return [];
    }
};
