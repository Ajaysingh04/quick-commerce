const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /Restaurant/g, to: 'Store' },
  { from: /restaurant/g, to: 'store' },
  { from: /Food/g, to: 'Product' },
  { from: /food/g, to: 'product' },
  { from: /RESTAURANT/g, to: 'STORE' },
  { from: /FOOD/g, to: 'PRODUCT' }
];

const extensions = ['.js', '.jsx', '.json', '.html', '.css'];
const excludeDirs = ['node_modules', 'dist', '.git', '.gemini'];

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        walkAndReplace(fullPath);
      }
    } else {
      if (extensions.includes(path.extname(fullPath))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content;
        for (const { from, to } of replacements) {
          newContent = newContent.replace(from, to);
        }
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Replaced in ${fullPath}`);
        }
      }
    }
  }
}

function walkAndRename(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          walkAndRename(fullPath);
        }
      } else {
          let newFile = file;
          for (const { from, to } of replacements) {
            newFile = newFile.replace(from, to);
          }
          if (file !== newFile) {
            const newPath = path.join(dir, newFile);
            fs.renameSync(fullPath, newPath);
            console.log(`Renamed ${fullPath} to ${newPath}`);
          }
      }
    }
}

walkAndReplace(path.join(__dirname, 'backend'));
walkAndReplace(path.join(__dirname, 'frontend/src'));
walkAndRename(path.join(__dirname, 'backend'));
walkAndRename(path.join(__dirname, 'frontend/src'));
console.log('Done refactoring');
