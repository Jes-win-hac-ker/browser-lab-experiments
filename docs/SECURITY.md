# 🔐 Secure Deployment Guide

## 🎯 Overview

This guide ensures your Chemistry Lab is deployed securely with proper API key management using GitHub Secrets instead of environment files.

## 🔑 API Key Security Strategy

### ✅ **Secure Method (Production)**
- **GitHub Secrets**: API keys stored securely in repository settings
- **Environment Injection**: Keys injected at build time
- **No Source Code Exposure**: Keys never appear in code or logs

### ❌ **Insecure Methods (Avoid)**
- Hardcoding API keys in source code
- Committing .env files to repository
- Using example/demo API keys in production

## 🚀 Setup Instructions

### Step 1: Secure Your API Key

1. **Get Gemini API Key**
   ```
   Visit: https://aistudio.google.com/app/apikey
   Create new API key
   Copy the key (starts with 'AIzaSy...')
   ```

2. **Add to GitHub Secrets**
   ```
   Go to: Your Repository > Settings > Secrets and variables > Actions
   Click: "New repository secret"
   Name: VITE_GEMINI_API_KEY
   Value: [Paste your actual API key]
   Click: "Add secret"
   ```

### Step 2: Configure Local Development

1. **Create Local Environment**
   ```bash
   # Create .env file for development only
   echo "VITE_GEMINI_API_KEY=your_development_api_key_here" > .env
   ```

2. **Add Your Development Key**
   ```bash
   # Get your API key from: https://aistudio.google.com/app/apikey
   # Replace the placeholder with your actual key
   ```

3. **Verify Setup**
   ```bash
   npm run dev
   # Check console for "🔑 API Key Status: ✅ Found"
   ```

### Step 3: Deploy to Production

1. **Push to Main Branch**
   ```bash
   git add .
   git commit -m "🔐 Secure API key configuration"
   git push origin main
   ```

2. **Monitor Deployment**
   ```
   Visit: Your Repository > Actions
   Watch: "🚀 Deploy Chemistry Lab to GitHub Pages" workflow
   ```

3. **Verify Live Site**
   ```
   Visit: https://jes-win-hac-ker.github.io/browser-lab-experiments/
   Test: AI chatbot functionality
   ```

## 🔍 Security Verification

### ✅ **Check These Points**

1. **No API Keys in Source Code**
   ```bash
   grep -r "AIzaSy" src/
   # Should return no results
   ```

2. **Secrets Properly Configured**
   ```
   Repository > Settings > Secrets and variables > Actions
   Verify: VITE_GEMINI_API_KEY is listed
   ```

3. **Build Logs Don't Expose Keys**
   ```
   Actions > Latest workflow run > Build job
   Look for: "🔑 API Key Status: Configured" (not the actual key)
   ```

4. **Production Site Uses Secrets**
   ```
   Open: Live site > Browser DevTools > Console
   Should see: "🔑 Environment: Production (GitHub)"
   Should NOT see: Actual API key values
   ```

## 🛠️ Troubleshooting

### Problem: AI Features Not Working in Production

**Symptoms:**
- Chatbot shows "AI Offline" badge
- Responses use fallback mode only

**Solutions:**
1. **Check GitHub Secret**
   ```
   Repository > Settings > Secrets > VITE_GEMINI_API_KEY
   Ensure secret exists and value is correct
   ```

2. **Verify Workflow Environment**
   ```
   Actions > Latest run > Build job
   Look for: "🔑 API Key Status: Configured"
   ```

3. **Re-deploy**
   ```bash
   git commit --allow-empty -m "🔄 Trigger re-deployment"
   git push origin main
   ```

### Problem: API Key Exposed in Logs

**Immediate Action:**
1. **Revoke Compromised Key**
   ```
   Visit: https://aistudio.google.com/app/apikey
   Delete the exposed key immediately
   ```

2. **Generate New Key**
   ```
   Create new API key
   Update GitHub Secret with new key
   ```

3. **Fix Code (if needed)**
   ```bash
   # Remove any console.log statements that might expose keys
   grep -r "GEMINI_API_KEY" src/
   ```

## 📊 Security Best Practices

### ✅ **Do This**
- Use GitHub Secrets for all production API keys
- Create local .env files for development only
- Add comprehensive .env patterns to .gitignore
- Regularly rotate API keys
- Monitor usage and billing
- Use environment-specific configurations
- Remove any .env.example files that might contain real keys

### ❌ **Never Do This**
- Commit .env files to repository
- Include .env.example files with real keys
- Hardcode API keys in source code
- Share API keys in chat/email
- Use production keys for development
- Log API keys to console in production
- Include API keys in documentation or comments

## 🔐 Advanced Security (Optional)

### API Key Restrictions
```
Google Cloud Console > APIs & Services > Credentials
Set HTTP referrer restrictions:
- https://jes-win-hac-ker.github.io/*
- http://localhost:*
```

### Environment-Specific Keys
```bash
# Development key (restricted to localhost)
VITE_GEMINI_API_KEY_DEV=AIzaSy...development_key

# Production key (restricted to GitHub Pages domain)
VITE_GEMINI_API_KEY_PROD=AIzaSy...production_key
```

### Monitoring and Alerts
```bash
# Set up billing alerts in Google Cloud Console
# Monitor API usage and costs
# Set usage quotas to prevent abuse
```

## 🎯 Verification Checklist

Before deploying to production:

- [ ] API key stored in GitHub Secrets
- [ ] Local .env file not committed
- [ ] No hardcoded keys in source code
- [ ] Build logs don't expose secrets
- [ ] AI features work in production
- [ ] Fallback mode works without API key
- [ ] API usage is monitored
- [ ] Security restrictions are applied

## 🆘 Emergency Procedures

### If API Key is Compromised:
1. **Immediate**: Revoke key in Google Cloud Console
2. **Quick**: Generate new key
3. **Update**: GitHub Secret with new key
4. **Deploy**: Trigger new deployment
5. **Verify**: Test production site

### If Deployment Fails:
1. **Check**: GitHub Actions workflow logs
2. **Verify**: All secrets are configured
3. **Test**: Local build works
4. **Debug**: Step by step through workflow
5. **Escalate**: Create GitHub issue if needed

---

🔐 **Remember**: Security is not optional. Always protect your API keys and follow these guidelines for a secure deployment!
