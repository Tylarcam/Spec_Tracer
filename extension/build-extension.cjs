
// Build script for Trace Sight Extension
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Trace Sight Extension...');

// Update manifest version
function updateManifestVersion() {
  const manifestPath = path.join(__dirname, 'manifest.json');
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    manifest.version = packageJson.version;
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Manifest version updated to ${packageJson.version}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating manifest version:', error);
    return false;
  }
}

// Validate extension files
function validateExtension() {
  const requiredFiles = [
    'manifest.json',
    'popup.html',
    'popup.js',
    'contentScript.js',
    'contentScript.css',
    'background.js',
    'icons/icon16.png',
    'icons/icon32.png',
    'icons/icon48.png',
    'icons/icon128.png'
  ];
  
  let isValid = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Missing required file: ${file}`);
      isValid = false;
    }
  });
  
  if (isValid) {
    console.log('✅ Extension validation passed');
  }
  
  return isValid;
}

// Main build process
async function build() {
  console.log('🚀 Starting extension build...');
  
  updateManifestVersion();
  const isValid = validateExtension();
  
  if (isValid) {
    console.log('✅ Extension build completed successfully!');
  } else {
    console.log('❌ Extension build failed. Please fix the issues above.');
    process.exit(1);
  }
}

// Run build
build().catch(console.error);
