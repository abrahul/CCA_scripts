const fs = require('fs');

// Function to remove leading and trailing spaces
function removeSpaces(obj) {
  if (typeof obj === 'string') {
    return obj.trim();
  } else if (Array.isArray(obj)) {
    return obj.map(item => removeSpaces(item));
  } else if (typeof obj === 'object' && obj !== null) {
    const cleanedObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cleanedObj[key] = removeSpaces(obj[key]);
      }
    }
    return cleanedObj;
  } else {
    return obj;
  }
}

// Specify the path to the input JSON file
const inputFilePath = '/home/ashraf.rahul/Desktop/CCA_auto_script_eng/fieldids/value_options.json'; // Replace with your input file path

// Specify the path to the output JSON file
const outputFilePath = '/home/ashraf.rahul/Desktop/CCA_auto_script_eng/fieldids/value_options.json'; // Replace with your desired output file path

// Read data from the input JSON file
fs.readFile(inputFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading input file: ${err.message}`);
    return;
  }

  try {
    const inputData = JSON.parse(data);

    // Apply the removeSpaces function to the data
    const cleanedData = removeSpaces(inputData);

    // Write the cleaned data back to the output JSON file
    fs.writeFile(outputFilePath, JSON.stringify(cleanedData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(`Error writing output file: ${err.message}`);
      } else {
        console.log(`Cleaned JSON data written to ${outputFilePath}`);
      }
    });
  } catch (err) {
    console.error(`Error parsing input JSON: ${err.message}`);
  }
});
