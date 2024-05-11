// convertCsvToJson.js
const fs = require('fs');
const csv = require('csvtojson');

// Path to your CSV file
const csvFilePath = '/Users/tanvipatil/Development/React Projects/COMP6251/HealthHub/src/utils/consol_pharmacy_list_202324q3.csv';

// Path where you want to save the JSON file
const jsonFilePath = '/Users/tanvipatil/Development/React Projects/COMP6251/HealthHub/src/utils/consol_pharmacy_list_202324q3.json';

// Convert CSV to JSON
csv()
  .fromFile(csvFilePath)
  .then(jsonObj => {
    // Write JSON object to file
    fs.writeFile(jsonFilePath, JSON.stringify(jsonObj, null, 2), err => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log('CSV converted to JSON successfully.');
      }
    });
  })
  .catch(err => {
    console.error('Error converting CSV to JSON:', err);
  });
