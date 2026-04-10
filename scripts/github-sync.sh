#!/bin/bash
# GitHub Auto-Sync Script
# Runs on a loop to pull new changes from GitHub into Replit
# Token is injected at fetch/pull time via GIT_ASKPASS — never stored in remote URL

BRANCH="main"
INTERVAL=300  # 5 minutes

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Ensure origin points to clean URL (no token embedded)
setup_remote() {
  git remote set-url origin "https://github.com/iqbalhimel/bd-digital-services.git" 2>/dev/null || \
  git remote add origin "https://github.com/iqbalhimel/bd-digital-services.git" 2>/dev/null
}

# Create a temporary ASKPASS helper to supply credentials securely
make_askpass() {
  local tmp
  tmp="$(mktemp /tmp/git-askpass-XXXXX.sh)"
  printf '#!/bin/bash\necho "%s"\n' "${GITHUB_TOKEN}" > "$tmp"
  chmod +x "$tmp"
  echo "$tmp"
}

log "GitHub Auto-Sync started (interval: ${INTERVAL}s)"
setup_remote

while true; do
  if [ -z "$GITHUB_TOKEN" ]; then
    log "GITHUB_TOKEN not set — skipping sync"
    sleep "$INTERVAL"
    continue
  fi

  ASKPASS_SCRIPT="$(make_askpass)"

  # Fetch latest from GitHub (non-destructive)
  if GIT_TERMINAL_PROMPT=0 GIT_ASKPASS="$ASKPASS_SCRIPT" \
     git fetch origin "$BRANCH" --quiet 2>/dev/null; then

    LOCAL=$(git rev-parse HEAD 2>/dev/null)
    REMOTE=$(git rev-parse "origin/$BRANCH" 2>/dev/null)

    if [ "$LOCAL" != "$REMOTE" ]; then
      # Check if working tree is clean before pulling
      if git diff --quiet && git diff --cached --quiet; then
        log "New commits detected on GitHub. Pulling..."
        if GIT_TERMINAL_PROMPT=0 GIT_ASKPASS="$ASKPASS_SCRIPT" \
           git pull origin "$BRANCH" --ff-only --quiet 2>/dev/null; then
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

  rm -f "$ASKPASS_SCRIPT"
  sleep "$INTERVAL"
done
