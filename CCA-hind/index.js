const fs = require('fs');
const csvParser = require('csv-parser');

const fieldIdsPath = '/home/ashraf.rahul/Desktop/CCA-hind/field_ids.json';
const fieldTypePath = '/home/ashraf.rahul/Desktop/CCA-hind/field_type.json';
const valueOptionsPath = '/home/ashraf.rahul/Desktop/CCA-hind/value_options.json';

let field_ids = new Map();
let field_type = new Map();
let value_options = {};

try {
  const fieldIdsData = fs.readFileSync(fieldIdsPath, 'utf8');
  const fieldTypeData = fs.readFileSync(fieldTypePath, 'utf8');
  field_ids = new Map(Object.entries(JSON.parse(fieldIdsData)));
  field_type = new Map(Object.entries(JSON.parse(fieldTypeData)));

  // Read and parse value_options.json
  const valueOptionsData = fs.readFileSync(valueOptionsPath, 'utf8');
  value_options = JSON.parse(valueOptionsData);
} catch (err) {
  console.error('Error reading or parsing field_ids.json, field_type.json, or value_options.json:', err);
  process.exit(1);
}

const inputCsvPath = '/home/ashraf.rahul/Desktop/CCA-hind/input.csv';

const communityConservedAreas = {};

// Read the input CSV file
fs.createReadStream(inputCsvPath, { encoding: 'utf-8' })
  .pipe(csvParser())
  .on('data', (row) => {
    if (row.__rowNum__ === 1) return;

    const ccaName = row[Object.keys(row)[0]];

    // Initialize an object for the current community conserved area
    const ccaObject = {};

    // Iterate through columns (excluding the first one)
    Object.keys(row).forEach((columnName) => {
      // if (columnName !== Object.keys(row)[0]) {
        const fieldId = field_ids.get(columnName);

        const fieldValue = row[columnName];

        // Check the field type in field_type map
        const fieldType = field_type.get(columnName);

        if (fieldType === 'MULTI_SELECT_CHECKBOX') {
          const values = fieldValue.split('|').map((value) => value.trim()); // Trim white spaces

          // Initialize an array to store selected values
          const selectedValues = [];

          values.forEach((value) => {
            // Check if the trimmed value is in value_options
            const valueOptionDataArray = value_options[columnName];

            if (Array.isArray(valueOptionDataArray)) {
              const valueOptionData = valueOptionDataArray.find((option) => option.translations.hi === value);

              if (valueOptionData) {
                selectedValues.push({
                  valueId: valueOptionData.valueId,
                  label: value,
                  value: valueOptionData.label,
                });
              } else {
                const otherData = valueOptionDataArray.find((option) =>
                  option.value.toLowerCase() === 'others|?' || option.value.toLowerCase() === 'other|?'
                );
                if (otherData) {
                  selectedValues.push({
                    valueId: otherData.valueId,
                    label:value ,
                    value: otherData.value,
                  });
                }
              }
            }
          });

          // Create the field object with the specified JSON format
          ccaObject[fieldId] = {
            fieldId: fieldId,
            name: columnName,
            type: fieldType,
            value: selectedValues,
          };
        } else if (fieldType === 'GEOMETRY') {
          // Split the geometry value into 'a' and 'b' coordinates
          const [a, b] = fieldValue.replace(',', '.').split('|').map(Number.parseFloat);
          // Create the geometry object
          const geometryObject = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: [b,a],
                },
              },
            ],
          };

          // Create the field object with the specified JSON format
          ccaObject[fieldId] = {
            fieldId: fieldId,
            name: columnName,
            type: fieldType,
            value: geometryObject,
          };
        } else if (fieldType === 'SINGLE_SELECT_RADIO' && value_options[columnName]) {
          const valueOptionDataArray = value_options[columnName];

          if (Array.isArray(valueOptionDataArray)) {
            const selectedOption = valueOptionDataArray.find((option) => option.translations.hi === fieldValue);

            if (selectedOption) {
              // Create the field object with the specified JSON format
              ccaObject[fieldId] = {
                fieldId: fieldId,
                name: columnName,
                type: fieldType,
                value: {
                  valueId: selectedOption.valueId,
                  label: fieldValue,
                  value: selectedOption.label,
                },
              };
            }
          }
        } else if (fieldType === 'SINGLE_SELECT_DROPDOWN' && value_options[columnName]) {
          const valueOptionDataArray = value_options[columnName];

          if (Array.isArray(valueOptionDataArray)) {
            const selectedOption = valueOptionDataArray.find((option) => option.translations.hi === fieldValue);

            if (selectedOption) {
              // Create the field object with the specified JSON format
              ccaObject[fieldId] = {
                fieldId: fieldId,
                name: columnName,
                type: fieldType,
                value: {
                  valueId: selectedOption.valueId,
                  label: fieldValue,
                  value: selectedOption.label,
                },
              };
            }
          }
        } else if (fieldType === 'TEXT' || fieldType === 'RICHTEXT') {
          // Create the field object with the specified JSON format
          ccaObject[fieldId] = {
            fieldId: fieldId,
            name: columnName,
            type: fieldType,
            value: fieldValue,
          };
        } else if (fieldType === 'YEAR') {
          // Parse the year value to ensure it's a valid date
          const parsedYear = new Date(fieldValue);
          if (!isNaN(parsedYear.getTime())) {
            // Create the field object with the specified JSON format
            ccaObject[fieldId] = {
              fieldId: fieldId,
              name: columnName,
              type: fieldType,
              value: parsedYear.toISOString(),
            };
          }
        } else if (fieldType === 'DATE') {
          // Parse the date value to ensure it's a valid date
          const parsedDate = new Date(fieldValue);
          if (!isNaN(parsedDate.getTime())) {
            // Create the field object with the specified JSON format
            ccaObject[fieldId] = {
              fieldId: fieldId,
              name: columnName,
              type: fieldType,
              value: parsedDate.toISOString(),
            };
          }
        } else if (fieldType === 'NUMBER') {
          // Convert the fieldValue to a number
          const numericValue = parseFloat(fieldValue);

          // Check if the numericValue is a valid number
          if (!isNaN(numericValue)) {
            // Create the field object with the specified JSON format
            ccaObject[fieldId] = {
              fieldId: fieldId,
              name: columnName,
              type: fieldType,
              value: numericValue,
            };
          }
        }
      // }
    });

    communityConservedAreas[ccaName] = ccaObject;
  })
  .on('end', () => {
    const jsonData = JSON.stringify(communityConservedAreas, null, 2);
    fs.writeFile('/home/ashraf.rahul/Desktop/CCA-hind/community_conserved_areas.json', jsonData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing community conserved areas to file:', err);
      } else {
        console.log('Community conserved areas written to community_conserved_areas.json');
      }
    });
  });
