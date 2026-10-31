#!/usr/bin/env bash
#
# Publish this work to your existing GitHub repository.
#
#   ./push-to-github.sh
#
# This folder started as a ZIP download, so it has no shared history with the
# repository it came from. This script links the two: it points this folder at
# your remote, puts the work on top of the real main branch, shows you exactly
# what the commit will change, and pushes.
#
# You will need your GitHub credentials — git will prompt, or a browser will
# open, depending on how you have git set up.
#
set -euo pipefail

cd "$(dirname "$0")"

DEFAULT_URL="https://github.com/Piyush70007/piyushchavan.com.git"

if [ ! -d .git ]; then
  echo "This folder is not a git repository. Run this first:"
  echo
  echo "  git init -b main"
  echo "  git add -A"
  echo '  git commit -m "Redesign motion, live AI assistant, both degrees, and preview-qualified pricing"'
  echo
  exit 1
fi

echo "Your repository URL"
echo "  (press enter for $DEFAULT_URL)"
read -r REPO
if [ -z "$REPO" ]; then REPO="$DEFAULT_URL"; fi

BRANCH="${1:-}"

echo
echo "→ linking to $REPO"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO"
else
  git remote add origin "$REPO"
fi

echo "→ fetching"
if ! git fetch --prune origin; then
  echo
  echo "Could not reach $REPO."
  echo "Check the URL — it should end in .git — and that you have access."
  echo "Your GitHub profile: https://github.com/Piyush70007"
  exit 1
fi

# Work out which branch the remote actually uses. Guessing "main" would create
# a second branch on a repository that calls it "master".
if [ -z "$BRANCH" ]; then
  # `|| true` matters: with `set -e` and `pipefail`, a failed lookup inside a
  # command substitution would end the script before it ever got to the push.
  BRANCH=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||' || true)
fi
if [ -z "$BRANCH" ]; then
  REMOTE_BRANCHES=$(git for-each-ref --format='%(refname:short)' refs/remotes/origin/ 2>/dev/null | sed 's|^origin/||' | grep -v '^HEAD$' || true)
  if printf '%s\n' "$REMOTE_BRANCHES" | grep -qx 'main'; then
    BRANCH="main"
  elif printf '%s\n' "$REMOTE_BRANCHES" | grep -qx 'master'; then
    BRANCH="master"
  elif [ -n "$REMOTE_BRANCHES" ]; then
    BRANCH=$(printf '%s\n' "$REMOTE_BRANCHES" | head -1)
  else
    BRANCH="main"
  fi
fi
echo "→ branch: $BRANCH"

if git rev-parse --verify "origin/$BRANCH" >/dev/null 2>&1; then
  echo "→ putting this work on top of origin/$BRANCH"
  git reset --soft "origin/$BRANCH"

  # Stage the working tree as well as the index. `git commit` commits the
  # index, so an edit that was never `git add`ed would be left out of the
  # push entirely — and the diff printed below would not mention it.
  # Staging first also makes that diff the complete list of what changes.
  git add -A

  if git diff --cached --quiet; then
    echo "   the remote already has these changes — nothing to do"
    exit 0
  fi

  echo
  echo "   this commit will change:"
  git diff --cached --stat
  echo
  read -r -p "   continue? [y/N] " OK
  if [ "$OK" != "y" ] && [ "$OK" != "Y" ]; then
    echo "   stopped — nothing was pushed"
    exit 0
  fi

  git commit -q -m "Redesign motion, live AI assistant, both degrees, and preview-qualified pricing"
else
  echo "→ no origin/$BRANCH found — publishing this branch as the first one"
  git add -A
  git diff --cached --stat || true
  echo
  read -r -p "   continue? [y/N] " OK
  if [ "$OK" != "y" ] && [ "$OK" != "Y" ]; then
    echo "   stopped — nothing was pushed"
    exit 0
  fi
fi

echo
echo "→ pushing to origin/$BRANCH"
if ! git push origin "HEAD:$BRANCH"; then
  echo
  echo "The push was rejected. If the remote has commits you do not have,"
  echo "pull them first and run this again:"
  echo
  echo "  git pull --rebase origin $BRANCH"
  exit 1
fi

echo
echo "Done. GitHub Pages will publish the new site on its next build."
echo "If the assistant should answer with a real model rather than the local"
echo "guide, deploy the Cloudflare Worker and set the endpoint in site-config.js:"
echo
echo "  npm install && npm run deploy:assistant"
echo "  npx wrangler secret put GROQ_API_KEY"
