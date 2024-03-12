const fs = require('fs');
const readline = require('readline');
const { Transform } = require('stream');

// Define the path to your input CSV file
const csvFilePath = '/home/ashraf.rahul/Desktop/CCA-hind/star-remove/input.csv';

// Define the path to the output CSV file
const outputCsvFilePath = '/home/ashraf.rahul/Desktop/CCA-hind/star-remove/output.csv';

// Create a readable stream to read the input CSV file
const inputStream = fs.createReadStream(csvFilePath, { encoding: 'utf8' });

// Create a writable stream to write the output CSV file
const outputStream = fs.createWriteStream(outputCsvFilePath);

// Create a CSV parser
const csvParser = csv({
  mapHeaders: ({ header }) => header.replace(/\*/g, ''), // Remove asterisks from header names
});

// Create a transform stream to modify the first row
const transformStream = new Transform({
  transform(chunk, encoding, callback) {
    const data = chunk.toString();
    // Modify the first row to remove asterisks (*)
    if (!this.modifiedFirstRow) {
      this.modifiedFirstRow = data.replace(/\*/g, '');
      callback();
    } else {
      // Pass the rest of the data as is
      callback(null, data);
    }
  },
});

// Pipe the streams together to process the CSV
inputStream
  .pipe(csvParser)
  .pipe(transformStream)
  .pipe(outputStream);

// Listen for the 'finish' event to know when the processing is complete
outputStream.on('finish', () => {
  console.log('Asterisks removed from the first row and saved to output.csv.');
});
