#!/bin/bash

# Heritage H2GP STEAM Website - Scripts Summary
echo "🎯 Heritage H2GP STEAM Website - Available Scripts"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 LOCAL DEVELOPMENT${NC}"
echo "   ./start-local.sh     - Start local development server"
echo "   start-local.bat      - Start local server (Windows)"
echo ""

echo -e "${GREEN}🚀 DEPLOYMENT${NC}"
echo "   ./deploy.sh          - Deploy to production (macOS/Linux)"
echo "   deploy.bat           - Deploy to production (Windows)"
echo ""

echo -e "${YELLOW}📖 DOCUMENTATION${NC}"
echo "   LOCAL_DEVELOPMENT.md - Complete local development guide"
echo "   DEPLOYMENT_GUIDE.md  - Complete deployment guide"
echo "   README.md           - Project overview and setup"
echo ""

echo -e "${BLUE}🔗 QUICK LINKS${NC}"
echo "   🌐 Live Website: https://heritage-h2gp-steam.netlify.app"
echo "   📦 GitHub Repo: https://github.com/LikithT/STEAM-club-website.git"
echo "   ⚙️  Netlify Dashboard: https://app.netlify.com"
echo ""

echo -e "${GREEN}⚡ QUICK COMMANDS${NC}"
echo "   Local Test:    ./start-local.sh"
echo "   Deploy:        ./deploy.sh"
echo "   Git Status:    git status"
echo "   View Logs:     git log --oneline"
echo ""

echo "💡 Need help? Check the documentation files above!"
echo ""
