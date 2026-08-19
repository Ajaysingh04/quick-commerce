const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/data/mockProducts.js');
let content = fs.readFileSync(filePath, 'utf8');

const updates = [
  { name: 'Sprite', file: 'Sprite.jpg' },
  { name: 'Thums Up', file: 'Thums Up.jpg' },
  { name: 'Red Bull', file: 'Red Bull.jpg' },
  { name: 'Orange Juice', file: 'Orange Juice.jpg' },
  { name: 'Mango Juice', file: 'Mango Juice.jpg' },
  { name: 'Cold Coffee', file: 'Cold Coffee.jpg' },
  { name: 'Water Bottle', file: 'Water Bottle.jpg' },
  { name: 'Soda', file: 'Soda.jpg' },
  { name: 'Lemonade', file: 'Lemonade.jpg' }
];

let importStatements = '';
updates.forEach((update, idx) => {
  const varName = `imgUpdateBatch2_${idx}`;
  importStatements += `import ${varName} from '../assets/${update.file}';\n`;
});

// Insert imports right after the first line (or top of file)
content = importStatements + content;

// Replace image URLs for each product
updates.forEach((update, idx) => {
  const varName = `imgUpdateBatch2_${idx}`;
  // Regex to find the object with the specific name and replace its image
  const regex = new RegExp(`("name": "${update.name}",\\s*"price": \\d+,\\s*"originalPrice": \\d+,\\s*"weight": "[^"]+",\\s*"image": )"[^"]+"`, 'g');
  
  if (content.match(regex)) {
    content = content.replace(regex, `$1${varName}`);
    console.log(`Updated ${update.name}`);
  } else {
    console.log(`Could not find ${update.name}`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done with batch 2!');
