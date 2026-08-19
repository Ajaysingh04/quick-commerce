const google = require('google-image-sr');
const fs = require('fs');

const categories = ['pizza', 'burger', 'indian curry', 'chocolate cake', 'healthy salad', 'cold beverage', 'noodles', 'sandwich', 'ice cream'];
const results = {};
let completed = 0;

categories.forEach(async (cat) => {
  try {
    const res = await google.search(cat + ' food photography', { size: 'large' });
    // Filter only valid image links (no base64 or unsupported domains)
    const valid = res.filter(url => url.startsWith('http') && !url.includes('pinterest') && !url.includes('istock') && !url.includes('shutterstock'));
    results[cat] = valid.slice(0, 30);
    console.log(`${cat}: ${results[cat].length} images`);
  } catch (error) {
    console.error(`Error for ${cat}:`, error);
    results[cat] = [];
  }
  
  completed++;
  if (completed === categories.length) {
    fs.writeFileSync('google_images.json', JSON.stringify(results, null, 2));
    console.log('Saved to google_images.json');
  }
});
