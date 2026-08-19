const fs = require('fs');
const path = require('path');

const extensions = ['.js', '.jsx', '.html'];
const excludeDirs = ['node_modules', 'dist', '.git', '.gemini'];

function renameApp(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        renameApp(fullPath);
      }
    } else {
      if (extensions.includes(path.extname(fullPath))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content.replace(/SwiftDrop/g, 'RoseDash');
        newContent = newContent.replace(/Appsica/g, 'RoseDash');
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Renamed in ${fullPath}`);
        }
      }
    }
  }
}

renameApp(path.join(__dirname, 'frontend'));
renameApp(path.join(__dirname, 'backend'));
console.log('Done renaming');
