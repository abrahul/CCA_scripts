const fs = require('fs');

// Specify the paths to your input and output JSON files
const inputFilePath = 'input.json';
const outputFilePath = 'output.json';

// Read the input data from the input.json file
fs.readFile(inputFilePath, 'utf8', (err, inputData) => {
  if (err) {
    console.error('Error reading the input file:', err);
    return;
  }

  try {
    // Parse the input JSON data into a JavaScript object
    const parsedInputData = JSON.parse(inputData);

    

    // Transform the input object into an array of objects
    const transformedData = Object.keys(parsedInputData).map(key => ({
      ccaFieldValues: parsedInputData[key]
    }));



    for (const key in transformedData) {
        if (transformedData.hasOwnProperty(key)) {
            transformedData[key]["shortName"] = "Long";
        }
      }
    // Convert the result to a JSON string
    const outputJson = JSON.stringify(transformedData, null, 2);

    // Write the JSON data to the output.json file
    fs.writeFile(outputFilePath, outputJson, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing to the output file:', writeErr);
      } else {
        console.log('Data has been written to output.json');
      }
    });
  } catch (error) {
    console.error('Error parsing JSON from the input file:', error);
  }
});
