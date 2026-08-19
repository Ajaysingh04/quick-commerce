const fs = require('fs');
const path = require('path');

const DIR = 'c:/FoodDelivery/frontend/src/pages/user';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.jsx'));

const onErrorStr = `onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"; }} `;

files.forEach(file => {
  const filePath = path.join(DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace <img that don't already have onError
  let newContent = content.replace(/<img(?![^>]*onError)/g, '<img ' + onErrorStr);
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed', file);
  }
});
