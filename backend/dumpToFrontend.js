import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Store from './models/Store.js';

const UNSPLASH_PRODUCT = [
  "1504674900247-0877df9cc836", "1546069901-ba9599a7e63c", "1565299624946-b28f40a0ae38", "1568901346375-23c9450c58cd",
  "1499028365109-05de5f4b2383", "1476224203421-9ce132454b8e", "1497034825429-c343d7c6a68f", "1482049149306-0ce0c41031b6",
  "1484723091782-4282613d9646", "1460306855393-0410f61241c7", "1473093295043-cdd812d0e601", "1512621776951-a57141f2eefd",
  "1432139555190-58524dae6a55", "1481070555726-e2fe834ce5d1", "1455619452474-d2be8b1e70cd", "1506084868230-bb9d95c24759",
  "1493770348161-369560ae357d", "1478145046317-39f10e56b5e9", "1485962398705-fc6a4ea1f12d", "1517244683847-759023c5a5e3",
  "1496412705662-89688b7da0a7", "1504754524776-8f4f3848c6ad", "1414235077428-338989a2e8c0", "1528605105345-5344ea20e269",
  "1495147466023-06649c5e523f", "1484980972926-ed4533fd31cb", "1529042410759-befb1204b468", "1511690655006-be0d30256d0d",
  "1470324161839-ce2a4ef5ac4d", "1476718406336-a5b96e1a1661", "1481931098730-315284487b7a", "1494859802808-5dae5e78396f",
  "1504674900247-0877df9cc836", "1512058564366-18510be2db19", "1513104890138-7c749659a591", "1515003197201-228ea4dda895",
  "1520201163981-8cc95007dd2a", "1525351484163-e4faa7c581e4", "1527515637462-8f69b83b40cc", "1529042410759-befb1204b468",
  "1540189549336-e6e99c3679fe", "1540420773417-64906f368c34", "1544025162-04b779a18d18", "1550547660-d9450f859349",
  "1551183053-bf91a1d81141", "1555939594-58d7cb561ad1", "1559196397-2a54388edbd8", "1563379091339-03b21ab4a4f8",
  "1565299624946-b28f40a0ae38", "1565958011703-44f9829ba187", "1567620832903-9fc6debc209f", "1568901346375-23c9450c58cd"
];

// Helper to reliably get a random unsplash product image
function getUnsplashImage(seed) {
  // Use seed to deterministically pick an image so it stays same for the same ID, or just random if no seed
  const idx = seed ? seed % UNSPLASH_PRODUCT.length : Math.floor(Math.random() * UNSPLASH_PRODUCT.length);
  return `https://images.unsplash.com/photo-${UNSPLASH_PRODUCT[idx]}?w=800&q=80`;
}

async function dumpToFrontend() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const stores = await Store.find({});
    
    let jsCode = "export const STORES = [\n";
    let count = 0;
    
    for(const res of stores) {
      count++;
      const isVeg = res.cuisineTypes.includes('Desserts') || res.cuisineTypes.includes('Mithai') || res.cuisineTypes.includes('Bakery') || res.cuisineTypes.includes('Ice Cream') || res.cuisineTypes.includes('Healthy');
      let offer = "";
      if(Math.random() > 0.5) offer = "50% OFF";
      else if(Math.random() > 0.5) offer = "₹100 OFF";
      
      const bannerImage = getUnsplashImage(count);
      
      jsCode += `  { id: '${res._id}', name: \`${res.name.replace(/`/g, "'")}\`, rating: ${res.rating}, costForTwo: ${res.costForTwo}, cuisineTypes: ${JSON.stringify(res.cuisineTypes)}, deliveryTime: ${res.deliveryTime}, image: '${bannerImage}', offer: '${offer}', isVeg: ${isVeg} },\n`;
    }
    
    jsCode += "];";

    const homePath = path.join(__dirname, '../frontend/src/pages/user/Home.jsx');
    let homeCode = fs.readFileSync(homePath, 'utf8');
    
    // Replace the export const STORES block
    homeCode = homeCode.replace(/export const STORES = \[[\s\S]*?\];/m, jsCode);
    
    fs.writeFileSync(homePath, homeCode);
    console.log("Successfully updated Home.jsx using fast Unsplash CDN images.");
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

dumpToFrontend();
