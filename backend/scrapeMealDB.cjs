const https = require('https');
const fs = require('fs');

async function fetchMeals(letter) {
  return new Promise((resolve) => {
    https.get(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`, res => {
      let d = '';
      res.on('data', c => d+=c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(d);
          resolve(parsed.meals || []);
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

async function run() {
  let allMeals = [];
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  for (let char of alphabet) {
    const meals = await fetchMeals(char);
    allMeals = allMeals.concat(meals);
    console.log(`Fetched ${meals.length} for ${char}`);
  }
  
  const categorized = {};
  for (let meal of allMeals) {
    const name = meal.strMeal.toLowerCase();
    const cat = meal.strCategory.toLowerCase();
    
    // Exact assignments
    let keyword = 'food';
    if (name.includes('pizza')) keyword = 'pizza';
    else if (name.includes('burger') || name.includes('mac')) keyword = 'burger';
    else if (name.includes('chicken')) keyword = 'chicken';
    else if (name.includes('beef') || name.includes('steak')) keyword = 'beef';
    else if (name.includes('fish') || name.includes('salmon') || name.includes('prawn')) keyword = 'seafood';
    else if (name.includes('cake') || name.includes('tart') || name.includes('pie') || name.includes('pudding') || cat === 'dessert') keyword = 'dessert';
    else if (name.includes('pasta') || name.includes('spaghetti') || name.includes('penne')) keyword = 'pasta';
    else if (name.includes('salad')) keyword = 'salad';
    else if (name.includes('curry') || name.includes('masala') || name.includes('tikka')) keyword = 'indian';
    else if (name.includes('noodle')) keyword = 'noodles';
    else if (name.includes('sandwich') || name.includes('wrap')) keyword = 'sandwich';
    else if (name.includes('pork') || name.includes('bacon')) keyword = 'pork';
    else if (cat === 'breakfast') keyword = 'breakfast';
    else keyword = cat;

    if (!categorized[keyword]) categorized[keyword] = [];
    categorized[keyword].push(meal.strMealThumb);
  }
  
  // Add some fallback generic foods
  categorized['food'] = allMeals.slice(0, 50).map(m => m.strMealThumb);
  
  fs.writeFileSync('mealdb_mapped.json', JSON.stringify(categorized, null, 2));
  console.log(`Total meals: ${allMeals.length}. Mapped to ${Object.keys(categorized).length} categories.`);
}

run();
