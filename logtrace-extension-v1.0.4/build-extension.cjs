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
  } else {
    console.log('❌ Extension validation failed');
  }
  
  return isValid;
}

// Create extension package
function createPackage() {
  const extensionDir = __dirname;
  
  console.log('📦 To create extension package:');
  console.log('1. Navigate to the extension directory');
  console.log('2. Select all files and create a ZIP archive');
  console.log('3. Upload to Chrome Web Store');
  console.log(`📁 Extension directory: ${extensionDir}`);
}

// Main build process
async function build() {
  console.log('🚀 Starting build process...');
  
  // Step 1: Update manifest version
  updateManifestVersion();
  
  // Step 2: Validate extension
  const isValid = validateExtension();
  
  if (isValid) {
    console.log('✅ Build completed successfully!');
    console.log('🎉 Extension is ready for testing');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Open Chrome and go to chrome://extensions/');
    console.log('2. Enable "Developer mode"');
    console.log('3. Click "Load unpacked" and select the extension folder');
    console.log('4. Test the extension on any webpage');
    
    createPackage();
  } else {
    console.log('❌ Build failed. Please fix the issues above.');
    process.exit(1);
  }
}

// Run build
build().catch(console.error); 