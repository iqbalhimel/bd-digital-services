#!/bin/bash
# GitHub Auto-Sync Script
# Runs on a loop to pull new changes from GitHub into Replit

REPO_URL="https://github.com/iqbalhimel/bd-digital-services.git"
BRANCH="main"
INTERVAL=300  # 5 minutes

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Configure git remote with token if available
setup_remote() {
  if [ -n "$GITHUB_TOKEN" ]; then
    git remote set-url origin "https://${GITHUB_TOKEN}@github.com/iqbalhimel/bd-digital-services.git" 2>/dev/null || \
    git remote add origin "https://${GITHUB_TOKEN}@github.com/iqbalhimel/bd-digital-services.git" 2>/dev/null
  fi
}

log "GitHub Auto-Sync started (interval: ${INTERVAL}s)"
setup_remote

while true; do
  # Fetch latest from GitHub (non-destructive)
  if git fetch origin "$BRANCH" --quiet 2>/dev/null; then
    LOCAL=$(git rev-parse HEAD 2>/dev/null)
    REMOTE=$(git rev-parse "origin/$BRANCH" 2>/dev/null)

    if [ "$LOCAL" != "$REMOTE" ]; then
      # Check if working tree is clean before pulling
      if git diff --quiet && git diff --cached --quiet; then
        log "New commits detected on GitHub. Pulling..."
        if git pull origin "$BRANCH" --ff-only --quiet 2>/dev/null; then
          log "Successfully synced from GitHub ($(git rev-parse --short HEAD))"
        else
          log "Pull failed (non-fast-forward). Manual merge may be needed."
        fi
      else
        log "Skipping pull — working tree has uncommitted changes."
      fi
    else
      log "Already up to date with GitHub ($(git rev-parse --short HEAD))"
    fi
  else
    log "Fetch failed — check GITHUB_TOKEN and network."
  fi

  sleep "$INTERVAL"
done
