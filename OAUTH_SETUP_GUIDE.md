# OAuth Setup Guide

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_long_random_string_at_least_32_characters_long

# Google OAuth
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx

# GitHub OAuth
GITHUB_ID=xxxx
GITHUB_SECRET=xxxx
```

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure the OAuth consent screen:
   - Application type: Web application
   - Name: Your app name
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://your-domain.com
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://your-domain.com/api/auth/callback/google
     ```
6. Copy the Client ID and Client Secret to your `.env.local`

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the form:
   - Application name: Your app name
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. For production, add: `https://your-domain.com/api/auth/callback/github`
5. Copy the Client ID and Client Secret to your `.env.local`

## Testing OAuth Flow

1. Start your development server: `npm run dev`
2. Navigate to `/auth/signin`
3. Click on Google or GitHub button
4. Complete the OAuth flow
5. Verify you're redirected to `/dashboard`
6. Check browser cookies for `ti_access` and `ti_refresh` tokens

## Troubleshooting

### Google "400: malformed / invalid redirect_uri" Error

This error occurs when the redirect URI in Google Cloud Console doesn't match what NextAuth is requesting.

**Check these exact URIs in Google Cloud Console:**
- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

**Verify your NEXTAUTH_URL:**
- Should be `http://localhost:3000` for development
- Should be `https://your-domain.com` for production

### Common Issues

1. **Missing NEXTAUTH_SECRET**: Generate a random 32+ character string
2. **Wrong callback URLs**: Must be exactly `/api/auth/callback/google` and `/api/auth/callback/github`
3. **Environment variables not loaded**: Restart your development server after adding `.env.local`
4. **CORS issues**: Ensure your domain is added to authorized origins in both Google and GitHub