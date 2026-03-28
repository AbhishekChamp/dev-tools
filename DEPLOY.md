# Deployment Guide

## Netlify Deployment

### Option 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize and deploy**:
   ```bash
   cd dev-tools-platform
   netlify init
   # Follow prompts to connect to your GitHub repo
   ```

### Option 2: Deploy via GitHub Integration (Automatic)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: add Netlify deployment config"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Configure build settings:
     - **Build command**: `pnpm build:netlify`
     - **Publish directory**: `dist`
   - Click "Deploy site"

3. **Environment Variables** (if needed):
   - In Netlify dashboard → Site settings → Environment variables
   - Add any required env vars

### Option 3: Manual Deploy

1. **Build locally**:
   ```bash
   cd dev-tools-platform
   pnpm install
   pnpm build:netlify
   ```

2. **Deploy the dist folder**:
   ```bash
   netlify deploy --prod --dir=dist
   ```

## Build Configuration

The `netlify.toml` file handles:
- Build command and publish directory
- SPA routing (all routes serve index.html)
- Security headers
- Static asset caching

## Post-Deployment

- **Custom Domain**: Set up in Netlify dashboard → Domain settings
- **HTTPS**: Automatically enabled by Netlify
- **Branch Deploys**: Enable in Site settings → Build & deploy

## Troubleshooting

**Build fails?**
- Check Node version (requires 20+)
- Ensure pnpm is installed
- Check build logs in Netlify dashboard

**Routes not working?**
- The SPA redirect rule in `netlify.toml` handles this
- Ensure you're using client-side routing (TanStack Router)

**Assets not loading?**
- Check that all assets are in the `dist` folder
- Verify base URL configuration in vite.config.ts
