const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/app', function(filePath) {
  if (filePath.endsWith('.spec.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('provideRouter([, provideCharts(withDefaultRegisterables())])')) {
      content = content.replace('provideRouter([, provideCharts(withDefaultRegisterables())])', 'provideRouter([]), provideCharts(withDefaultRegisterables())');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed syntax config in', filePath);
    }
  }
});
