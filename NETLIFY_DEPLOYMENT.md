# Netlify Deployment Guide

## Prerequisites
1. A Netlify account (free tier available)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Your backend API deployed separately (recommended: Railway, Heroku, or AWS)

## Deployment Steps

### 1. Connect Repository to Netlify
1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose your Git provider and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/out` (or `frontend/.next` if using static export)
   - **Base directory**: `frontend`

### 2. Environment Variables
In Netlify dashboard, go to Site settings > Environment variables and add:

```
NEXT_PUBLIC_OPENROUTER_API_KEY=your_actual_api_key
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_actual_api_key
NEXT_PUBLIC_NEWSAPI_KEY=your_actual_api_key
NEXT_PUBLIC_BACKEND_URL=https://your-deployed-backend.com
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
NEXTAUTH_URL=https://your-site-name.netlify.app
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. Deploy Backend Separately
Since Netlify is primarily for static sites, deploy your FastAPI backend separately:

**Option A: Railway**
1. Go to [Railway](https://railway.app)
2. Connect your repository
3. Select the backend folder
4. Add environment variables for your database and APIs

**Option B: Heroku**
1. Create a new Heroku app
2. Connect your repository
3. Set buildpack to Python
4. Add environment variables

**Option C: AWS/GCP/Azure**
- Use their respective container services

### 4. Update Configuration
1. Update `NEXT_PUBLIC_BACKEND_URL` in Netlify environment variables
2. Update any hardcoded localhost URLs in your code
3. Ensure all API calls use environment variables

### 5. Custom Domain (Optional)
1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Configure DNS records as instructed

## Build Configuration
The project is configured with:
- `netlify.toml` for build settings
- `_redirects` file for SPA routing
- Static export configuration in `next.config.ts`

## Troubleshooting

### Build Failures
- Check that all dependencies are in `package.json`
- Ensure Node.js version is compatible (set to 18 in netlify.toml)
- Check build logs in Netlify dashboard

### API Issues
- Verify backend is deployed and accessible
- Check CORS settings on your backend
- Ensure environment variables are set correctly

### Routing Issues
- The `_redirects` file handles SPA routing
- Check that all routes are properly configured

## Performance Optimization
- Enable Netlify's CDN (automatic)
- Use Netlify's image optimization
- Consider using Netlify Functions for API routes if needed

## Security
- Never commit API keys to your repository
- Use Netlify's environment variables for sensitive data
- Enable HTTPS (automatic with Netlify)
- Configure security headers in `netlify.toml`
