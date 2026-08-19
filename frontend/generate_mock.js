const fs = require('fs');
const categories = ['fresh', 'dairy', 'munchies', 'drinks', 'sweet', 'personal', 'cleaning', 'home'];
const baseImages = {
  fresh: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=200&h=200&fit=crop',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop',
  munchies: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200&h=200&fit=crop',
  drinks: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&h=200&fit=crop',
  sweet: 'https://images.unsplash.com/photo-1548883354-94cb0b23023f?w=200&h=200&fit=crop',
  personal: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop',
  cleaning: 'https://images.unsplash.com/photo-1584820927498-cafe3c0b1a03?w=200&h=200&fit=crop',
  home: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=200&h=200&fit=crop'
};

const names = {
  fresh: ['Onion', 'Tomato', 'Potato', 'Carrot', 'Spinach', 'Apple', 'Banana', 'Orange', 'Grapes', 'Mango', 'Cabbage', 'Broccoli'],
  dairy: ['Amul Milk', 'Butter', 'Cheese Slices', 'Paneer', 'Yogurt', 'Curd', 'Eggs (Pack of 6)', 'Ghee', 'Flavored Milk', 'Milk Powder', 'Tofu'],
  munchies: ['Lays Chips', 'Kurkure', 'Doritos', 'Nachos', 'Pringles', 'Peanuts', 'Bhujia', 'Popcorn', 'Mixture', 'Biscuits', 'Cookies'],
  drinks: ['Coca Cola', 'Pepsi', 'Sprite', 'Thums Up', 'Red Bull', 'Orange Juice', 'Mango Juice', 'Cold Coffee', 'Water Bottle', 'Soda', 'Lemonade'],
  sweet: ['Dairy Milk', 'KitKat', 'Snickers', 'Ferrero Rocher', 'Gummy Bears', 'Dark Chocolate', 'Rasgulla', 'Gulab Jamun', 'Barfi', 'Ice Cream', 'Pastry'],
  personal: ['Shampoo', 'Soap', 'Body Wash', 'Toothpaste', 'Toothbrush', 'Face Wash', 'Deodorant', 'Hair Oil', 'Moisturizer', 'Hand Wash', 'Sanitizer'],
  cleaning: ['Dish Wash Liquid', 'Detergent Powder', 'Floor Cleaner', 'Toilet Cleaner', 'Scrub Pad', 'Garbage Bags', 'Glass Cleaner', 'Tissue Paper', 'Air Freshener', 'Broom', 'Mop'],
  home: ['AA Batteries', 'Light Bulb', 'Extension Cord', 'Notebook', 'Pen Set', 'Tape', 'Scissors', 'Glue', 'Pins', 'Envelopes', 'Charger Cable']
};

let products = [];
let idCounter = 1;

categories.forEach(cat => {
  const catNames = names[cat];
  catNames.forEach((name, idx) => {
    products.push({
      id: 'p' + idCounter++,
      name: name,
      price: Math.floor(Math.random() * 150) + 20,
      originalPrice: Math.floor(Math.random() * 50) + 180,
      weight: (Math.floor(Math.random() * 5) + 1) + ' unit',
      image: baseImages[cat],
      category: cat,
      isVeg: cat !== 'personal' && cat !== 'cleaning' && cat !== 'home'
    });
  });
});

const fileContent = 'export const PRODUCTS = ' + JSON.stringify(products, null, 2) + ';\n';
const dir = './frontend/src/data';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(dir + '/mockProducts.js', fileContent);
console.log('Created mockProducts.js with ' + products.length + ' products');
