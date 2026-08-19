const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/data/mockProducts.js');
let content = fs.readFileSync(filePath, 'utf8');

const updates = [
  { name: 'Lays Chips', file: 'Lays Chips.jpg' },
  { name: 'Kurkure', file: 'Kurkure.jpg' },
  { name: 'Doritos', file: 'Doritos.jpg' },
  { name: 'Nachos', file: 'Nachos.jpg' },
  { name: 'Pringles', file: 'Pringles.jpg' },
  { name: 'Peanuts', file: 'Peanuts.jpg' },
  { name: 'Bhujia', file: 'Bhujia.jpg' },
  { name: 'Popcorn', file: 'Popcorn.jpg' },
  { name: 'Mixture', file: 'Mixture.jpg' },
  { name: 'Biscuits', file: 'Biscuits.jpg' },
  { name: 'Cookies', file: 'Cookies.jpg' },
  { name: 'Coca Cola', file: 'Coca Cola.jpg' },
  { name: 'Pepsi', file: 'Pepsi.jpg' }
];

let importStatements = '';
updates.forEach((update, idx) => {
  const varName = `imgUpdate${idx}`;
  importStatements += `import ${varName} from '../assets/${update.file}';\n`;
});

// Insert imports at the top
content = importStatements + content;

// Replace image URLs for each product
updates.forEach((update, idx) => {
  const varName = `imgUpdate${idx}`;
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
console.log('Done!');
