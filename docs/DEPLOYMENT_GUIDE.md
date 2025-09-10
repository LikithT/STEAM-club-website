# Deployment Guide - Heritage H2GP STEAM Website

## Quick Deploy (Recommended)

### For macOS/Linux:
```bash
./deploy.sh
```

### For Windows:
```cmd
deploy.bat
```

The script will automatically:
1. ✅ Check for uncommitted changes
2. ✅ Commit changes (with your approval)
3. ✅ Push to GitHub
4. ✅ Trigger Netlify deployment
5. ✅ Provide status updates and links

---

## Manual Deployment Steps

### Step 1: Commit Your Changes
```bash
# Check what files have changed
git status

# Add all changes
git add .

# Commit with a descriptive message
git commit -m "Update website with new features"
```

### Step 2: Push to GitHub
```bash
# Push to main branch
git push origin main
```

### Step 3: Netlify Auto-Deploy
Netlify will automatically detect the GitHub push and deploy your site within 2-3 minutes.

---

## Current Deployment Setup

### 🔗 Live Website
**Production URL**: https://heritage-h2gp-steam.netlify.app

### 📦 GitHub Repository
**Repository**: https://github.com/LikithT/STEAM-club-website.git
- **Branch**: `main`
- **Auto-deploy**: Enabled via Netlify GitHub integration

### ⚙️ Netlify Configuration
- **Build Command**: None (static site)
- **Publish Directory**: `/` (root directory)
- **Auto-deploy**: Enabled from `main` branch

---

## Deployment Features

### ✅ What Gets Deployed
- **Main Website**: Complete STEAM website with all features
- **Attendance System**: Student check-in with "Pagani" admin access
- **Photo Gallery**: Drag & drop photo management system
- **3D Model Viewer**: Interactive STL model display
- **Responsive Design**: Mobile and desktop optimized
- **Cloud Functions**: AWS S3 integration for file storage

### 🚀 Automatic Features
- **GitHub Integration**: Push to deploy automatically
- **Build Optimization**: Netlify optimizes assets automatically
- **CDN Distribution**: Global content delivery network
- **HTTPS**: Automatic SSL certificate
- **Custom Domain**: Ready for custom domain setup

---

## Deployment Checklist

### Before Deploying
- [ ] Test website locally using `./start-local.sh`
- [ ] Verify all features work (attendance, photos, 3D models)
- [ ] Check responsive design on different screen sizes
- [ ] Test attendance system with "Pagani" secret code
- [ ] Ensure all images and assets load properly

### During Deployment
- [ ] Run deployment script (`./deploy.sh` or `deploy.bat`)
- [ ] Confirm changes to commit when prompted
- [ ] Wait for GitHub push to complete
- [ ] Monitor Netlify deployment status

### After Deployment
- [ ] Visit live website: https://heritage-h2gp-steam.netlify.app
- [ ] Test all functionality on live site
- [ ] Check attendance system works in production
- [ ] Verify 3D models load correctly
- [ ] Test on mobile devices
- [ ] Clear browser cache if needed

---

## Troubleshooting Deployment Issues

### Git Issues

#### "Not a git repository"
```bash
git init
git remote add origin https://github.com/LikithT/STEAM-club-website.git
```

#### "Permission denied"
- Check GitHub authentication
- Use personal access token if needed
- Verify repository permissions

#### "Push rejected"
```bash
git pull origin main --rebase
git push origin main
```

### Netlify Issues

#### Deployment Failed
1. Check Netlify dashboard for error logs
2. Verify all files are committed and pushed
3. Check for any build errors in Netlify logs

#### Site Not Updating
1. Clear browser cache (Ctrl+F5 / Cmd+Shift+R)
2. Check Netlify deployment status
3. Wait 2-3 minutes for CDN propagation

#### Functions Not Working
1. Verify environment variables are set in Netlify
2. Check function logs in Netlify dashboard
3. Ensure AWS credentials are properly configured

---

## Advanced Deployment Options

### Manual Netlify Deploy
If you have Netlify CLI installed:
```bash
# Install Netlify CLI (one time)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site
netlify link

# Deploy manually
netlify deploy --prod
```

### Environment Variables
Set these in Netlify dashboard for full functionality:
```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=heritage-h2gp-stl-models
```

### Custom Domain Setup
1. Go to Netlify dashboard
2. Navigate to Domain settings
3. Add custom domain
4. Update DNS records as instructed

---

## Monitoring and Maintenance

### Regular Checks
- **Weekly**: Verify website is accessible and functional
- **Monthly**: Check for any broken links or images
- **Quarterly**: Review and update content as needed

### Performance Monitoring
- Use Netlify Analytics for visitor insights
- Monitor Core Web Vitals in Google Search Console
- Check mobile performance regularly

### Backup Strategy
- **GitHub**: Automatic version control and backup
- **Netlify**: Automatic deployment history
- **Local**: Keep local development environment updated

---

## Quick Reference Commands

### Local Development
```bash
./start-local.sh          # Start local server
```

### Deployment
```bash
./deploy.sh               # Full deployment process
git add .                 # Stage all changes
git commit -m "message"   # Commit changes
git push origin main      # Push to GitHub
```

### Troubleshooting
```bash
git status               # Check repository status
git log --oneline        # View recent commits
netlify status           # Check Netlify connection
```

---

## Support and Resources

### Documentation
- **Netlify Docs**: https://docs.netlify.com/
- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/

### Getting Help
- Check Netlify deployment logs for specific errors
- Review GitHub Actions (if configured) for build issues
- Use browser developer tools to debug frontend issues

### Contact Information
For project-specific issues, refer to the development team or project maintainer.
