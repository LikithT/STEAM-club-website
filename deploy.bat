@echo off
echo 🚀 Deploying Heritage H2GP STEAM Website...
echo.

REM Check if git is available
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed. Please install Git first.
    pause
    exit /b 1
)

echo [INFO] Checking Git repository status...

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Not in a Git repository. Please initialize Git first.
    pause
    exit /b 1
)

REM Check for uncommitted changes
git diff-index --quiet HEAD -- >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] You have uncommitted changes.
    echo.
    git status --porcelain
    echo.
    set /p commit_choice="Do you want to commit these changes? (y/n): "
    
    if /i "%commit_choice%"=="y" (
        echo [INFO] Adding all changes to Git...
        git add .
        
        echo.
        set /p commit_msg="Enter commit message (or press Enter for default): "
        
        if "%commit_msg%"=="" (
            for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
            set commit_msg=Update Heritage H2GP website - !datetime:~0,4!-!datetime:~4,2!-!datetime:~6,2! !datetime:~8,2!:!datetime:~10,2!:!datetime:~12,2!
        )
        
        echo [INFO] Committing changes...
        git commit -m "%commit_msg%"
        
        if %errorlevel% equ 0 (
            echo [SUCCESS] Changes committed successfully!
        ) else (
            echo [ERROR] Failed to commit changes.
            pause
            exit /b 1
        )
    ) else (
        echo [WARNING] Deployment cancelled. Please commit your changes first.
        pause
        exit /b 1
    )
)

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] No remote 'origin' found. Please add a remote repository first.
    echo Example: git remote add origin https://github.com/yourusername/your-repo.git
    pause
    exit /b 1
)

echo [INFO] Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo [SUCCESS] Successfully pushed to GitHub!
) else (
    echo [ERROR] Failed to push to GitHub. Please check your connection and permissions.
    pause
    exit /b 1
)

REM Check if Netlify CLI is available
netlify --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Netlify CLI found. Checking deployment status...
    
    netlify status >nul 2>&1
    if %errorlevel% equ 0 (
        echo [INFO] Triggering Netlify deployment...
        netlify deploy --prod
        
        if %errorlevel% equ 0 (
            echo [SUCCESS] Netlify deployment completed!
        ) else (
            echo [WARNING] Netlify deployment may have issues. Check Netlify dashboard.
        )
    ) else (
        echo [WARNING] Not linked to a Netlify site. Auto-deployment via GitHub should still work.
    )
) else (
    echo [WARNING] Netlify CLI not found. Deployment will happen automatically via GitHub integration.
)

echo.
echo [SUCCESS] 🎉 Deployment process completed!
echo.
echo 📋 What happens next:
echo    1. ✅ Code pushed to GitHub successfully
echo    2. 🔄 Netlify will automatically detect the changes
echo    3. 🏗️  Netlify will build and deploy your site
echo    4. 🌐 Your site will be live in a few minutes
echo.
echo 🔗 Links:
for /f "tokens=*" %%i in ('git remote get-url origin') do echo    📦 GitHub Repository: %%i
echo    🌐 Live Website: https://heritage-h2gp-steam.netlify.app
echo    ⚙️  Netlify Dashboard: https://app.netlify.com
echo.
echo 💡 Tips:
echo    • Check Netlify dashboard for deployment status
echo    • It may take 2-3 minutes for changes to appear live
echo    • Clear browser cache if you don't see updates immediately
echo.
pause
