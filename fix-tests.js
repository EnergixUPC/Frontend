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

    // Add imports if they don't exist
    const importsToAdd = [
      "import { TranslateModule } from '@ngx-translate/core';",
      "import { provideHttpClient } from '@angular/common/http';",
      "import { provideHttpClientTesting } from '@angular/common/http/testing';",
      "import { provideRouter } from '@angular/router';",
      "import { DEVICE_REPOSITORY_PROVIDER } from 'src/app/sems/energy-management/infrastructure/repositories/device.repository.provider';",
      "import { DEVICE_PREFERENCE_REPOSITORY_PROVIDER } from 'src/app/sems/energy-management/infrastructure/repositories/device-preference.repository.provider';"
    ];

    importsToAdd.forEach(imp => {
      if (!content.includes(imp)) {
        content = imp + '\n' + content;
        changed = true;
      }
    });

    // We change `imports: [...]` to include TranslateModule.forRoot() if not present
    if (content.includes('imports: [') && !content.includes('TranslateModule.forRoot()')) {
      content = content.replace(/imports:\s*\[([^\]]*)\]/, (match, p1) => {
        return `imports: [${p1 ? p1 + ', ' : ''}TranslateModule.forRoot()]`;
      });
      changed = true;
    }

    // We change `providers: [...]` if it exists to include providers, or add providers block
    const providersToAdd = "provideHttpClient(), provideHttpClientTesting(), provideRouter([]), DEVICE_REPOSITORY_PROVIDER, DEVICE_PREFERENCE_REPOSITORY_PROVIDER";
    
    if (content.includes('providers: [')) {
      if (!content.includes('provideHttpClient()')) {
        content = content.replace(/providers:\s*\[([^\]]*)\]/, (match, p1) => {
          return `providers: [${p1 ? p1 + ', ' : ''}${providersToAdd}]`;
        });
        changed = true;
      }
    } else {
      // no providers array, we must inject it into configureTestingModule object
      content = content.replace(/imports:\s*\[([^\]]*)\]/, (match) => {
        return `${match},\n      providers: [${providersToAdd}]`;
      });
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
