const https = require('https');
const fs = require('fs');
const content = fs.readFileSync('c:/FoodDelivery/frontend/src/pages/user/Home.jsx', 'utf8');
const urls = Array.from(new Set(content.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+[^'"\\]+/g) || []));

Promise.all(urls.map(u => new Promise(resolve => {
  https.get(u, res => {
    resolve({ url: u, status: res.statusCode });
  }).on('error', e => resolve({ url: u, status: 500 }));
}))).then(res => {
  const broken = res.filter(r => r.status !== 200 && r.status !== 301 && r.status !== 302);
  console.log(JSON.stringify(broken, null, 2));
});
