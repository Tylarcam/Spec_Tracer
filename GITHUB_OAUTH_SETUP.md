# GitHub OAuth Setup Guide for LogTrace Production

## Overview
This guide will help you set up GitHub OAuth authentication for your LogTrace application in production using Supabase.

## Prerequisites
- Supabase project: `kepmuysqytngtqterosr`
- GitHub account with repository access
- Access to your repository's Settings → Secrets and variables → Actions

## Step 1: Create GitHub OAuth App

### 1.1 Navigate to GitHub Developer Settings
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" in the left sidebar
3. Click "New OAuth App"

### 1.2 Configure OAuth App Settings
Fill in the following details:

**Application name**: `LogTrace Debug Tool`

**Homepage URL**: `https://kepmuysqytngtqterosr.supabase.co` (or your custom domain)

**Application description**: `Chrome extension debug tool for web developers`

**Authorization callback URL**: 
```
https://kepmuysqytngtqterosr.supabase.co/auth/v1/callback
```

⚠️ **CRITICAL**: The callback URL must be EXACTLY as shown above. Any variation will cause OAuth to fail.

### 1.3 Save OAuth Credentials
After creating the app, you'll receive:
- **Client ID** (public, can be committed to code)
- **Client Secret** (private, must be kept secure)

## Step 2: Configure Supabase Dashboard

### 2.1 Access Supabase Auth Settings
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `kepmuysqytngtqterosr`
3. Navigate to "Authentication" → "Providers"

### 2.2 Enable GitHub Provider
1. Find "GitHub" in the provider list
2. Toggle it to "Enabled"
3. Enter your GitHub OAuth app credentials:
   - **Client ID**: `your_github_client_id`
   - **Client Secret**: `your_github_client_secret`
4. Click "Save"

### 2.3 Configure Site URL (Important!)
1. Go to "Authentication" → "URL Configuration"
2. Set **Site URL** to your production domain (e.g., `https://yourdomain.com`)
3. Add **Redirect URLs** (if using multiple domains):
   ```
   https://yourdomain.com/**
   https://kepmuysqytngtqterosr.supabase.co/**
   ```

## Step 3: Update Environment Variables

### 3.1 GitHub Repository Secrets
Add these secrets to your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret" for each:

```
VITE_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 3.2 Production Environment Variables
For your hosting platform (Vercel, Netlify, etc.), set:

```bash
VITE_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Step 4: Test OAuth Flow

### 4.1 Local Testing
1. Start your development server: `npm run dev`
2. Navigate to `/auth`
3. Click "GitHub" button
4. Verify redirect to GitHub
5. Authorize the application
6. Verify redirect back to your app

### 4.2 Production Testing
1. Deploy your application
2. Navigate to `https://yourdomain.com/auth`
3. Test the complete OAuth flow
4. Verify user data is properly stored

## Step 5: Security Best Practices

### 5.1 Row Level Security (RLS)
Enable RLS on all Supabase tables:
```sql
ALTER TABLE your_table_name ENABLE ROW LEVEL SECURITY;

-- Example policy for user-specific data
CREATE POLICY "Users can only access their own data" ON your_table_name
FOR ALL USING (auth.uid() = user_id);
```

### 5.2 Additional Security Measures
- ✅ PKCE (Proof Key for Code Exchange) - Already enabled in Supabase
- ✅ Secure token storage - Using localStorage with httpOnly consideration
- ✅ Token refresh - Handled automatically by Supabase
- ✅ Rate limiting - Built into Supabase Auth

## Step 6: Monitoring and Analytics

### 6.1 Supabase Auth Logs
Monitor authentication events in:
- Supabase Dashboard → Authentication → Users
- Supabase Dashboard → Logs

### 6.2 Error Tracking
Your app already includes Sentry for error tracking. Monitor:
- OAuth failures
- Token refresh issues
- Network connectivity problems

## Troubleshooting

### Common Issues

**1. "Invalid redirect URI"**
- Verify callback URL exactly matches: `https://kepmuysqytngtqterosr.supabase.co/auth/v1/callback`
- Check for trailing slashes or typos

**2. "Application not found"**
- Verify GitHub OAuth app is active
- Check Client ID is correctly configured in Supabase

**3. "Access denied"**
- User canceled authorization
- GitHub OAuth app may be suspended

**4. "Invalid client"**
- Client Secret is incorrect in Supabase
- OAuth app configuration mismatch

### Debug Steps
1. Check browser developer tools for network errors
2. Verify Supabase logs for authentication events
3. Test with different browsers/incognito mode
4. Confirm environment variables are loaded correctly

## Support

For additional help:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [LogTrace GitHub Issues](https://github.com/Tylarcam/trace-sight-debug-view/issues)

---

**Next Steps**: After completing this setup, your users will be able to sign in with GitHub and access advanced LogTrace features with persistent user sessions. 