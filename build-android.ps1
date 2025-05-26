# PowerShell script to build Android app with proper environment setup
# This script sets EAS_NO_VCS to bypass Git issues if needed

Write-Host "Setting up environment for EAS build..." -ForegroundColor Green

# Set environment variable to bypass VCS if needed
$env:EAS_NO_VCS = "1"

# Refresh PATH to include any newly installed tools
$env:PATH = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Running EAS build for Android..." -ForegroundColor Green

# Run the EAS build
eas build --platform android

Write-Host "Build command completed!" -ForegroundColor Green 