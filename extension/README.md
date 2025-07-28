# 🔍 Trace Sight Debug View Extension

A powerful Chrome extension that brings AI-powered debugging capabilities to any webpage. Built with React and integrated with OpenAI's GPT-4 for intelligent element analysis.

## ✨ Features

- **🎯 Element Inspection**: Hover over any element to see detailed information
- **🤖 AI-Powered Debugging**: Ask questions about elements and get intelligent analysis
- **⌨️ Keyboard Shortcuts**: Quick access to debugging features
- **📱 Modern UI**: Clean, responsive interface with dark theme
- **🔄 Real-time Analysis**: Instant feedback on element properties and issues

## 🚀 Installation

### From Chrome Web Store
*(Coming soon - extension will be published)*

### Manual Installation (Developer Mode)
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this repository
5. The extension should now appear in your extensions list

## 🔧 Setup

1. **API Key Configuration**:
   - Click the extension icon in Chrome toolbar
   - Enter your OpenAI API key in the popup
   - Click "Save API Key"

2. **Activate LogTrace**:
   - Toggle "Enable LogTrace" in the popup
   - Or click the extension icon to quickly toggle

## 📖 Usage

### Basic Element Inspection
1. Navigate to any webpage
2. Ensure LogTrace is active (green dot in popup)
3. Move your mouse over elements to see them highlighted
4. Click on any element to open the inspector panel

### AI-Powered Debugging
1. Select an element using the inspector
2. Click "Debug" in the inspector panel
3. Ask a question about the element (e.g., "Why isn't this button clickable?")
4. Get detailed analysis with:
   - Element summary and analysis
   - Identified issues
   - Actionable recommendations
   - Code snippets for fixes
   - Step-by-step debugging guide

### Keyboard Shortcuts
- **Ctrl+S**: Start/Stop tracing
- **Ctrl+E**: End tracing session
- **Ctrl+T**: Toggle terminal panel
- **Ctrl+D**: Trigger AI debug
- **Ctrl+P**: Pause/Resume hover tracking
- **Q**: Quick actions menu
- **Esc**: Close panels/modals

## 🎯 Use Cases

### For Developers
- **CSS Debugging**: Identify layout issues, positioning problems, and styling conflicts
- **JavaScript Issues**: Analyze event handlers, DOM manipulation problems
- **Accessibility**: Check ARIA attributes, keyboard navigation, screen reader compatibility
- **Performance**: Identify render-blocking elements and optimization opportunities

### For Designers
- **Layout Analysis**: Understand spacing, alignment, and responsive behavior
- **Typography**: Check font rendering, line height, and text overflow
- **Color Contrast**: Analyze accessibility compliance
- **Component Inspection**: Understand how designs are implemented

### For QA Engineers
- **Bug Investigation**: Quickly identify the root cause of visual issues
- **Cross-browser Testing**: Analyze element behavior across different browsers
- **Mobile Responsiveness**: Check how elements adapt to different screen sizes
- **User Experience**: Identify usability issues and interaction problems

## 🔧 Technical Details

### Architecture
- **Content Script**: Handles element inspection and user interactions
- **Background Script**: Manages API calls and extension state
- **Popup Interface**: Provides configuration and status information
- **React Integration**: Leverages existing LogTrace React components

### API Integration
- **OpenAI GPT-4**: Powers intelligent element analysis
- **Chrome Extension APIs**: Handles storage, messaging, and script injection
- **DOM Analysis**: Comprehensive element context gathering

### Security
- **API Key Storage**: Securely stored using Chrome's sync storage
- **Content Security Policy**: Strict CSP for enhanced security
- **Permissions**: Minimal required permissions for functionality

## 🛠️ Development

### Building the Extension
```bash
# Run the build script
node extension/build-extension.js

# Or manually validate
npm run build  # Build React app first (optional)
```

### Testing
1. Load the extension in developer mode
2. Test on various websites
3. Check console logs for debugging information
4. Verify API integration with OpenAI

### File Structure
```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── contentScript.js      # Main content script
├── contentScript.css     # Content script styles
├── background.js         # Background service worker
├── build-extension.js    # Build script
├── icons/               # Extension icons
└── README.md            # This file
```

## 🔍 Troubleshooting

### Common Issues

**Extension not loading**
- Ensure all required files are present
- Check Chrome developer console for errors
- Verify manifest.json syntax

**API calls failing**
- Verify OpenAI API key is correct
- Check internet connection
- Ensure API key has sufficient credits

**Elements not highlighting**
- Refresh the page after enabling LogTrace
- Check if the website has conflicting CSS
- Try disabling other extensions temporarily

**Keyboard shortcuts not working**
- Ensure LogTrace is active
- Check if you're typing in an input field
- Verify no other extensions are intercepting keys

### Debug Mode
Enable Chrome DevTools and check:
- Extension background page logs
- Content script console logs
- Network tab for API requests
- Storage tab for saved settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4 API
- Chrome Extensions team for the platform
- React team for the framework
- All contributors and testers

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the Chrome extension documentation

---

**Happy Debugging! 🐛➡️✨** 