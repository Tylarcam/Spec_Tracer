#!/bin/bash

# LogTrace Terminal Build Backup Script
# This script creates a complete backup of the terminal build for restoration

set -e

# Get current date for backup naming
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="terminal-backup-${BACKUP_DATE}"
BACKUP_ZIP="terminal-build-${BACKUP_DATE}.zip"

echo "Creating LogTrace Terminal Build Backup..."
echo "Backup Directory: ${BACKUP_DIR}"
echo "Backup Archive: ${BACKUP_ZIP}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Create directory structure
mkdir -p "${BACKUP_DIR}/src/components/LogTrace"
mkdir -p "${BACKUP_DIR}/src/extension/components"
mkdir -p "${BACKUP_DIR}/src/shared/hooks"
mkdir -p "${BACKUP_DIR}/src/shared/types"
mkdir -p "${BACKUP_DIR}/src/utils"
mkdir -p "${BACKUP_DIR}/src/hooks"
mkdir -p "${BACKUP_DIR}/src/components/ui"
mkdir -p "${BACKUP_DIR}/extension"

echo "Copying core terminal files..."

# Core Terminal Files
cp "src/components/LogTrace/TabbedTerminal.tsx" "${BACKUP_DIR}/src/components/LogTrace/"
cp "src/extension/components/ExtensionTerminalWrapper.tsx" "${BACKUP_DIR}/src/extension/components/"
cp "src/shared/hooks/useDebugResponses.ts" "${BACKUP_DIR}/src/shared/hooks/"
cp "src/shared/hooks/useConsoleLogs.ts" "${BACKUP_DIR}/src/shared/hooks/"
cp "src/shared/types.ts" "${BACKUP_DIR}/src/shared/"

echo "Copying supporting files..."

# Supporting Files
cp "src/utils/sanitization.ts" "${BACKUP_DIR}/src/utils/"
cp "src/utils/elementDataFormatter.ts" "${BACKUP_DIR}/src/utils/"
cp "src/hooks/use-mobile.tsx" "${BACKUP_DIR}/src/hooks/"

echo "Copying UI components..."

# UI Components
cp "src/components/ui/card.tsx" "${BACKUP_DIR}/src/components/ui/"
cp "src/components/ui/button.tsx" "${BACKUP_DIR}/src/components/ui/"
cp "src/components/ui/tabs.tsx" "${BACKUP_DIR}/src/components/ui/"
cp "src/components/ui/badge.tsx" "${BACKUP_DIR}/src/components/ui/"

echo "Copying integration files..."

# Integration Files (partial copies - only terminal-related parts)
# Note: These files contain other functionality, so we'll copy them entirely
cp "src/components/LogTrace.tsx" "${BACKUP_DIR}/src/components/"
cp "src/extension/LogTraceExtension.tsx" "${BACKUP_DIR}/src/extension/"
cp "extension/contentScript.js" "${BACKUP_DIR}/extension/"

echo "Copying configuration files..."

# Configuration Files
cp "package.json" "${BACKUP_DIR}/"
cp "tailwind.config.ts" "${BACKUP_DIR}/"
cp "tsconfig.json" "${BACKUP_DIR}/"
cp "vite.config.ts" "${BACKUP_DIR}/"

echo "Creating restoration script..."

# Create restoration script
cat > "${BACKUP_DIR}/restore-terminal.sh" << 'EOF'
#!/bin/bash

# LogTrace Terminal Build Restoration Script
# This script restores the terminal build to a new project

set -e

echo "Restoring LogTrace Terminal Build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from your project root."
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Restoring terminal files..."

# Restore core terminal files
mkdir -p "src/components/LogTrace"
mkdir -p "src/extension/components"
mkdir -p "src/shared/hooks"
mkdir -p "src/shared/types"
mkdir -p "src/utils"
mkdir -p "src/hooks"
mkdir -p "src/components/ui"
mkdir -p "extension"

