import fs from 'fs';
import path from 'path';
import https from 'https';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Product from './models/Product.js';
import Category from './models/Category.js';

async function fetchExactCategory(query) {
  return new Promise((resolve) => {
    https.get('https://www.themealdb.com/api/json/v1/1/search.php?s=' + query, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if(json.meals) {
            resolve(json.meals.map(m => m.strMealThumb + '/preview'));
          } else {
            resolve([]);
          }
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

async function run() {
  try {
    const categories = {
      pizza: await fetchExactCategory('pizza'),
      burger: await fetchExactCategory('burger'),
      indian: await fetchExactCategory('chicken'), // use chicken for general indian/curry
      cake: await fetchExactCategory('cake'),
      salad: await fetchExactCategory('salad'),
      drink: await fetchExactCategory('punch'), // 'drink' doesn't return much, try 'punch' or just use a default
      noodles: await fetchExactCategory('noodle'),
      sandwich: await fetchExactCategory('sandwich'),
      icecream: await fetchExactCategory('ice cream')
    };
    
    // Add some fallbacks to ensure no empty arrays
    if (categories.drink.length === 0) categories.drink = categories.icecream;
    
    // Fetch a large pool for "default"
    categories.default = await fetchExactCategory('beef');
    
    // 1. Inject into StoreDetails.jsx
    const detailsPath = path.join(__dirname, '../frontend/src/pages/user/StoreDetails.jsx');
    let detailsCode = fs.readFileSync(detailsPath, 'utf8');
    
    const replacementStr = `const CATEGORIZED_DISHES = ${JSON.stringify(categories, null, 2)};

const getUniqueDishImage = (cuisine, idx) => {
  const keyword = (cuisine || '').toLowerCase();
  let cat = 'default';
  
  if (keyword.includes('pizza')) cat = 'pizza';
  else if (keyword.includes('burger')) cat = 'burger';
  else if (keyword.includes('indian') || keyword.includes('biryani') || keyword.includes('curry') || keyword.includes('mughlai') || keyword.includes('chicken') || keyword.includes('mutton') || keyword.includes('paneer')) cat = 'indian';
  else if (keyword.includes('cake') || keyword.includes('dessert') || keyword.includes('sweet') || keyword.includes('bakery') || keyword.includes('mithai')) cat = 'cake';
  else if (keyword.includes('salad') || keyword.includes('healthy') || keyword.includes('diet') || keyword.includes('bowl')) cat = 'salad';
  else if (keyword.includes('drink') || keyword.includes('beverage') || keyword.includes('shake') || keyword.includes('coffee') || keyword.includes('tea') || keyword.includes('mojito')) cat = 'drink';
  else if (keyword.includes('noodle') || keyword.includes('chinese') || keyword.includes('asian') || keyword.includes('pasta') || keyword.includes('momos')) cat = 'noodles';
  else if (keyword.includes('sandwich') || keyword.includes('wrap') || keyword.includes('roll') || keyword.includes('fast product') || keyword.includes('street')) cat = 'sandwich';
  else if (keyword.includes('ice') || keyword.includes('cream')) cat = 'icecream';
  
  let arr = CATEGORIZED_DISHES[cat];
  if (!arr || arr.length === 0) arr = CATEGORIZED_DISHES.default;
  
  const seed = keyword.charCodeAt(0) + (idx * 17) + (Math.floor(Math.random() * 100));
  return arr[seed % arr.length];
};`;
    
    const regex = /const CATEGORIZED_DISHES = \{[\s\S]*?\};\s*const getUniqueDishImage = \([\s\S]*?};/m;
    detailsCode = detailsCode.replace(regex, replacementStr);
    fs.writeFileSync(detailsPath, detailsCode);
    console.log("Updated StoreDetails.jsx with EXACT product images.");

    // 2. Fix MongoDB Product collection
    await mongoose.connect(process.env.MONGO_URI);
    const getUniqueDishImage = (cuisine, idx) => {
      const keyword = (cuisine || '').toLowerCase();
      let cat = 'default';
      
      if (keyword.includes('pizza')) cat = 'pizza';
      else if (keyword.includes('burger')) cat = 'burger';
      else if (keyword.includes('indian') || keyword.includes('biryani') || keyword.includes('curry') || keyword.includes('mughlai') || keyword.includes('chicken') || keyword.includes('mutton') || keyword.includes('paneer')) cat = 'indian';
      else if (keyword.includes('cake') || keyword.includes('dessert') || keyword.includes('sweet') || keyword.includes('bakery') || keyword.includes('mithai')) cat = 'cake';
      else if (keyword.includes('salad') || keyword.includes('healthy') || keyword.includes('diet') || keyword.includes('bowl')) cat = 'salad';
      else if (keyword.includes('drink') || keyword.includes('beverage') || keyword.includes('shake') || keyword.includes('coffee') || keyword.includes('tea') || keyword.includes('mojito')) cat = 'drink';
      else if (keyword.includes('noodle') || keyword.includes('chinese') || keyword.includes('asian') || keyword.includes('pasta') || keyword.includes('momos')) cat = 'noodles';
      else if (keyword.includes('sandwich') || keyword.includes('wrap') || keyword.includes('roll') || keyword.includes('fast product') || keyword.includes('street')) cat = 'sandwich';
      else if (keyword.includes('ice') || keyword.includes('cream')) cat = 'icecream';
      
      let arr = categories[cat];
      if (!arr || arr.length === 0) arr = categories.default;
      
      const seed = keyword.charCodeAt(0) + (idx * 17) + (Math.floor(Math.random() * 100));
      return arr[seed % arr.length];
    };

    const products = await Product.find({}).populate('category');
    let count = 0;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      // ALWAYS UPDATE if it's mealdb or unsplash
      if (!product.image || product.image.includes('mealdb') || product.image.includes('unsplash') || product.image.includes('dish_default')) {
        const catName = product.category ? product.category.name : product.name;
        product.image = getUniqueDishImage(product.name + ' ' + catName, i);
        await product.save();
        count++;
      }
    }
    
    console.log(`Updated ${count} products in MongoDB with EXACT categorized images.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
