const { image_search } = require('duckduckgo-images-api');
const fs = require('fs');

const categories = ['pizza', 'burger', 'indian curry', 'chocolate cake', 'healthy salad', 'cold beverage', 'noodles', 'sandwich', 'ice cream'];
const results = {};
let completed = 0;

categories.forEach(async (cat) => {
  try {
    const res = await image_search({ query: cat + ' food photography', moderate: true });
    // Filter only jpg/png and exclude pinterest/shutterstock which block hotlinking
    const valid = res.filter(r => !r.image.includes('pinterest') && !r.image.includes('shutterstock') && !r.image.includes('alamy') && !r.image.includes('istock') && (r.image.endsWith('.jpg') || r.image.endsWith('.png') || r.image.endsWith('.jpeg')));
    results[cat] = valid.slice(0, 30).map(r => r.image);
    console.log(`${cat}: ${results[cat].length} images`);
  } catch (error) {
    console.error(`Error for ${cat}:`, error);
    results[cat] = [];
  }
  
  completed++;
  if (completed === categories.length) {
    fs.writeFileSync('ddg_images.json', JSON.stringify(results, null, 2));
    console.log('Saved to ddg_images.json');
  }
});
