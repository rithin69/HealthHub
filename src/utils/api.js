export const fetchPharmacies = async (city, page) => {
    const response = await fetch(`https://opendata.nhsbsa.net/dataset/consolidated-pharmaceutical-list/resource/b7650d35-c9e4-4302-8b85-067ddd3931a4/view/70543d53-7623-482b-a7bb-6e9de440930c`);
    const data = await response.json();
    return data;
  };
  