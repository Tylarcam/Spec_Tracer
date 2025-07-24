# LogTrace Terminal Build Backup Script (PowerShell)
# This script creates a complete backup of the terminal build for restoration

# Get current date for backup naming
$BackupDate = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = "terminal-backup-$BackupDate"
$BackupZip = "terminal-build-$BackupDate.zip"

Write-Host "Creating LogTrace Terminal Build Backup..." -ForegroundColor Green
Write-Host "Backup Directory: $BackupDir" -ForegroundColor Yellow
Write-Host "Backup Archive: $BackupZip" -ForegroundColor Yellow

# Create backup directory
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

# Create directory structure
$directories = @(
    "$BackupDir/src/components/LogTrace",
    "$BackupDir/src/extension/components",
    "$BackupDir/src/shared/hooks",
    "$BackupDir/src/shared/types",
    "$BackupDir/src/utils",
    "$BackupDir/src/hooks",
    "$BackupDir/src/components/ui",
    "$BackupDir/extension"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

Write-Host "Copying core terminal files..." -ForegroundColor Cyan

# Core Terminal Files
$coreFiles = @{
    "src/components/LogTrace/TabbedTerminal.tsx" = "$BackupDir/src/components/LogTrace/"
    "src/extension/components/ExtensionTerminalWrapper.tsx" = "$BackupDir/src/extension/components/"
    "src/shared/hooks/useDebugResponses.ts" = "$BackupDir/src/shared/hooks/"
    "src/shared/hooks/useConsoleLogs.ts" = "$BackupDir/src/shared/hooks/"
    "src/shared/types.ts" = "$BackupDir/src/shared/"
}

foreach ($file in $coreFiles.GetEnumerator()) {
    if (Test-Path $file.Key) {
        Copy-Item $file.Key $file.Value -Force
        Write-Host "  ✓ $($file.Key)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($file.Key) - Not found" -ForegroundColor Red
    }
}

Write-Host "Copying supporting files..." -ForegroundColor Cyan

# Supporting Files
$supportingFiles = @{
    "src/utils/sanitization.ts" = "$BackupDir/src/utils/"
    "src/utils/elementDataFormatter.ts" = "$BackupDir/src/utils/"
    "src/hooks/use-mobile.tsx" = "$BackupDir/src/hooks/"
}

foreach ($file in $supportingFiles.GetEnumerator()) {
    if (Test-Path $file.Key) {
        Copy-Item $file.Key $file.Value -Force
        Write-Host "  ✓ $($file.Key)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($file.Key) - Not found" -ForegroundColor Red
    }
}

Write-Host "Copying UI components..." -ForegroundColor Cyan

# UI Components
$uiFiles = @{
    "src/components/ui/card.tsx" = "$BackupDir/src/components/ui/"
    "src/components/ui/button.tsx" = "$BackupDir/src/components/ui/"
    "src/components/ui/tabs.tsx" = "$BackupDir/src/components/ui/"
    "src/components/ui/badge.tsx" = "$BackupDir/src/components/ui/"
}

foreach ($file in $uiFiles.GetEnumerator()) {
    if (Test-Path $file.Key) {
        Copy-Item $file.Key $file.Value -Force
        Write-Host "  ✓ $($file.Key)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($file.Key) - Not found" -ForegroundColor Red
    }
}

Write-Host "Copying integration files..." -ForegroundColor Cyan

# Integration Files
$integrationFiles = @{
    "src/components/LogTrace.tsx" = "$BackupDir/src/components/"
    "src/extension/LogTraceExtension.tsx" = "$BackupDir/src/extension/"
    "extension/contentScript.js" = "$BackupDir/extension/"
}

foreach ($file in $integrationFiles.GetEnumerator()) {
    if (Test-Path $file.Key) {
        Copy-Item $file.Key $file.Value -Force
        Write-Host "  ✓ $($file.Key)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($file.Key) - Not found" -ForegroundColor Red
    }
}

Write-Host "Copying configuration files..." -ForegroundColor Cyan

# Configuration Files
$configFiles = @{
    "package.json" = "$BackupDir/"
    "tailwind.config.ts" = "$BackupDir/"
    "tsconfig.json" = "$BackupDir/"
    "vite.config.ts" = "$BackupDir/"
}

foreach ($file in $configFiles.GetEnumerator()) {
    if (Test-Path $file.Key) {
        Copy-Item $file.Key $file.Value -Force
        Write-Host "  ✓ $($file.Key)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($file.Key) - Not found" -ForegroundColor Red
    }
}

Write-Host "Creating restoration script..." -ForegroundColor Cyan

# Create restoration script
$restoreScript = @"
# LogTrace Terminal Build Restoration Script (PowerShell)
# This script restores the terminal build to a new project

Write-Host "Restoring LogTrace Terminal Build..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from your project root." -ForegroundColor Red
    exit 1
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Restoring terminal files..." -ForegroundColor Yellow

# Restore core terminal files
`$restoreDirs = @(
    "src/components/LogTrace",
    "src/extension/components", 
    "src/shared/hooks",
    "src/shared/types",
    "src/utils",
    "src/hooks",
    "src/components/ui",
    "extension"
)

foreach (`$dir in `$restoreDirs) {
    New-Item -ItemType Directory -Path `$dir -Force | Out-Null
}

