const fs = require('fs');
const categories = ['fresh', 'dairy', 'munchies', 'drinks', 'sweet', 'personal', 'cleaning', 'home'];

const names = {
  fresh: ['Apple', 'Onion', 'Tomato', 'Potato', 'Carrot', 'Spinach', 'Banana', 'Orange', 'Grapes', 'Mango', 'Cabbage', 'Broccoli'],
  dairy: ['Milk', 'Butter', 'Cheese', 'Paneer', 'Yogurt', 'Curd', 'Eggs', 'Ghee', 'Flavored Milk', 'Milk Powder', 'Tofu'],
  munchies: ['Chips', 'Snacks', 'Doritos', 'Nachos', 'Pringles', 'Peanuts', 'Bhujia', 'Popcorn', 'Mixture', 'Biscuits', 'Cookies'],
  drinks: ['Cola', 'Pepsi', 'Sprite', 'Juice', 'Red Bull', 'Orange Juice', 'Mango Juice', 'Coffee', 'Water', 'Soda', 'Lemonade'],
  sweet: ['Chocolate', 'KitKat', 'Snickers', 'Ferrero', 'Gummy', 'Dark Chocolate', 'Rasgulla', 'Jamun', 'Barfi', 'Ice Cream', 'Pastry'],
  personal: ['Shampoo', 'Soap', 'Body Wash', 'Toothpaste', 'Toothbrush', 'Face Wash', 'Deodorant', 'Hair Oil', 'Moisturizer', 'Hand Wash', 'Sanitizer'],
  cleaning: ['Dish Wash', 'Detergent', 'Floor Cleaner', 'Toilet Cleaner', 'Scrub', 'Garbage Bags', 'Glass Cleaner', 'Tissue', 'Freshener', 'Broom', 'Mop'],
  home: ['Batteries', 'Bulb', 'Extension', 'Notebook', 'Pen', 'Tape', 'Scissors', 'Glue', 'Pins', 'Envelopes', 'Charger']
};

// Custom AI Generated Images
const customImages = {
  'Apple': '/images/products/apple.png',
  'Milk': '/images/products/milk.png',
  'Butter': '/images/products/butter.png',
  'Cheese': '/images/products/cheese.png',
  'Paneer': '/images/products/paneer.png',
  'Yogurt': '/images/products/yogurt.png',
  'Curd': '/images/products/curd.png',
  'Chips': '/images/products/chips.png',
  'Cola': '/images/products/cola.png',
  'Chocolate': '/images/products/chocolate.png',
  'Shampoo': '/images/products/shampoo.png',
  'Dish Wash': '/images/products/detergent.png',
  'Batteries': '/images/products/batteries.png',
  'Eggs': 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=200&h=200&fit=crop',
  'Ghee': 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=200&h=200&fit=crop',
  'Flavored Milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop',
  'Milk Powder': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop',
  'Tofu': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
  'Nachos': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=200&h=200&fit=crop',
  'Pringles': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200&h=200&fit=crop',
  'Peanuts': 'https://images.unsplash.com/photo-1595183353597-2342ecad5a4f?w=200&h=200&fit=crop',
  'Bhujia': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop',
  'Mixture': 'https://images.unsplash.com/photo-1585913220464-9be71e16c905?w=200&h=200&fit=crop',
  'Biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop'
};

let products = [];
let idCounter = 1;

categories.forEach(cat => {
  const catNames = names[cat];
  catNames.forEach((name, idx) => {
    // For lorem flickr fallback, make it highly specific to food/objects
    const fallbackCategory = (cat === 'fresh' || cat === 'dairy' || cat === 'sweet') ? 'food' : 'product';
    const term = name.split(' ')[0].toLowerCase() + ',' + fallbackCategory;
    
    let imgUrl = customImages[name] || `https://loremflickr.com/200/200/${term}/all?lock=${idCounter}`;
    
    products.push({
      id: 'p' + idCounter,
      name: name,
      price: Math.floor(Math.random() * 150) + 20,
      originalPrice: Math.floor(Math.random() * 50) + 180,
      weight: (Math.floor(Math.random() * 5) + 1) + ' unit',
      image: imgUrl,
      category: cat,
      isVeg: cat !== 'personal' && cat !== 'cleaning' && cat !== 'home'
    });
    idCounter++;
  });
});

const fileContent = 'export const PRODUCTS = ' + JSON.stringify(products, null, 2) + ';\n';
const dir = './frontend/src/data';
fs.writeFileSync(dir + '/mockProducts.js', fileContent);
console.log('Updated mockProducts.js with extensive dairy AI images');
