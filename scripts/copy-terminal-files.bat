@echo off
echo Creating Terminal Build Backup...

set BACKUP_DIR=terminal-backup-manual
set OUTPUT_ZIP=C:\Users\tylar\trace-sight-debug-view\terminal-build-manual.zip

echo Creating directory structure...
mkdir "%BACKUP_DIR%\src\components\LogTrace" 2>nul
mkdir "%BACKUP_DIR%\src\extension\components" 2>nul
mkdir "%BACKUP_DIR%\src\shared\hooks" 2>nul
mkdir "%BACKUP_DIR%\src\shared\types" 2>nul
mkdir "%BACKUP_DIR%\src\utils" 2>nul
mkdir "%BACKUP_DIR%\src\hooks" 2>nul
mkdir "%BACKUP_DIR%\src\components\ui" 2>nul
mkdir "%BACKUP_DIR%\extension" 2>nul

echo Copying core terminal files...
copy "src\components\LogTrace\TabbedTerminal.tsx" "%BACKUP_DIR%\src\components\LogTrace\" >nul 2>&1
copy "src\extension\components\ExtensionTerminalWrapper.tsx" "%BACKUP_DIR%\src\extension\components\" >nul 2>&1
copy "src\shared\hooks\useDebugResponses.ts" "%BACKUP_DIR%\src\shared\hooks\" >nul 2>&1
copy "src\shared\hooks\useConsoleLogs.ts" "%BACKUP_DIR%\src\shared\hooks\" >nul 2>&1
copy "src\shared\types.ts" "%BACKUP_DIR%\src\shared\" >nul 2>&1

echo Copying supporting files...
copy "src\utils\sanitization.ts" "%BACKUP_DIR%\src\utils\" >nul 2>&1
copy "src\utils\elementDataFormatter.ts" "%BACKUP_DIR%\src\utils\" >nul 2>&1
copy "src\hooks\use-mobile.tsx" "%BACKUP_DIR%\src\hooks\" >nul 2>&1

echo Copying UI components...
copy "src\components\ui\card.tsx" "%BACKUP_DIR%\src\components\ui\" >nul 2>&1
copy "src\components\ui\button.tsx" "%BACKUP_DIR%\src\components\ui\" >nul 2>&1
copy "src\components\ui\tabs.tsx" "%BACKUP_DIR%\src\components\ui\" >nul 2>&1
copy "src\components\ui\badge.tsx" "%BACKUP_DIR%\src\components\ui\" >nul 2>&1

echo Copying integration files...
copy "src\components\LogTrace.tsx" "%BACKUP_DIR%\src\components\" >nul 2>&1
copy "src\extension\LogTraceExtension.tsx" "%BACKUP_DIR%\src\extension\" >nul 2>&1
copy "extension\contentScript.js" "%BACKUP_DIR%\extension\" >nul 2>&1

echo Copying configuration files...
copy "package.json" "%BACKUP_DIR%\" >nul 2>&1
copy "tailwind.config.ts" "%BACKUP_DIR%\" >nul 2>&1
copy "tsconfig.json" "%BACKUP_DIR%\" >nul 2>&1
copy "vite.config.ts" "%BACKUP_DIR%\" >nul 2>&1

echo Creating README...
echo LogTrace Terminal Build Backup > "%BACKUP_DIR%\README.md"
echo. >> "%BACKUP_DIR%\README.md"
echo Files included: >> "%BACKUP_DIR%\README.md"
echo - TabbedTerminal.tsx >> "%BACKUP_DIR%\README.md"
echo - ExtensionTerminalWrapper.tsx >> "%BACKUP_DIR%\README.md"
echo - useDebugResponses.ts >> "%BACKUP_DIR%\README.md"
echo - useConsoleLogs.ts >> "%BACKUP_DIR%\README.md"
echo - types.ts >> "%BACKUP_DIR%\README.md"
echo - All UI components and utilities >> "%BACKUP_DIR%\README.md"
echo. >> "%BACKUP_DIR%\README.md"
echo To restore: >> "%BACKUP_DIR%\README.md"
echo 1. Extract this backup >> "%BACKUP_DIR%\README.md"
echo 2. Copy files to your project >> "%BACKUP_DIR%\README.md"
echo 3. Run npm install >> "%BACKUP_DIR%\README.md"
echo 4. Run npm run dev >> "%BACKUP_DIR%\README.md"

echo Creating zip archive...
powershell -command "Compress-Archive -Path '%BACKUP_DIR%' -DestinationPath '%OUTPUT_ZIP%' -Force"

echo Backup completed!
echo Backup location: %OUTPUT_ZIP%
echo.
echo Files to preserve:
echo - %OUTPUT_ZIP%
echo - %BACKUP_DIR% 