# Copy files back
cp "terminal-backup-*/src/components/LogTrace/TabbedTerminal.tsx" "src/components/LogTrace/"
cp "terminal-backup-*/src/extension/components/ExtensionTerminalWrapper.tsx" "src/extension/components/"
cp "terminal-backup-*/src/shared/hooks/useDebugResponses.ts" "src/shared/hooks/"
cp "terminal-backup-*/src/shared/hooks/useConsoleLogs.ts" "src/shared/hooks/"
cp "terminal-backup-*/src/shared/types.ts" "src/shared/"
cp "terminal-backup-*/src/utils/sanitization.ts" "src/utils/"
cp "terminal-backup-*/src/utils/elementDataFormatter.ts" "src/utils/"
cp "terminal-backup-*/src/hooks/use-mobile.tsx" "src/hooks/"
cp "terminal-backup-*/src/components/ui/card.tsx" "src/components/ui/"
cp "terminal-backup-*/src/components/ui/button.tsx" "src/components/ui/"
cp "terminal-backup-*/src/components/ui/tabs.tsx" "src/components/ui/"
cp "terminal-backup-*/src/components/ui/badge.tsx" "src/components/ui/"
cp "terminal-backup-*/src/components/LogTrace.tsx" "src/components/"
cp "terminal-backup-*/src/extension/LogTraceExtension.tsx" "src/extension/"
cp "terminal-backup-*/extension/contentScript.js" "extension/"

echo "Terminal build restored successfully!"
echo "Run 'npm run dev' to start the development server."
echo "Check the terminal functionality by opening the LogTrace interface."
EOF

chmod +x "${BACKUP_DIR}/restore-terminal.sh"

echo "Creating backup manifest..."

# Create backup manifest
cat > "${BACKUP_DIR}/BACKUP_MANIFEST.md" << EOF
# LogTrace Terminal Build Backup Manifest

**Backup Date:** ${BACKUP_DATE}
**Backup Archive:** ${BACKUP_ZIP}

## Files Included

### Core Terminal Files
- \`src/components/LogTrace/TabbedTerminal.tsx\` - Main terminal component
- \`src/extension/components/ExtensionTerminalWrapper.tsx\` - Extension wrapper
- \`src/shared/hooks/useDebugResponses.ts\` - Debug responses hook
- \`src/shared/hooks/useConsoleLogs.ts\` - Console logs hook
- \`src/shared/types.ts\` - Type definitions

### Supporting Files
- \`src/utils/sanitization.ts\` - Sanitization utilities
- \`src/utils/elementDataFormatter.ts\` - Element formatting utilities
- \`src/hooks/use-mobile.tsx\` - Mobile detection hook

### UI Components
- \`src/components/ui/card.tsx\` - Card component
- \`src/components/ui/button.tsx\` - Button component
- \`src/components/ui/tabs.tsx\` - Tabs component
- \`src/components/ui/badge.tsx\` - Badge component

### Integration Files
- \`src/components/LogTrace.tsx\` - Main LogTrace component
- \`src/extension/LogTraceExtension.tsx\` - Extension component
- \`extension/contentScript.js\` - Content script

### Configuration Files
- \`package.json\` - Dependencies and scripts
- \`tailwind.config.ts\` - Tailwind CSS configuration
- \`tsconfig.json\` - TypeScript configuration
- \`vite.config.ts\` - Vite configuration

## Restoration Instructions

1. Extract the backup archive
2. Run \`./restore-terminal.sh\` in your new project directory
3. Verify terminal functionality

## Dependencies Required

See \`package.json\` for complete dependency list.

## Notes

- Console log capture is currently disabled
- Mobile responsiveness is implemented
- Event export creates JSON files with timestamps
- Debug responses are limited to last 50 entries
EOF

echo "Creating zip archive..."

# Create zip archive
zip -r "${BACKUP_ZIP}" "${BACKUP_DIR}"

echo "Backup completed successfully!"
echo "Backup Directory: ${BACKUP_DIR}"
echo "Backup Archive: ${BACKUP_ZIP}"
echo ""
echo "To restore this build:"
echo "1. Extract ${BACKUP_ZIP}"
echo "2. Copy files to your new project"
echo "3. Run 'npm install'"
echo "4. Run 'npm run dev'"
echo ""
echo "Files to preserve for future restoration:"
echo "- ${BACKUP_ZIP} (complete backup)"
echo "- ${BACKUP_DIR} (extracted backup)"
echo "- docs/Terminal-Build-Documentation.md (documentation)" 