# Copy files back
`$backupPattern = "terminal-backup-*"
`$backupDir = Get-ChildItem -Directory -Name `$backupPattern | Select-Object -First 1

if (`$backupDir) {
    Copy-Item "`$backupDir/src/components/LogTrace/TabbedTerminal.tsx" "src/components/LogTrace/" -Force
    Copy-Item "`$backupDir/src/extension/components/ExtensionTerminalWrapper.tsx" "src/extension/components/" -Force
    Copy-Item "`$backupDir/src/shared/hooks/useDebugResponses.ts" "src/shared/hooks/" -Force
    Copy-Item "`$backupDir/src/shared/hooks/useConsoleLogs.ts" "src/shared/hooks/" -Force
    Copy-Item "`$backupDir/src/shared/types.ts" "src/shared/" -Force
    Copy-Item "`$backupDir/src/utils/sanitization.ts" "src/utils/" -Force
    Copy-Item "`$backupDir/src/utils/elementDataFormatter.ts" "src/utils/" -Force
    Copy-Item "`$backupDir/src/hooks/use-mobile.tsx" "src/hooks/" -Force
    Copy-Item "`$backupDir/src/components/ui/card.tsx" "src/components/ui/" -Force
    Copy-Item "`$backupDir/src/components/ui/button.tsx" "src/components/ui/" -Force
    Copy-Item "`$backupDir/src/components/ui/tabs.tsx" "src/components/ui/" -Force
    Copy-Item "`$backupDir/src/components/ui/badge.tsx" "src/components/ui/" -Force
    Copy-Item "`$backupDir/src/components/LogTrace.tsx" "src/components/" -Force
    Copy-Item "`$backupDir/src/extension/LogTraceExtension.tsx" "src/extension/" -Force
    Copy-Item "`$backupDir/extension/contentScript.js" "extension/" -Force
    
    Write-Host "Terminal build restored successfully!" -ForegroundColor Green
    Write-Host "Run 'npm run dev' to start the development server." -ForegroundColor Yellow
    Write-Host "Check the terminal functionality by opening the LogTrace interface." -ForegroundColor Yellow
} else {
    Write-Host "Error: No backup directory found." -ForegroundColor Red
}
"@

Set-Content -Path "$BackupDir/restore-terminal.ps1" -Value $restoreScript

Write-Host "Creating backup manifest..." -ForegroundColor Cyan

# Create backup manifest
$manifest = @"
# LogTrace Terminal Build Backup Manifest

**Backup Date:** $BackupDate
**Backup Archive:** $BackupZip

## Files Included

### Core Terminal Files
- `src/components/LogTrace/TabbedTerminal.tsx` - Main terminal component
- `src/extension/components/ExtensionTerminalWrapper.tsx` - Extension wrapper
- `src/shared/hooks/useDebugResponses.ts` - Debug responses hook
- `src/shared/hooks/useConsoleLogs.ts` - Console logs hook
- `src/shared/types.ts` - Type definitions

### Supporting Files
- `src/utils/sanitization.ts` - Sanitization utilities
- `src/utils/elementDataFormatter.ts` - Element formatting utilities
- `src/hooks/use-mobile.tsx` - Mobile detection hook

### UI Components
- `src/components/ui/card.tsx` - Card component
- `src/components/ui/button.tsx` - Button component
- `src/components/ui/tabs.tsx` - Tabs component
- `src/components/ui/badge.tsx` - Badge component

### Integration Files
- `src/components/LogTrace.tsx` - Main LogTrace component
- `src/extension/LogTraceExtension.tsx` - Extension component
- `extension/contentScript.js` - Content script

### Configuration Files
- `package.json` - Dependencies and scripts
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite configuration

## Restoration Instructions

1. Extract the backup archive
2. Run `.\restore-terminal.ps1` in your new project directory
3. Verify terminal functionality

## Dependencies Required

See `package.json` for complete dependency list.

## Notes

- Console log capture is currently disabled
- Mobile responsiveness is implemented
- Event export creates JSON files with timestamps
- Debug responses are limited to last 50 entries
"@

Set-Content -Path "$BackupDir/BACKUP_MANIFEST.md" -Value $manifest

Write-Host "Creating zip archive..." -ForegroundColor Cyan

# Create zip archive using PowerShell
Compress-Archive -Path $BackupDir -DestinationPath $BackupZip -Force

Write-Host "Backup completed successfully!" -ForegroundColor Green
Write-Host "Backup Directory: $BackupDir" -ForegroundColor Yellow
Write-Host "Backup Archive: $BackupZip" -ForegroundColor Yellow
Write-Host ""
Write-Host "To restore this build:" -ForegroundColor Cyan
Write-Host "1. Extract $BackupZip" -ForegroundColor White
Write-Host "2. Copy files to your new project" -ForegroundColor White
Write-Host "3. Run 'npm install'" -ForegroundColor White
Write-Host "4. Run 'npm run dev'" -ForegroundColor White
Write-Host ""
Write-Host "Files to preserve for future restoration:" -ForegroundColor Cyan
Write-Host "- $BackupZip (complete backup)" -ForegroundColor White
Write-Host "- $BackupDir (extracted backup)" -ForegroundColor White
Write-Host "- docs/Terminal-Build-Documentation.md (documentation)" -ForegroundColor White 