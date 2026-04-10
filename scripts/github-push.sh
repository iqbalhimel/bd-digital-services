#!/bin/bash
# GitHub Auto-Push Script
# Called by post-commit hook to push to GitHub after every Replit checkpoint

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [git-push] $1" >> /tmp/github-push.log 2>&1
}

if [ -z "$GITHUB_TOKEN" ]; then
  log "GITHUB_TOKEN not set — skipping push"
  exit 0
fi

REPO_DIR="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel 2>/dev/null)"
cd "$REPO_DIR" || exit 0

# Set remote URL with token
git remote set-url origin "https://${GITHUB_TOKEN}@github.com/iqbalhimel/bd-digital-services.git" 2>/dev/null || \
git remote add origin "https://${GITHUB_TOKEN}@github.com/iqbalhimel/bd-digital-services.git" 2>/dev/null

log "Pushing to GitHub..."
if git push origin main --quiet 2>/dev/null; then
  log "Push successful ($(git rev-parse --short HEAD))"
else
  log "Push failed — check token permissions"
fi
