#!/usr/bin/env node

/**
 * GitHub OAuth Setup Script for LogTrace
 * 
 * This script helps you configure GitHub OAuth for your LogTrace application.
 * Run with: node scripts/setup-oauth.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
if (!SUPABASE_PROJECT_ID) {
  console.error('❌ SUPABASE_PROJECT_ID environment variable is not set. Please export this variable and rerun the script.');
  process.exit(1);
}
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const CALLBACK_URL = `${SUPABASE_URL}/auth/v1/callback`;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🚀 LogTrace GitHub OAuth Setup\n');
console.log('This script will help you configure GitHub OAuth for production.\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

/**
 * Validates GitHub OAuth Client ID format
 * @param {string} clientId - The client ID to validate
 * @returns {Object} - { isValid: boolean, error?: string }
 */
function validateClientId(clientId) {
  if (!clientId || typeof clientId !== 'string') {
    return { isValid: false, error: 'Client ID is required' };
  }

  // Remove any leading/trailing whitespace
  clientId = clientId.trim();

  // Check minimum length (GitHub Client IDs are typically 20-21 characters)
  if (clientId.length < 20) {
    return { 
      isValid: false, 
      error: 'Client ID appears too short (should be around 20-21 characters)' 
    };
  }

  // Check maximum reasonable length
  if (clientId.length > 25) {
    return { 
      isValid: false, 
      error: 'Client ID appears too long (should be around 20-21 characters)' 
    };
  }

  // Check for valid GitHub OAuth Client ID patterns
  // New format: starts with "Ov23li" or similar
  // Old format: starts with "Iv1."
  const newFormatPattern = /^Ov[a-zA-Z0-9]{16,}$/;
  const oldFormatPattern = /^Iv1\.[a-zA-Z0-9]{16,}$/;
  
  if (!newFormatPattern.test(clientId) && !oldFormatPattern.test(clientId)) {
    return { 
      isValid: false, 
      error: 'Client ID format is invalid (should start with "Ov" or "Iv1." followed by alphanumeric characters)' 
    };
  }

  return { isValid: true };
}

/**
 * Validates GitHub OAuth Client Secret format
 * @param {string} clientSecret - The client secret to validate
 * @returns {Object} - { isValid: boolean, error?: string }
 */
function validateClientSecret(clientSecret) {
  if (!clientSecret || typeof clientSecret !== 'string') {
    return { isValid: false, error: 'Client Secret is required' };
  }

  // Remove any leading/trailing whitespace
  clientSecret = clientSecret.trim();

  // Check length (GitHub Client Secrets are typically 40 characters)
  if (clientSecret.length !== 40) {
    return { 
      isValid: false, 
      error: `Client Secret should be exactly 40 characters long (current: ${clientSecret.length})` 
    };
  }

  // Check for valid characters (hexadecimal-like pattern)
  const validPattern = /^[a-fA-F0-9]{40}$/;
  if (!validPattern.test(clientSecret)) {
    return { 
      isValid: false, 
      error: 'Client Secret format is invalid (should contain only hexadecimal characters: 0-9, a-f)' 
    };
  }

  return { isValid: true };
}

