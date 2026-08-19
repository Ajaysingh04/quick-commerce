import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Product from './models/Product.js';
import Category from './models/Category.js';
import fs from 'fs';

async function fixProductDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Read the CATEGORIZED_DISHES from StoreDetails.jsx
    const detailsPath = path.join(__dirname, '../frontend/src/pages/user/StoreDetails.jsx');
    const code = fs.readFileSync(detailsPath, 'utf8');
    const catMatch = code.match(/const CATEGORIZED_DISHES = (\{[\s\S]*?\});/);
    if(!catMatch) throw new Error("Could not find CATEGORIZED_DISHES in frontend");
    
    const CATEGORIZED_DISHES = JSON.parse(catMatch[1]);
    
    const getUniqueDishImage = (cuisine, idx) => {
      const keyword = (cuisine || '').toLowerCase();
      let cat = 'default';
      
      if (keyword.includes('pizza')) cat = 'pizza';
      else if (keyword.includes('burger')) cat = 'burger';
      else if (keyword.includes('indian') || keyword.includes('biryani') || keyword.includes('curry') || keyword.includes('mughlai') || keyword.includes('chicken') || keyword.includes('mutton') || keyword.includes('paneer')) cat = 'indian';
      else if (keyword.includes('cake') || keyword.includes('dessert') || keyword.includes('sweet') || keyword.includes('bakery') || keyword.includes('mithai')) cat = 'cake';
      else if (keyword.includes('salad') || keyword.includes('healthy') || keyword.includes('diet')) cat = 'salad';
      else if (keyword.includes('drink') || keyword.includes('beverage') || keyword.includes('shake') || keyword.includes('coffee') || keyword.includes('tea')) cat = 'drink';
      else if (keyword.includes('noodle') || keyword.includes('chinese') || keyword.includes('asian') || keyword.includes('pasta') || keyword.includes('momos')) cat = 'noodles';
      else if (keyword.includes('sandwich') || keyword.includes('wrap') || keyword.includes('roll') || keyword.includes('fast product') || keyword.includes('street')) cat = 'sandwich';
      else if (keyword.includes('ice') || keyword.includes('cream')) cat = 'icecream';
      
      let arr = CATEGORIZED_DISHES[cat];
      if (!arr || arr.length === 0) arr = CATEGORIZED_DISHES.default;
      
      const seed = keyword.charCodeAt(0) + (idx * 13) + (Math.floor(Math.random() * 50));
      return arr[seed % arr.length];
    };

    const products = await Product.find({}).populate('category');
    let count = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      // Only replace if it's an unsplash, loremflickr, mealdb, or default image. (Don't overwrite real user uploads if any)
      if (!product.image || product.image.includes('unsplash') || product.image.includes('loremflickr') || product.image.includes('mealdb') || product.image.includes('dish_default')) {
        const catName = product.category ? product.category.name : product.name;
        product.image = getUniqueDishImage(product.name + ' ' + catName, i);
        await product.save();
        count++;
      }
    }
    
    console.log(`Successfully updated ${count} product items in MongoDB with accurate categorized images!`);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

fixProductDB();
