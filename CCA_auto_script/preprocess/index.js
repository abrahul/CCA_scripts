const fs = require('fs');
const csvParser = require('csv-parser');

const fieldIdsPath = '/home/ashraf.rahul/Desktop/CCA_auto_script/field_ids.json';
const fieldTypePath = '/home/ashraf.rahul/Desktop/CCA_auto_script/field_type.json';
const valueOptionsPath = '/home/ashraf.rahul/Desktop/CCA_auto_script/value_options.json';

let field_ids = new Map();
let field_type = new Map();
let value_options = new Map();

try {
  const fieldIdsData = fs.readFileSync(fieldIdsPath, 'utf16le');
  field_ids = new Map(Object.entries(JSON.parse(fieldIdsData)));
} catch (err) {
  console.error('Error reading or parsing field_ids.json:', err);
}

try {
  const fieldTypeData = fs.readFileSync(fieldTypePath, 'utf8');
  field_type = new Map(Object.entries(JSON.parse(fieldTypeData)));
} catch (err) {
  console.error('Error reading or parsing field_type.json:', err);
}

try {
  const valueOptionsData = fs.readFileSync(valueOptionsPath, 'utf8');
  value_options = new Map(Object.entries(JSON.parse(valueOptionsData)));
} catch (err) {
  console.error('Error reading or parsing value_options.json:', err);
}

const inputCsvPath = '/home/ashraf.rahul/Desktop/CCA_auto_script/input.csv';

const outputCsvPath = '/home/ashraf.rahul/Desktop/CCA_auto_script/output.csv';
const outputStream = fs.createWriteStream(outputCsvPath, { encoding: 'utf16le' });

const outputTypePath = '/home/ashraf.rahul/Desktop/CCA_auto_script/outputtype.txt';
const outputTypeStream = fs.createWriteStream(outputTypePath);

fs.createReadStream(inputCsvPath, { encoding: 'utf16le' })
  .pipe(csvParser())
  .on('data', (row) => {
    // Initialize an array to store processed values
    const processedValues = [];

    // Assuming the first row contains column names
    if (!row.__rowNum__) {
      // Process each column starting from the second column (skip the first)
      Object.keys(row).forEach((columnName) => {
        // Skip the first column
        if (columnName !== 'S No.') {
          const fieldType = field_type.get(columnName); 
          const fieldValue = row[columnName]; 
          const fieldMessage = `This is ${fieldType}`;
          console.log(fieldMessage);
          processedValues.push(`${fieldValue} (${fieldType})`);

          // Write the column name and console message to the outputtype file
          outputTypeStream.write(`Column: ${columnName}, Message: ${fieldMessage}\n`);
        }
      });

      const outputRow = processedValues.join(',');
      outputStream.write(outputRow + '\n');
    }
  })
  .on('end', () => {
    outputStream.end();
    outputTypeStream.end();
    console.log('CSV file processing is complete. Output written to output.csv and outputtype.txt');
  });
