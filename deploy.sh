#!/bin/bash

# Heritage H2GP STEAM Website - Deployment Script
echo "🚀 Deploying Heritage H2GP STEAM Website..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_status "Checking Git repository status..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a Git repository. Please initialize Git first."
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes."
    echo ""
    git status --porcelain
    echo ""
    read -p "Do you want to commit these changes? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Adding all changes to Git..."
        git add .
        
        echo ""
        read -p "Enter commit message (or press Enter for default): " commit_msg
        
        if [ -z "$commit_msg" ]; then
            commit_msg="Update Heritage H2GP website - $(date '+%Y-%m-%d %H:%M:%S')"
        fi
        
        print_status "Committing changes..."
        git commit -m "$commit_msg"
        
        if [ $? -eq 0 ]; then
            print_success "Changes committed successfully!"
        else
            print_error "Failed to commit changes."
            exit 1
        fi
    else
        print_warning "Deployment cancelled. Please commit your changes first."
        exit 1
    fi
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    print_error "No remote 'origin' found. Please add a remote repository first."
    echo "Example: git remote add origin https://github.com/yourusername/your-repo.git"
    exit 1
fi

print_status "Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    print_success "Successfully pushed to GitHub!"
else
    print_error "Failed to push to GitHub. Please check your connection and permissions."
    exit 1
fi

# Check if Netlify CLI is available
if command -v netlify &> /dev/null; then
    print_status "Netlify CLI found. Checking deployment status..."
    
    # Try to get site info
    if netlify status > /dev/null 2>&1; then
        print_status "Site is linked. Triggering Netlify deployment..."
        netlify deploy --prod
        
        if [ $? -eq 0 ]; then
            print_success "Netlify deployment completed!"
        else
            print_warning "Netlify deployment may have issues. Check Netlify dashboard."
        fi
    else
        print_warning "Directory not linked to a Netlify site."
        print_status "This is normal - your site deploys automatically via GitHub integration."
        print_status "No manual deployment needed!"
    fi
else
    print_status "Netlify CLI not found (this is fine)."
    print_status "Your site deploys automatically via GitHub integration."
fi

echo ""
print_success "🎉 Deployment process completed!"
echo ""
echo "📋 What happens next:"
echo "   1. ✅ Code pushed to GitHub successfully"
echo "   2. 🔄 Netlify will automatically detect the changes"
echo "   3. 🏗️  Netlify will build and deploy your site"
echo "   4. 🌐 Your site will be live in a few minutes"
echo ""
echo "🔗 Links:"
echo "   📦 GitHub Repository: $(git remote get-url origin)"
echo "   🌐 Live Website: https://heritage-h2gp-steam.netlify.app"
echo "   ⚙️  Netlify Dashboard: https://app.netlify.com"
echo ""
echo "💡 Tips:"
echo "   • Check Netlify dashboard for deployment status"
echo "   • It may take 2-3 minutes for changes to appear live"
echo "   • Clear browser cache if you don't see updates immediately"
echo ""
