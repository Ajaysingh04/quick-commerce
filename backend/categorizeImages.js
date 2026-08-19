import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchCategorizedMeals() {
  return new Promise((resolve) => {
    const letters = 'abcdefghijklmnop'.split('');
    let categorized = {};
    let pending = letters.length;
    
    letters.forEach(l => {
      https.get('https://www.themealdb.com/api/json/v1/1/search.php?f=' + l, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if(json.meals) {
              json.meals.forEach(m => {
                const cat = m.strCategory.toLowerCase();
                if (!categorized[cat]) categorized[cat] = [];
                categorized[cat].push(m.strMealThumb + '/preview');
              });
            }
          } catch(e) {}
          pending--;
          if(pending === 0) resolve(categorized);
        });
      }).on('error', () => {
        pending--;
        if(pending === 0) resolve(categorized);
      });
    });
  });
}

async function run() {
  try {
    const catMeals = await fetchCategorizedMeals();
    
    // Build a mapped dictionary for our app
    const APP_CATEGORIES = {
      pizza: [...(catMeals.miscellaneous || []), ...(catMeals.starter || [])],
      burger: [...(catMeals.beef || []), ...(catMeals.pork || [])],
      indian: [...(catMeals.lamb || []), ...(catMeals.chicken || []), ...(catMeals.goat || [])],
      cake: [...(catMeals.dessert || [])],
      salad: [...(catMeals.vegan || []), ...(catMeals.vegetarian || []), ...(catMeals.side || [])],
      drink: [...(catMeals.dessert || [])], // fallback
      noodles: [...(catMeals.pasta || []), ...(catMeals.seaproduct || [])],
      sandwich: [...(catMeals.starter || []), ...(catMeals.breakfast || [])],
      icecream: [...(catMeals.dessert || [])],
      default: []
    };
    
    // Fill default with everything just in case
    for(let k in catMeals) {
      APP_CATEGORIES.default.push(...catMeals[k]);
    }
    
    // Remove duplicates
    for(let k in APP_CATEGORIES) {
      APP_CATEGORIES[k] = [...new Set(APP_CATEGORIES[k])];
    }
    
    // Inject into StoreDetails.jsx
    const detailsPath = path.join(__dirname, '../frontend/src/pages/user/StoreDetails.jsx');
    let detailsCode = fs.readFileSync(detailsPath, 'utf8');
    
    const replacementStr = `const CATEGORIZED_DISHES = ${JSON.stringify(APP_CATEGORIES, null, 2)};

const getUniqueDishImage = (cuisine, idx) => {
  const keyword = cuisine.toLowerCase();
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
  
  const seed = cuisine.charCodeAt(0) + (idx * 13) + (Math.floor(Math.random() * 50));
  return arr[seed % arr.length];
};`;
    
    const regex = /const MEALDB_DISHES = \[[\s\S]*?\];\s*const getUniqueDishImage = \([\s\S]*?};/m;
    detailsCode = detailsCode.replace(regex, replacementStr);
    
    fs.writeFileSync(detailsPath, detailsCode);
    console.log("Successfully injected accurate categorized product images into StoreDetails.jsx!");
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
