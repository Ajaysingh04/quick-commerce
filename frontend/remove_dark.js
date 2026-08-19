const fs = require('fs');
const path = require('path');

const extensions = ['.js', '.jsx', '.html'];
const excludeDirs = ['node_modules', 'dist', '.git', '.gemini'];

function removeDarkClasses(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        removeDarkClasses(fullPath);
      }
    } else {
      if (extensions.includes(path.extname(fullPath))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        // Replace dark:something classes with empty string
        const regex = /\bdark:[a-zA-Z0-9\-\/\[\]]+\b/g;
        let newContent = content.replace(regex, '');
        
        // Also remove dark text/bg if there are multiple spaces left
        newContent = newContent.replace(/  +/g, ' ');

        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Removed dark classes in ${fullPath}`);
        }
      }
    }
  }
}

removeDarkClasses(path.join(__dirname, 'frontend/src'));
removeDarkClasses(path.join(__dirname, 'frontend/index.html'));
console.log('Done removing dark classes');
