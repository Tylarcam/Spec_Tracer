#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Create direct distribution package for SpecTrace Chrome Extension
    
.DESCRIPTION
    This script packages the extension for direct distribution, allowing users to install
    it without going through the Chrome Web Store review process. This is useful for
    developer tools that need expedited distribution.
    
.PARAMETER SourcePath
    Path to the extension source directory (default: ../extension)
    
.PARAMETER OutputPath
    Path for the output package (default: ./dist)
    
.PARAMETER Version
    Version number for the package (default: 1.2.0)
    
.EXAMPLE
    .\create-direct-distribution.ps1
    
.EXAMPLE
    .\create-direct-distribution.ps1 -SourcePath "C:\path\to\extension" -OutputPath "C:\output" -Version "1.3.0"
#>

param(
    [string]$SourcePath = "../extension",
    [string]$OutputPath = "./dist",
    [string]$Version = "1.2.0"
)

# Ensure we're in the right directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "🚀 Creating Direct Distribution Package for SpecTrace v$Version" -ForegroundColor Green
Write-Host ""

# Validate source path
if (-not (Test-Path $SourcePath)) {
    Write-Error "Source path not found: $SourcePath"
    exit 1
}

# Create output directory
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    Write-Host "✅ Created output directory: $OutputPath"
}

# Create timestamp
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$PackageName = "spectrace-extension-v$Version-direct-$Timestamp"

# Create package directory
$PackageDir = Join-Path $OutputPath $PackageName
if (Test-Path $PackageDir) {
    Remove-Item $PackageDir -Recurse -Force
}
New-Item -ItemType Directory -Path $PackageDir -Force | Out-Null

Write-Host "📦 Creating package: $PackageName"
Write-Host ""

# Copy extension files
Write-Host "📋 Copying extension files..." -ForegroundColor Yellow
$FilesToCopy = @(
    "manifest.json",
    "background.js",
    "contentScript.js",
    "contentScript.css",
    "popup.html",
    "popup.js",
    "favicon.ico",
    "placeholder.svg",
    "robots.txt"
)

foreach ($File in $FilesToCopy) {
    $SourceFile = Join-Path $SourcePath $File
    if (Test-Path $SourceFile) {
        Copy-Item $SourceFile $PackageDir
        Write-Host "  ✅ $File"
    } else {
        Write-Host "  ⚠️  $File (not found)" -ForegroundColor Yellow
    }
}

# Copy icons directory
$IconsSource = Join-Path $SourcePath "icons"
if (Test-Path $IconsSource) {
    $IconsDest = Join-Path $PackageDir "icons"
    Copy-Item $IconsSource $IconsDest -Recurse
    Write-Host "  ✅ icons/ (directory)"
} else {
    Write-Host "  ⚠️  icons/ (not found)" -ForegroundColor Yellow
}

Write-Host ""

# Create installation instructions
Write-Host "📝 Creating installation instructions..." -ForegroundColor Yellow

$InstallInstructions = @"
# SpecTrace Extension - Direct Installation

## Quick Install (Recommended)

1. **Download this package** and extract it to a folder on your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the extracted folder
5. **Start debugging!** Click the SpecTrace icon in your toolbar

## What is SpecTrace?

SpecTrace is a privacy-first DOM debugging tool that provides visual feedback for web development and testing.

### Key Features:
- 🔍 **Visual Element Inspection**: Hover over any element to see debugging info
- 🛡️ **Privacy-First**: No data collection, storage, or transmission
- ⚡ **Client-Side Only**: All processing happens locally in your browser
- 🎯 **Developer-Friendly**: Perfect for web developers and QA testers

### Privacy & Security:
- ✅ No data is ever stored or transmitted
- ✅ No background monitoring or tracking
- ✅ All processing occurs locally in your browser
- ✅ Immediate cleanup when debugging ends
- ✅ User must explicitly activate debugging mode

### Why Direct Distribution?

This extension is distributed directly to avoid delays in the Chrome Web Store review process. The host permissions are essential for DOM inspection during active debugging sessions only.

### Permissions Explained:
- **Host Permissions**: Required for DOM inspection during debugging
- **Active Tab**: Only accesses the current tab when debugging is active
- **Scripting**: Injects debugging tools only when user activates them

### Support:
- GitHub: [Your GitHub Repo]
- Email: [Your Email]
- Documentation: [Your Docs URL]

### Version: $Version
### Build Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

---
*This extension is distributed directly for faster access to developer tools. All privacy and security measures remain the same as Chrome Web Store versions.*
"@

$InstallInstructions | Out-File -FilePath (Join-Path $PackageDir "INSTALL.md") -Encoding UTF8
Write-Host "  ✅ INSTALL.md"

# Create privacy policy
$PrivacyPolicy = @"
# SpecTrace Privacy Policy

## Data Collection: NONE

SpecTrace does not collect, store, or transmit any personal information, browsing history, or page content.

### What We Don't Do:
- ❌ Collect personal information
- ❌ Store browsing history
- ❌ Transmit page content
- ❌ Use analytics or tracking
- ❌ Monitor user activity
- ❌ Store debugging sessions

