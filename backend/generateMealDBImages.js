import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Store from './models/Store.js';

async function fetchMeals() {
  return new Promise((resolve) => {
    const letters = 'abcdefghijklmnop'.split('');
    let urls = [];
    let pending = letters.length;
    
    letters.forEach(l => {
      https.get('https://www.themealdb.com/api/json/v1/1/search.php?f=' + l, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if(json.meals) {
              json.meals.forEach(m => urls.push(m.strMealThumb));
            }
          } catch(e) {}
          pending--;
          if(pending === 0) {
            resolve(urls);
          }
        });
      }).on('error', () => {
        pending--;
        if(pending === 0) resolve(urls);
      });
    });
  });
}

async function run() {
  try {
    const VALID_URLS = await fetchMeals();
    console.log(`Fetched ${VALID_URLS.length} beautiful product images from TheMealDB!`);
    
    if (VALID_URLS.length < 50) {
      console.log('Not enough urls, aborting.');
      process.exit(1);
    }

    // Helper to get random image based on a seed
    function getDishImage(seed) {
      const idx = seed % VALID_URLS.length;
      return VALID_URLS[idx] + '/preview';
    }

    await mongoose.connect(process.env.MONGO_URI);
    const stores = await Store.find({});
    
    // 1. Fix MongoDB
    let count = 0;
    for(const res of stores) {
      count++;
      res.bannerImage = getDishImage(count);
      await res.save();
    }
    console.log(`Updated ${count} stores in MongoDB`);

    // 2. Fix Home.jsx
    let jsCode = "export const STORES = [\n";
    count = 0;
    for(const res of stores) {
      count++;
      const isVeg = res.cuisineTypes.includes('Desserts') || res.cuisineTypes.includes('Mithai') || res.cuisineTypes.includes('Bakery') || res.cuisineTypes.includes('Ice Cream') || res.cuisineTypes.includes('Healthy');
      let offer = "";
      if(Math.random() > 0.5) offer = "50% OFF";
      else if(Math.random() > 0.5) offer = "₹100 OFF";
      
      const bannerImage = getDishImage(count);
      
      jsCode += `  { id: '${res._id}', name: \`${res.name.replace(/`/g, "'")}\`, rating: ${res.rating}, costForTwo: ${res.costForTwo}, cuisineTypes: ${JSON.stringify(res.cuisineTypes)}, deliveryTime: ${res.deliveryTime}, image: '${bannerImage}', offer: '${offer}', isVeg: ${isVeg} },\n`;
    }
    jsCode += "];";

    const homePath = path.join(__dirname, '../frontend/src/pages/user/Home.jsx');
    let homeCode = fs.readFileSync(homePath, 'utf8');
    homeCode = homeCode.replace(/export const STORES = \[[\s\S]*?\];/m, jsCode);
    fs.writeFileSync(homePath, homeCode);
    console.log("Updated Home.jsx");

    // 3. Fix StoreDetails.jsx
    const detailsPath = path.join(__dirname, '../frontend/src/pages/user/StoreDetails.jsx');
    let detailsCode = fs.readFileSync(detailsPath, 'utf8');
    
    // Replace the UNSPLASH_DISHES array and the getUniqueDishImage logic
    const replacementStr = `const MEALDB_DISHES = [
  ${VALID_URLS.map(u => `"${u}/preview"`).join(',\n  ')}
];

const getUniqueDishImage = (cuisine, idx) => {
  const seed = cuisine.charCodeAt(0) + (idx * 7) + (Math.floor(Math.random() * 100));
  const arrIdx = seed % MEALDB_DISHES.length;
  return MEALDB_DISHES[arrIdx];
};`;
    
    // Regex to match the old UNSPLASH block
    const regex = /const UNSPLASH_DISHES = \[[\s\S]*?\];\s*const getUniqueDishImage = \([\s\S]*?};/m;
    detailsCode = detailsCode.replace(regex, replacementStr);
    
    fs.writeFileSync(detailsPath, detailsCode);
    console.log("Updated StoreDetails.jsx");
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
