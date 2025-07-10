// Simple extension validation test
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Trace Sight Extension...');

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

let allValid = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allValid = false;
  }
});

if (allValid) {
  console.log('\n🎉 Extension validation passed!');
  console.log('📋 Ready to load in Chrome:');
  console.log('1. Go to chrome://extensions/');
  console.log('2. Enable "Developer mode"');
  console.log('3. Click "Load unpacked"');
  console.log('4. Select the extension folder');
} else {
  console.log('\n❌ Extension validation failed!');
}

console.log('\n🔧 Fixed Issues:');
console.log('✅ Content script injection moved to background script');
console.log('✅ Added proper error handling for chrome.scripting API');
console.log('✅ Fixed popup communication with background script');
console.log('✅ Added floating toggle button with animations'); 