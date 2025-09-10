#!/bin/bash

# Heritage H2GP STEAM Website - InfinityFree Deployment Script
echo "🚀 Preparing Heritage H2GP STEAM Website for InfinityFree..."
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

print_status "Creating InfinityFree deployment package..."

# Check if infinityfree-deploy directory exists
if [ ! -d "infinityfree-deploy" ]; then
    print_error "InfinityFree deployment directory not found!"
    print_status "Creating deployment package..."
    
    # Create directory
    mkdir -p infinityfree-deploy
    
    # Copy all necessary files
    cp *.html *.css *.js infinityfree-deploy/ 2>/dev/null
    cp -r assets infinityfree-deploy/ 2>/dev/null
    
    print_success "Deployment package created!"
else
    print_success "InfinityFree deployment package already exists!"
fi

# Create ZIP file for easy upload
print_status "Creating ZIP file for easy upload..."

if command -v zip &> /dev/null; then
    cd infinityfree-deploy
    zip -r ../heritage-h2gp-infinityfree.zip . -x "*.DS_Store" "*.git*"
    cd ..
    
    if [ -f "heritage-h2gp-infinityfree.zip" ]; then
        print_success "ZIP file created: heritage-h2gp-infinityfree.zip"
    else
        print_error "Failed to create ZIP file"
    fi
else
    print_warning "ZIP command not found. You'll need to manually compress the infinityfree-deploy folder."
fi

# Display file count and size
file_count=$(find infinityfree-deploy -type f | wc -l)
total_size=$(du -sh infinityfree-deploy | cut -f1)

echo ""
print_success "🎉 InfinityFree deployment package ready!"
echo ""
echo "📦 Package Details:"
echo "   📁 Files: $file_count files"
echo "   💾 Size: $total_size"
echo "   📂 Location: ./infinityfree-deploy/"
if [ -f "heritage-h2gp-infinityfree.zip" ]; then
    zip_size=$(du -sh heritage-h2gp-infinityfree.zip | cut -f1)
    echo "   🗜️  ZIP File: heritage-h2gp-infinityfree.zip ($zip_size)"
fi
echo ""
echo "🚀 Next Steps:"
echo "   1. Go to https://infinityfree.net and create an account"
echo "   2. Create a new website/subdomain"
echo "   3. Upload files using one of these methods:"
echo ""
echo "   📁 Method 1 - File Manager:"
echo "      • Log into InfinityFree control panel"
echo "      • Open File Manager"
echo "      • Navigate to htdocs or public_html"
echo "      • Upload all files from infinityfree-deploy/ folder"
echo ""
if [ -f "heritage-h2gp-infinityfree.zip" ]; then
echo "   🗜️  Method 2 - ZIP Upload:"
echo "      • Upload heritage-h2gp-infinityfree.zip"
echo "      • Extract it in the htdocs/public_html folder"
echo ""
fi
echo "   🌐 Method 3 - FTP Client:"
echo "      • Use FileZilla or similar FTP client"
echo "      • Upload infinityfree-deploy/ contents to htdocs/"
echo ""
echo "✅ What's Included:"
echo "   • Complete STEAM website (index.html)"
echo "   • Attendance system with 'Pagani' secret code"
echo "   • Photo gallery and upload features"
echo "   • All styling and JavaScript functionality"
echo "   • Assets folder with images and 3D models"
echo ""
echo "🔗 After Upload:"
echo "   • Visit your InfinityFree URL"
echo "   • Test all website functionality"
echo "   • Try attendance system with secret code 'Pagani'"
echo ""
echo "📚 Documentation:"
echo "   • Read infinityfree-deploy/README.md for detailed instructions"
echo "   • Check INFINITYFREE_DEPLOYMENT_GUIDE.md for troubleshooting"
echo ""
print_success "Your STEAM website is ready for InfinityFree hosting! 🎉"
