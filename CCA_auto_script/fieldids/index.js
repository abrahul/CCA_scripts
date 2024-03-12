const fs = require('fs');

fs.readFile('CCATemplate.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }

  try {
    const jsonData = JSON.parse(data);

    const desiredDocument = jsonData[1];

    if (desiredDocument) {
      const englishMap = {};
      const hindiMap = {};
      const valueOptionsMap = {}; // Create a map for valueOptions
      const typeMap = {}; // Create a map for TYPE

      for (let i = 0; i < 8; i++) {
        for (const field of desiredDocument.fields[i].children) {
          const fieldTranslationsEn = field.translations.en;
          const fieldTranslationsHi = field.translations.hi;

          // Remove spaces from the ends of keys
          const fieldNameEn = fieldTranslationsEn.name.trim();
          const fieldNameHi = fieldTranslationsHi.name.trim();

          englishMap[fieldNameEn] = field.fieldId;
          hindiMap[fieldNameHi] = field.fieldId;

          // Check if field has valueOptions
          if (field.valueOptions && field.valueOptions.length > 0) {
            valueOptionsMap[fieldNameEn] = field.valueOptions;
          }

          // Check if field has TYPE
          if (field.type) {
            typeMap[fieldNameEn] = field.type;
          }
        }
      }

      // Convert the English map to JSON format
      const englishOutputData = JSON.stringify(englishMap, null, 2);

      // Write the English field IDs to a file called "field_ids_english.json"
      fs.writeFile('field_ids_english.json', englishOutputData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing English field IDs to file:', err);
        } else {
          console.log('English Field IDs written to field_ids_english.json');
        }
      });

      // Convert the Hindi map to JSON format
      const hindiOutputData = JSON.stringify(hindiMap, null, 2);

      // Write the Hindi field IDs to a file called "field_ids_hindi.json"
      fs.writeFile('field_ids_hindi.json', hindiOutputData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing Hindi field IDs to file:', err);
        } else {
          console.log('Hindi Field IDs written to field_ids_hindi.json');
        }
      });

      // Convert the valueOptions map to JSON format
      const valueOptionsData = JSON.stringify(valueOptionsMap, null, 2);

      // Write the valueOptions to a file called "value_options.json"
      fs.writeFile('value_options.json', valueOptionsData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing valueOptions to file:', err);
        } else {
          console.log('ValueOptions written to value_options.json');
        }
      });

      // Convert the TYPE map to JSON format
      const typeOutputData = JSON.stringify(typeMap, null, 2);

      // Write the TYPE to a file called "field_type.json"
      fs.writeFile('field_type.json', typeOutputData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing TYPE to file:', err);
        } else {
          console.log('TYPE written to field_type.json');
        }
      });
    } else {
      console.error('Not found');
    }
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }
});
