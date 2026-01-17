# Deploying to Netlify

This guide explains how to deploy the Visitor Pass app to Netlify.

## Prerequisites

1. A [Netlify account](https://app.netlify.com/signup)
2. A [Supabase project](https://supabase.com) with the database set up (see CLAUDE.md for SQL setup)
3. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables

You'll need these environment variables configured in Netlify:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g., `https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

## Deployment Options

### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Connect your repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to your Git provider (GitHub, GitLab, or Bitbucket)
   - Select your repository

2. **Configure build settings**
   - Build command: `npm run build` (or `bun run build`)
   - Publish directory: `.next`
   - Netlify auto-detects Next.js and configures the runtime

3. **Add environment variables**
   - Go to Site settings → Environment variables
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your app

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize the project**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Enter a site name (or leave blank for random name)

4. **Set environment variables**
   ```bash
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://your-project.supabase.co"
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-anon-key"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Netlify Configuration (Optional)

Create a `netlify.toml` file in the project root for custom configuration:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Post-Deployment

1. **Verify the deployment**
   - Visit your Netlify site URL
   - Test all user flows: Visitor → Resident → Guard

2. **Set up custom domain (optional)**
   - Go to Site settings → Domain management
   - Add your custom domain
   - Configure DNS as instructed

3. **Enable HTTPS**
   - Netlify automatically provisions SSL certificates
   - HTTPS is enabled by default

## Troubleshooting

### Build fails with "Module not found"
- Ensure all dependencies are in `package.json`
- Run `npm install` or `bun install` locally to verify

### Environment variables not working
- Make sure variable names start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/changing environment variables

### 404 errors on dynamic routes
- Netlify's Next.js runtime handles dynamic routes automatically
- If issues persist, ensure `@netlify/plugin-nextjs` is installed

## Continuous Deployment

Once connected to Git, Netlify automatically:
- Deploys on every push to the main branch
- Creates deploy previews for pull requests
- Provides rollback to previous deployments

## Resources

- [Netlify Next.js Documentation](https://docs.netlify.com/frameworks/next-js/overview/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
