# Create Terminal Build Backup Zip
# This script creates a zip file with all necessary terminal build files

$BackupDate = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupZip = "C:/Users/tylar/trace-sight-debug-view/terminal-build-$BackupDate.zip"
$TempDir = "temp-terminal-backup-$BackupDate"

Write-Host "Creating Terminal Build Backup..." -ForegroundColor Green
Write-Host "Output: $BackupZip" -ForegroundColor Yellow

# Create temporary directory
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

# Create directory structure
$directories = @(
    "$TempDir/src/components/LogTrace",
    "$TempDir/src/extension/components",
    "$TempDir/src/shared/hooks",
    "$TempDir/src/shared/types",
    "$TempDir/src/utils",
    "$TempDir/src/hooks",
    "$TempDir/src/components/ui",
    "$TempDir/extension"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

Write-Host "Copying files..." -ForegroundColor Cyan

# Core Terminal Files
$files = @{
    "src/components/LogTrace/TabbedTerminal.tsx" = "$TempDir/src/components/LogTrace/"
    "src/extension/components/ExtensionTerminalWrapper.tsx" = "$TempDir/src/extension/components/"
    "src/shared/hooks/useDebugResponses.ts" = "$TempDir/src/shared/hooks/"
    "src/shared/hooks/useConsoleLogs.ts" = "$TempDir/src/shared/hooks/"
    "src/shared/types.ts" = "$TempDir/src/shared/"
    "src/utils/sanitization.ts" = "$TempDir/src/utils/"
    "src/utils/elementDataFormatter.ts" = "$TempDir/src/utils/"
    "src/hooks/use-mobile.tsx" = "$TempDir/src/hooks/"
    "src/components/ui/card.tsx" = "$TempDir/src/components/ui/"
    "src/components/ui/button.tsx" = "$TempDir/src/components/ui/"
    "src/components/ui/tabs.tsx" = "$TempDir/src/components/ui/"
    "src/components/ui/badge.tsx" = "$TempDir/src/components/ui/"
    "src/components/LogTrace.tsx" = "$TempDir/src/components/"
    "src/extension/LogTraceExtension.tsx" = "$TempDir/src/extension/"
    "extension/contentScript.js" = "$TempDir/extension/"
    "package.json" = "$TempDir/"
    "tailwind.config.ts" = "$TempDir/"
    "tsconfig.json" = "$TempDir/"
    "vite.config.ts" = "$TempDir/"
}

$copiedCount = 0
$missingCount = 0

foreach ($file in $files.GetEnumerator()) {
    if (Test-Path $file.Key) {
        Copy-Item $file.Key $file.Value -Force
        Write-Host "  ✓ $($file.Key)" -ForegroundColor Green
        $copiedCount++
    } else {
        Write-Host "  ✗ $($file.Key) - Not found" -ForegroundColor Red
        $missingCount++
    }
}

# Create simple documentation file
$docContent = "LogTrace Terminal Build Backup`n"
$docContent += "Backup Date: $BackupDate`n"
$docContent += "Files Copied: $copiedCount`n"
$docContent += "Files Missing: $missingCount`n`n"
$docContent += "Restoration Instructions:`n"
$docContent += "1. Extract this zip file`n"
$docContent += "2. Copy files to your new project maintaining directory structure`n"
$docContent += "3. Run 'npm install'`n"
$docContent += "4. Run 'npm run dev'`n"
$docContent += "5. Test terminal functionality`n"

Set-Content -Path "$TempDir/README.md" -Value $docContent

Write-Host "Creating zip archive..." -ForegroundColor Cyan

# Create zip archive
Compress-Archive -Path $TempDir -DestinationPath $BackupZip -Force

# Clean up temporary directory
Remove-Item -Path $TempDir -Recurse -Force

Write-Host "Backup completed successfully!" -ForegroundColor Green
Write-Host "Backup Archive: $BackupZip" -ForegroundColor Yellow
Write-Host "Files copied: $copiedCount" -ForegroundColor Green
Write-Host "Files missing: $missingCount" -ForegroundColor Red

if ($missingCount -gt 0) {
    Write-Host "Warning: Some files were not found. Check the list above." -ForegroundColor Yellow
} 