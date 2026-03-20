#!/bin/bash

# ============================================================
# Deploy Rostering Agent Prototype to GitHub + Cloudflare Pages
# ============================================================
#
# PREREQUISITES:
#   1. Git installed (you have it)
#   2. GitHub CLI or a GitHub personal access token
#   3. A Cloudflare account (free tier works)
#
# Run this script from the project root:
#   cd rostering-prototype
#   chmod +x deploy.sh
#   ./deploy.sh
#
# ============================================================

set -e

# ----- CONFIGURATION (edit these) -----
REPO_NAME="rostering-agent-prototype"
GITHUB_USER="YOUR_GITHUB_USERNAME"        # <-- change this
BRANCH="main"
# ----------------------------------------

echo ""
echo "========================================="
echo " Rostering Agent Prototype - Deployment"
echo "========================================="
echo ""

# ----- STEP 1: Initialise Git -----
echo "[1/5] Initialising git repository..."
git init
git add .
git commit -m "Initial commit: rostering agent prototype"
git branch -M $BRANCH
echo "      Done."
echo ""

# ----- STEP 2: Create GitHub repo -----
echo "[2/5] Creating GitHub repository..."
echo ""
echo "  OPTION A - GitHub CLI (recommended):"
echo "    gh repo create $REPO_NAME --public --source=. --remote=origin --push"
echo ""
echo "  OPTION B - Manual:"
echo "    1. Go to https://github.com/new"
echo "    2. Create repo named: $REPO_NAME"
echo "    3. Run these commands:"
echo "       git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo "       git push -u origin $BRANCH"
echo ""
read -p "  Press Enter once the repo is created and pushed..." 

# ----- STEP 3: Cloudflare Pages setup -----
echo ""
echo "[3/5] Setting up Cloudflare Pages..."
echo ""
echo "  1. Go to https://dash.cloudflare.com"
echo "  2. Click 'Workers & Pages' in the sidebar"
echo "  3. Click 'Create' then 'Pages'"
echo "  4. Click 'Connect to Git'"
echo "  5. Select your GitHub account and the '$REPO_NAME' repository"
echo "  6. Use these build settings:"
echo ""
echo "     +--------------------------+------------------+"
echo "     | Framework preset         | None             |"
echo "     | Build command            | npm run build    |"
echo "     | Build output directory   | dist             |"
echo "     +--------------------------+------------------+"
echo ""
echo "  7. Under 'Environment variables', add:"
echo "     NODE_VERSION = 18"
echo ""
echo "  8. Click 'Save and Deploy'"
echo ""
read -p "  Press Enter once Cloudflare deployment is complete..."

# ----- STEP 4: Verify -----
echo ""
echo "[4/5] Deployment complete!"
echo ""
echo "  Your prototype should now be live at:"
echo "  https://$REPO_NAME.pages.dev"
echo ""
echo "  (Cloudflare may assign a slightly different subdomain."
echo "   Check your Cloudflare Pages dashboard for the exact URL.)"
echo ""

# ----- STEP 5: Future updates -----
echo "[5/5] For future updates, just push to main:"
echo ""
echo "  git add ."
echo "  git commit -m \"Update: description of changes\""
echo "  git push origin main"
echo ""
echo "  Cloudflare Pages auto-deploys on every push."
echo ""
echo "========================================="
echo " Done!"
echo "========================================="
