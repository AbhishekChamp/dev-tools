#!/bin/bash
set -e

echo "🚀 Building Dev Tools Platform for Netlify..."

# Clean previous builds
echo "📦 Cleaning previous builds..."
rm -rf dist

# Build packages first (dependencies for apps)
echo "📦 Building packages..."
pnpm --filter @dev-tools/theme build
pnpm --filter @dev-tools/ui build
pnpm --filter @dev-tools/utils build
pnpm --filter @dev-tools/tool-sdk build

# Build shell app (includes all tools via direct imports)
echo "🐚 Building shell app with all tools..."
pnpm --filter shell build

# Create dist directory
echo "📁 Creating dist directory..."
mkdir -p dist

# Copy shell build to dist
echo "📋 Copying build to dist..."
cp -r apps/shell/dist/* dist/

# Copy public assets if any
echo "📋 Copying public assets..."
if [ -d "apps/shell/public" ]; then
  cp -r apps/shell/public/* dist/ 2>/dev/null || true
fi

echo "✅ Build complete! Output in ./dist"
echo ""
echo "📂 Dist structure:"
ls -la dist/
