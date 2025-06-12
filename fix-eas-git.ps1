# PowerShell script to permanently fix EAS Git detection issues
# This script ensures EAS CLI can always find Git

Write-Host "🔧 Fixing EAS Git detection permanently..." -ForegroundColor Green

# 1. Set Git path directly for EAS CLI
$gitPath = "C:\Program Files\Git\bin"
$gitCmd = "C:\Program Files\Git\bin\git.exe"

# 2. Set permanent system environment variables (requires admin, but we'll try user level)
Write-Host "Setting permanent environment variables..." -ForegroundColor Cyan

# Set GIT_EXEC_PATH for EAS CLI
[Environment]::SetEnvironmentVariable("GIT_EXEC_PATH", $gitPath, "User")

# Ensure Git is in PATH
$currentUserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentUserPath -notlike "*$gitPath*") {
    Write-Host "Adding Git to permanent PATH..." -ForegroundColor Cyan
    $newPath = $currentUserPath + ";" + $gitPath
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
}

# 3. Set current session environment
$env:GIT_EXEC_PATH = $gitPath
$env:PATH = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 4. Verify Git is accessible
Write-Host "Testing Git accessibility..." -ForegroundColor Cyan
try {
    $gitVersion = & $gitCmd --version 2>$null
    if ($gitVersion) {
        Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Git not accessible at expected path" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error accessing Git: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test Git repository detection
Write-Host "Testing Git repository detection..." -ForegroundColor Cyan
try {
    $gitRoot = & $gitCmd rev-parse --show-toplevel 2>$null
    if ($gitRoot) {
        Write-Host "✅ Git repository detected: $gitRoot" -ForegroundColor Green
    } else {
        Write-Host "❌ Git repository not detected" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error detecting Git repository: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Git detection fix complete!" -ForegroundColor Green
Write-Host "Environment variables set:" -ForegroundColor White
Write-Host "  GIT_EXEC_PATH: $env:GIT_EXEC_PATH" -ForegroundColor Gray
Write-Host "  Git in PATH: $gitPath" -ForegroundColor Gray

Write-Host "`n💡 Restart your terminal/IDE for changes to take full effect." -ForegroundColor Yellow
Write-Host "   The EAS Git warning should disappear in new sessions." -ForegroundColor Yellow

# 6. Test EAS CLI Git detection (optional)
Write-Host "`n🧪 Testing EAS CLI Git detection..." -ForegroundColor Cyan
Write-Host "Running: eas build:version:get --platform android --profile preview" -ForegroundColor Gray 