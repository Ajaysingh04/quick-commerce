const fs = require('fs');
const path = require('path');

const extensions = ['.js', '.jsx', '.html'];
const excludeDirs = ['node_modules', 'dist', '.git', '.gemini'];

function makeItPink(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        makeItPink(fullPath);
      }
    } else {
      if (extensions.includes(path.extname(fullPath))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content.replace(/bg-slate-50/g, 'bg-pink-50');
        newContent = newContent.replace(/bg-slate-100/g, 'bg-pink-100');
        newContent = newContent.replace(/border-slate-100/g, 'border-pink-200');
        newContent = newContent.replace(/border-slate-200/g, 'border-pink-200');
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Made pinker in ${fullPath}`);
        }
      }
    }
  }
}

makeItPink(path.join(__dirname, 'frontend/src'));
console.log('Done making it pinker');
