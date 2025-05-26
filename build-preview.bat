@echo off
echo 🔧 Setting up environment for EAS build...

REM Set environment variables for this session
set EAS_PROJECT_ROOT=%CD%
set EAS_NO_VCS=1
set PATH=%PATH%;C:\Program Files\Git\bin

echo ✅ Environment variables set:
echo   EAS_PROJECT_ROOT=%EAS_PROJECT_ROOT%
echo   EAS_NO_VCS=%EAS_NO_VCS%

echo.
echo 🚀 Running EAS build...
eas build --platform android --profile preview

echo.
echo ✅ Build command completed!
pause 