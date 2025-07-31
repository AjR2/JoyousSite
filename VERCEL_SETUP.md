# 🚀 Vercel Deployment Setup

## Quick Deployment Steps

### 1. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Sign in with GitHub
- Click "New Project"
- Import: `AjR2/akeyreusite`

### 2. **Essential Environment Variables**

Copy these **EXACT** variable names into Vercel dashboard:

#### **🔐 Admin Authentication (REQUIRED)**
```
ADMIN_USERNAME = admin
ADMIN_PASSWORD = akeyreu2024
```

#### **🤖 AI API Keys (REQUIRED)**
```
OPENAI_API_KEY = [Use your OpenAI API key from multiAgent/.env]

ANTHROPIC_API_KEY = [Use your Anthropic API key from multiAgent/.env]

XAI_GROK_API_KEY = [Use your Grok API key from multiAgent/.env]
```

**📝 Note:** Copy the actual API keys from your `multiAgent/.env` file

#### **🌐 Site Configuration (Update after deployment)**
```
NEXT_PUBLIC_SITE_URL = https://your-project-name.vercel.app
NEXT_PUBLIC_API_BASE_URL = https://your-project-name.vercel.app/api
```

#### **🔒 Security (RECOMMENDED)**
```
NODE_ENV = production
REQUIRE_ORIGIN_VALIDATION = true
ENABLE_RATE_LIMIT = true
```

### 3. **Deployment Process**

1. **Import Repository:**
   - Select `AjR2/akeyreusite` from GitHub
   - Keep default settings
   - Click "Deploy"

2. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add each variable above
   - Set Environment: "Production, Preview, Development"

3. **Update Site URLs:**
   - After first deployment, get your Vercel URL
   - Update `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_BASE_URL`
   - Redeploy

### 4. **Testing Deployment**

After deployment, test:

#### **✅ Basic Functionality:**
- [ ] Site loads at your Vercel URL
- [ ] Admin login works: `/admin`
- [ ] Blog system functions
- [ ] All pages load correctly

#### **🤖 Nimbus AI Features:**
- [ ] Go to `/admin` → Login → "🤖 Nimbus AI" tab
- [ ] Dashboard shows all services as "Healthy" 🟢
- [ ] Chat Test tab works with real AI responses
- [ ] Agent management displays correctly

#### **🔍 Health Check:**
Visit: `https://your-project.vercel.app/api/nimbus/health?detailed=true`

Should show:
```json
{
  "status": "healthy",
  "services": {
    "healthy": 3,
    "unhealthy": 0
  }
}
```

### 5. **Common Issues & Solutions**

#### **🚨 "Unhealthy" AI Services:**
- Check API keys are exactly as shown above
- Verify no extra spaces or quotes
- Redeploy after adding variables

#### **🚨 Admin Login Fails:**
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
- Check for typos
- Try incognito/private browser window

#### **🚨 CORS Errors:**
- Update `NEXT_PUBLIC_SITE_URL` with your actual Vercel URL
- Make sure it starts with `https://`
- Redeploy after updating

### 6. **Custom Domain (Optional)**

1. **Add Domain in Vercel:**
   - Project Settings → Domains
   - Add your domain
   - Follow DNS instructions

2. **Update Environment Variables:**
   ```
   NEXT_PUBLIC_SITE_URL = https://yourdomain.com
   NEXT_PUBLIC_API_BASE_URL = https://yourdomain.com/api
   CORS_ORIGINS = https://yourdomain.com,https://www.yourdomain.com
   ```

### 7. **Success Checklist**

After deployment, you should have:
- [ ] ✅ Website live on Vercel
- [ ] ✅ Admin panel accessible
- [ ] ✅ All AI services healthy
- [ ] ✅ Chat functionality working
- [ ] ✅ Blog management working
- [ ] ✅ No console errors

---

**🎯 Your deployment URL will be:** `https://akeyreusite-[random].vercel.app`

**🔗 GitHub Repository:** `https://github.com/AjR2/akeyreusite`

**📞 Need Help?** Check the full `DEPLOYMENT.md` guide for detailed troubleshooting.
