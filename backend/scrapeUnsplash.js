import fs from 'fs';
import https from 'https';

async function fetchUnsplashIds(query) {
  return new Promise((resolve) => {
    https.get(`https://unsplash.com/s/photos/${query}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const regex = /images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+/g;
        const matches = [...new Set(data.match(regex) || [])];
        const uniqueIds = matches.filter(m => m.includes('photo-')).map(m => 'https://' + m + '?w=400&fit=crop');
        resolve(uniqueIds);
      });
    }).on('error', () => resolve([]));
  });
}

async function run() {
  const queries = ['pizza', 'burger', 'indian-product', 'cake', 'salad', 'cold-drink', 'noodles', 'sandwich', 'ice-cream'];
  const results = {};
  for (const q of queries) {
    results[q] = await fetchUnsplashIds(q);
    console.log(q, results[q].length);
  }
  fs.writeFileSync('unsplash_scraped.json', JSON.stringify(results, null, 2));
}

run();