async function main() {
  try {
    console.log('📋 Setup Information:');
    console.log(`   Supabase Project: ${SUPABASE_PROJECT_ID}`);
    console.log(`   Supabase URL: ${SUPABASE_URL}`);
    console.log(`   OAuth Callback URL: ${CALLBACK_URL}\n`);

    // Step 1: GitHub OAuth App
    console.log('🔧 Step 1: GitHub OAuth App Configuration');
    console.log('1. Go to: https://github.com/settings/developers');
    console.log('2. Click "OAuth Apps" → "New OAuth App"');
    console.log('3. Fill in the following details:');
    console.log(`   Application name: LogTrace Debug Tool`);
    console.log(`   Homepage URL: ${SUPABASE_URL}`);
    console.log(`   Authorization callback URL: ${CALLBACK_URL}`);
    console.log('4. Click "Register application"\n');

    const clientId = await question('Enter your GitHub OAuth Client ID: ');
    const clientSecret = await question('Enter your GitHub OAuth Client Secret: ');

    // Validate Client ID format
    const clientIdValidation = validateClientId(clientId);
    if (!clientIdValidation.isValid) {
      console.log(`❌ Invalid Client ID: ${clientIdValidation.error}`);
      console.log('💡 Tip: Client ID should look like "Ov23liABC123..." or "Iv1.ABC123..."');
      process.exit(1);
    }

    // Validate Client Secret format
    const clientSecretValidation = validateClientSecret(clientSecret);
    if (!clientSecretValidation.isValid) {
      console.log(`❌ Invalid Client Secret: ${clientSecretValidation.error}`);
      console.log('💡 Tip: Client Secret should be a 40-character hexadecimal string');
      process.exit(1);
    }

    // Basic presence check (redundant but kept for safety)
    if (!clientId || !clientSecret) {
      console.log('❌ Client ID and Client Secret are required!');
      process.exit(1);
    }

    // Step 2: Supabase Configuration
    console.log('\n🔧 Step 2: Supabase Configuration');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log(`2. Select project: ${SUPABASE_PROJECT_ID}`);
    console.log('3. Navigate to Authentication → Providers');
    console.log('4. Enable GitHub provider');
    console.log(`5. Enter Client ID: ${clientId}`);
    console.log(`6. Enter Client Secret: ${clientSecret}`);
    console.log('7. Click "Save"\n');

    const supabaseConfigured = await question('Have you configured Supabase? (y/n): ');
    
    if (supabaseConfigured.toLowerCase() !== 'y') {
      console.log('⚠️  Please configure Supabase first, then run this script again.');
      process.exit(1);
    }

    // Step 3: Environment Variables
    console.log('\n🔧 Step 3: Environment Variables');
    console.log('Add these secrets to your GitHub repository:');
    console.log('Repository → Settings → Secrets and variables → Actions\n');
    
    console.log('VITE_SUPABASE_URL');
    console.log(SUPABASE_URL);
    console.log('\nVITE_SUPABASE_ANON_KEY');
    console.log('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcG11eXNxeXRuZ3RxdGVyb3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTk2NzQsImV4cCI6MjA2NzM5NTY3NH0.zlIhuBHikJjtK0Y1A31Bp7NIvP_j7E4OILRzz-7bJvA\n');

    // Step 4: Deployment Platform
    console.log('🔧 Step 4: Choose Deployment Platform');
    console.log('1. Vercel (recommended)');
    console.log('2. Netlify');
    console.log('3. GitHub Pages');
    
    const platform = await question('Choose platform (1-3): ');
    
    let platformInstructions = '';
    switch (platform) {
      case '1':
        platformInstructions = `
📦 Vercel Setup:
1. Install Vercel CLI: npm i -g vercel
2. Run: vercel --prod
3. Set environment variables in Vercel dashboard
4. Add these GitHub secrets for auto-deployment:
   - VERCEL_TOKEN (from Vercel account settings)
   - VERCEL_ORG_ID (from project settings)
   - VERCEL_PROJECT_ID (from project settings)`;
        break;
      case '2':
        platformInstructions = `
📦 Netlify Setup:
1. Connect your GitHub repo to Netlify
2. Set build command: npm run build
3. Set publish directory: dist
4. Add environment variables in Netlify dashboard
5. Add these GitHub secrets for auto-deployment:
   - NETLIFY_AUTH_TOKEN (from Netlify account)
   - NETLIFY_SITE_ID (from site settings)`;
        break;
      case '3':
        platformInstructions = `
📦 GitHub Pages Setup:
1. Enable GitHub Pages in repository settings
2. Choose GitHub Actions as source
3. Push changes to trigger deployment
4. Your app will be available at: https://yourusername.github.io/trace-sight-debug-view`;
        break;
      default:
        platformInstructions = 'Invalid platform choice. Please run the script again.';
    }

    console.log(platformInstructions);

    // Step 5: Testing
    console.log('\n🧪 Step 5: Testing');
    console.log('1. Deploy your application');
    console.log('2. Navigate to /auth on your deployed domain');
    console.log('3. Click "GitHub" button');
    console.log('4. Complete OAuth flow');
    console.log('5. Verify user is logged in\n');

    // Generate summary
    const summary = `
✅ GitHub OAuth Setup Complete!

📋 Configuration Summary:
   GitHub OAuth App: Created
   Client ID: ${clientId}
   Supabase Provider: Configured
   Environment Variables: Ready for deployment
   
🚀 Next Steps:
   1. Deploy your application using the chosen platform
   2. Test the OAuth flow
   3. Monitor authentication in Supabase Dashboard
   
📖 For detailed instructions, see: GITHUB_OAUTH_SETUP.md
`;

    console.log(summary);

    // Save configuration
    // Only persist a masked version of the client ID to avoid storing sensitive data in plaintext
    const maskedClientId = clientId ? `${clientId.substring(0, 4)}****` : undefined;

    const config = {
      timestamp: new Date().toISOString(),
      supabaseProjectId: SUPABASE_PROJECT_ID,
      supabaseUrl: SUPABASE_URL,
      callbackUrl: CALLBACK_URL,
      githubClientIdMasked: maskedClientId,
      platform: ['vercel', 'netlify', 'github-pages'][parseInt(platform) - 1] || 'unknown'
    };

    fs.writeFileSync(
      path.join(__dirname, '..', '.oauth-config.json'),
      JSON.stringify(config, null, 2)
    );

    console.log('💾 Configuration saved to .oauth-config.json');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main(); 