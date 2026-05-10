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
    let changed = false;

    // Detect if chart.js needs registering in test
    const requiresChartJs = content.includes('Chart') || filePath.includes('chart');
    if (requiresChartJs && !content.includes('provideCharts(withDefaultRegisterables())')) {
      if (!content.includes('import { provideCharts, withDefaultRegisterables }')) {
        content = "import { provideCharts, withDefaultRegisterables } from 'ng2-charts';\n" + content;
      }
      
      content = content.replace(/providers:\s*\[([^\]]*)\]/, (match, p1) => {
        return `providers: [${p1 ? p1 + ', ' : ''}provideCharts(withDefaultRegisterables())]`;
      });
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