### What We Do:
- ✅ Process all data locally in your browser
- ✅ Provide visual debugging feedback
- ✅ Clean up all data when debugging ends
- ✅ Respect your privacy at all times

## Data Processing: Client-Side Only

All analysis and debugging features work entirely within your browser:
- No external API calls for debugging features
- No data leaves your device
- No cloud processing or storage
- No network requests for debugging data

## Data Storage: None

SpecTrace does not store any data:
- No persistent storage of debugging sessions
- No cached page content
- No user preferences beyond basic settings
- All data is cleared when debugging ends

## Permissions Usage

### Host Permissions (`<all_urls>`)
- **Purpose**: DOM inspection for debugging and element analysis
- **When Used**: Only during active debugging sessions
- **User Control**: Must explicitly activate debugging mode
- **Scope**: Limited to active tab when debugging is active

### Active Tab Permission
- **Purpose**: Access current tab for debugging
- **When Used**: Only when user clicks "Start Debugging"
- **Scope**: Current tab only, no background monitoring

## Your Rights

You have complete control over:
- When debugging is active
- What permissions are granted
- When to stop debugging sessions
- Complete removal of the extension

## Contact

For privacy questions or concerns:
- Email: [Your Email]
- GitHub: [Your GitHub Repo]

## Version: $Version
## Last Updated: $(Get-Date -Format "yyyy-MM-dd")
"@

$PrivacyPolicy | Out-File -FilePath (Join-Path $PackageDir "PRIVACY.md") -Encoding UTF8
Write-Host "  ✅ PRIVACY.md"

# Create README
$README = @"
# SpecTrace Extension v$Version

A privacy-first DOM debugging tool for web developers and QA testers.

## Quick Start

1. Extract this package to a folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable Developer Mode
4. Click "Load unpacked" and select the folder
5. Start debugging!

## Features

- 🔍 Visual element inspection and highlighting
- 🛡️ Privacy-first design with zero data collection
- ⚡ Client-side processing only
- 🎯 Perfect for web development and testing

## Privacy

- No data collection or transmission
- All processing happens locally
- No background monitoring
- Immediate data cleanup

## Support

See INSTALL.md for detailed installation instructions.
See PRIVACY.md for complete privacy policy.

---
*Direct distribution for faster access to developer tools.*
"@

$README | Out-File -FilePath (Join-Path $PackageDir "README.md") -Encoding UTF8
Write-Host "  ✅ README.md"

Write-Host ""

# Create ZIP package
Write-Host "🗜️  Creating ZIP package..." -ForegroundColor Yellow
$ZipPath = Join-Path $OutputPath "$PackageName.zip"

# Use .NET compression for better compatibility
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($PackageDir, $ZipPath)

Write-Host "  ✅ $PackageName.zip"

# Create checksum
Write-Host "🔍 Creating checksum..." -ForegroundColor Yellow
$Hash = Get-FileHash -Path $ZipPath -Algorithm SHA256
$Hash.Hash | Out-File -FilePath "$ZipPath.sha256"
Write-Host "  ✅ $PackageName.zip.sha256"

Write-Host ""
Write-Host "🎉 Package created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Package Location: $ZipPath" -ForegroundColor Cyan
Write-Host "📊 Package Size: $((Get-Item $ZipPath).Length / 1MB) MB" -ForegroundColor Cyan
Write-Host "🔐 SHA256: $($Hash.Hash)" -ForegroundColor Cyan
Write-Host ""

# Create distribution summary
$Summary = @"
# SpecTrace Direct Distribution Summary

## Package Details
- **Name**: $PackageName
- **Version**: $Version
- **Build Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- **Size**: $((Get-Item $ZipPath).Length / 1KB) KB
- **SHA256**: $($Hash.Hash)

## Files Included
- Extension files (manifest.json, background.js, etc.)
- Icons directory
- Installation instructions (INSTALL.md)
- Privacy policy (PRIVACY.md)
- README with quick start guide

## Distribution Strategy
1. **Direct Distribution**: Package for immediate use
2. **Chrome Web Store**: Continue submission process
3. **GitHub Releases**: Alternative distribution channel
4. **Website Downloads**: Host on your website

## Next Steps
1. Test the package installation
2. Upload to your website
3. Create GitHub release
4. Share with early users for feedback

## Installation Instructions for Users
1. Download and extract the ZIP file
2. Open Chrome and go to chrome://extensions/
3. Enable Developer Mode
4. Click "Load unpacked" and select the extracted folder
5. Start debugging!

---
Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$Summary | Out-File -FilePath (Join-Path $OutputPath "DISTRIBUTION_SUMMARY.md") -Encoding UTF8
Write-Host "📋 Distribution summary created: DISTRIBUTION_SUMMARY.md" -ForegroundColor Cyan

Write-Host ""
Write-Host "🚀 Ready for distribution!" -ForegroundColor Green
Write-Host "Users can now install the extension directly without Chrome Web Store approval."
Write-Host "" 