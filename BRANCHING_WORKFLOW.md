# Akeyreu Website - Branching Workflow

## 🌟 Branch Structure

### **Main Branch** (`main`)
- **Purpose**: Production-ready code
- **Deployment**: Automatically deploys to `https://www.akeyreu.com`
- **Protection**: Only merge tested and approved changes

### **Development Branch** (`development`)
- **Purpose**: Testing branding changes and new features
- **Deployment**: Automatically deploys to Vercel preview URL
- **Usage**: Safe environment for experimentation

## 🚀 Workflow Steps

### **1. Making Changes**
```bash
# Switch to development branch
git checkout development

# Make your changes (branding, features, etc.)
# Edit files as needed

# Stage and commit changes
git add .
git commit -m "Update branding: new logo and color scheme"

# Push to development branch
git push origin development
```

### **2. Testing Changes**
- Vercel will automatically deploy your development branch
- Test your changes on the preview URL
- Verify everything works as expected

### **3. Merging to Production**
```bash
# Switch to main branch
git checkout main

# Merge development into main
git merge development

# Push to production
git push origin main
```

## 🔧 Quick Commands

### **Switch Branches**
```bash
git checkout main          # Switch to production
git checkout development   # Switch to development
```

### **Check Current Branch**
```bash
git branch                 # Shows current branch with *
```

### **Create Feature Branch** (for specific features)
```bash
git checkout -b feature/new-branding
git push -u origin feature/new-branding
```

## 🌐 Deployment URLs

- **Production**: `https://www.akeyreu.com` (main branch)
- **Development**: Vercel preview URL (development branch)
- **Feature branches**: Individual preview URLs

## 📋 Best Practices

1. **Always test in development first**
2. **Use descriptive commit messages**
3. **Keep changes focused and small**
4. **Test thoroughly before merging to main**
5. **Use pull requests for code review** (optional but recommended)

## 🆘 Emergency Rollback

If something breaks in production:
```bash
git checkout main
git revert HEAD           # Reverts last commit
git push origin main      # Deploys the rollback
```

## 📝 Current Status

- ✅ **main**: Production branch (GPT-5 nano enabled)
- ✅ **development**: Testing branch (ready for branding changes)
- 🎯 **Next**: Make branding changes in development branch
