# 🚀 Deployment Guide - Joyous Website

This guide covers deploying the Joyous website with integrated multi-agent AI system.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier available)
- AI API keys (OpenAI, Anthropic, Grok)
- Domain name (optional)

## 🔧 Environment Variables Required

### **Essential Variables:**

```bash
# AI API Keys (at least one required)
OPENAI_API_KEY=sk-proj-your_openai_key
ANTHROPIC_API_KEY=sk-ant-api03-your_anthropic_key
XAI_GROK_API_KEY=xai-your_grok_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://your-domain.vercel.app/api
```

### **Optional Variables:**

```bash
# Email Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# Security
CORS_ORIGINS=https://your-domain.vercel.app
```

## 🚀 Deployment Steps

### **Step 1: GitHub Setup**

1. **Create GitHub Repository:**
   ```bash
   # If not already done
   git init
   git add .
   git commit -m "Initial commit with Nimbus AI integration"
   ```

2. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/akeyreu-website.git
   git branch -M main
   git push -u origin main
   ```

### **Step 2: Vercel Deployment**

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository

2. **Configure Environment Variables:**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add all required variables from the list above
   - Make sure to set the correct values for your domain

3. **Deploy:**
   - Vercel will automatically deploy
   - Your site will be available at `https://your-project.vercel.app`

### **Step 3: Domain Configuration (Optional)**

1. **Custom Domain:**
   - In Vercel dashboard, go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

2. **Update Environment Variables:**
   ```bash
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

## 🔐 Security Configuration

### **Production Security Checklist:**

- [ ] Change default admin credentials
- [ ] Use strong, unique passwords
- [ ] Set `NODE_ENV=production`
- [ ] Enable `REQUIRE_ORIGIN_VALIDATION=true`
- [ ] Configure proper CORS origins
- [ ] Use HTTPS URLs only
- [ ] Set secure session and JWT secrets
- [ ] Enable rate limiting
- [ ] Configure proper logging

### **API Key Security:**

- [ ] Store API keys in Vercel environment variables (never in code)
- [ ] Use different API keys for development and production
- [ ] Monitor API usage and set up billing alerts
- [ ] Rotate API keys regularly

## 🧪 Testing Deployment

### **After Deployment, Test:**

1. **Basic Functionality:**
   - [ ] Website loads correctly
   - [ ] Admin login works
   - [ ] Blog system functions
   - [ ] Contact forms work

2. **Nimbus AI Features:**
   - [ ] Admin panel shows AI services as "Healthy"
   - [ ] Chat functionality works
   - [ ] All AI agents respond correctly
   - [ ] Agent selection works properly

3. **Performance:**
   - [ ] Page load times are acceptable
   - [ ] AI responses are timely
   - [ ] No console errors

## 🔍 Troubleshooting

### **Common Issues:**

**AI Services Show "Unhealthy":**
- Check API keys are correctly set in Vercel
- Verify API key formats are correct
- Check API usage limits

**Admin Login Fails:**
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
- Check for typos in environment variables
- Clear browser cache

**CORS Errors:**
- Update `CORS_ORIGINS` with your actual domain
- Ensure `NEXT_PUBLIC_SITE_URL` matches your domain

**Build Failures:**
- Check all dependencies are in package.json
- Verify no syntax errors in code
- Check Vercel build logs

## 📊 Monitoring

### **Set Up Monitoring:**

1. **Vercel Analytics:**
   - Enable in Vercel dashboard
   - Monitor performance and usage

2. **AI Usage Monitoring:**
   - Monitor API usage in provider dashboards
   - Set up billing alerts
   - Track response times

3. **Error Tracking:**
   - Consider adding Sentry for error tracking
   - Monitor Vercel function logs

## 🔄 Updates and Maintenance

### **Regular Maintenance:**

- Monitor AI API usage and costs
- Update dependencies regularly
- Review and rotate API keys
- Monitor performance metrics
- Backup blog content regularly

### **Updating the Site:**

```bash
# Make changes locally
git add .
git commit -m "Description of changes"
git push origin main
# Vercel will automatically redeploy
```

## 📞 Support

For deployment issues:
1. Check Vercel build logs
2. Verify all environment variables
3. Test locally first with `npm run build`
4. Check API provider status pages

---

**Last Updated:** December 2024  
**Version:** 1.0.0 with Nimbus AI Integration
