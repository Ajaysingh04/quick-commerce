const https = require('https');
const fs = require('fs');

const categories = ['pizza', 'burger', 'indian curry', 'chocolate cake', 'healthy salad', 'cold beverage', 'noodles', 'sandwich', 'ice cream', 'shawarma', 'biryani'];
const results = {};
let completed = 0;

categories.forEach(cat => {
  const url = `https://www.google.com/search?q=${encodeURIComponent(cat)}+food+photography&tbm=isch`;
  const req = https.request(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
      // Google images returns base64 and URLs. We look for encypted strings or simply raw urls.
      const regex = /src="(https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=[^"]+)"/g;
      const matches = [...html.matchAll(regex)].map(m => m[1]);
      results[cat] = [...new Set(matches)].slice(0, 20);
      console.log(`${cat}: ${results[cat].length} images`);
      
      completed++;
      if (completed === categories.length) {
        fs.writeFileSync('google_images.json', JSON.stringify(results, null, 2));
      }
    });
  });
  req.on('error', e => console.error(e));
  req.end();
});
