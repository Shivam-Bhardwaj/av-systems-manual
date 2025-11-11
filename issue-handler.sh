#!/bin/bash
# GitHub Issue Worktree Handler
# Automatically creates worktree, fixes issue, commits, and prepares PR
# Usage: ./issue-handler.sh <github-issue-url>

set -e

REPO_PATH="/root/repos/av-systems-manual"
WORKTREE_BASE="/root/.cursor/worktrees/av-systems-manual"
MAIN_BRANCH="main"
REPO_OWNER="Shivam-Bhardwaj"
REPO_NAME="av-systems-manual"

if [ -z "$1" ]; then
    echo "Usage: $0 <github-issue-url>"
    echo "Example: $0 https://github.com/Shivam-Bhardwaj/av-systems-manual/issues/42"
    exit 1
fi

ISSUE_URL=$1

# Extract issue number from URL
ISSUE_NUM=$(echo "$ISSUE_URL" | grep -oP 'issues/\K\d+' || echo "")
if [ -z "$ISSUE_NUM" ]; then
    echo "Error: Could not extract issue number from URL: $ISSUE_URL"
    exit 1
fi

echo "Processing GitHub Issue #${ISSUE_NUM}"
echo "URL: ${ISSUE_URL}"

# Fetch issue details (requires gh CLI)
if command -v gh &> /dev/null; then
    ISSUE_TITLE=$(gh issue view "$ISSUE_NUM" --repo "$REPO_OWNER/$REPO_NAME" --json title -q .title 2>/dev/null || echo "issue-${ISSUE_NUM}")
    echo "Title: ${ISSUE_TITLE}"
else
    ISSUE_TITLE="issue-${ISSUE_NUM}"
    echo "Warning: GitHub CLI not available, using default title"
fi

# Create branch name
BRANCH_NAME="issue-${ISSUE_NUM}-$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g' | cut -c1-50)"
WORKTREE_PATH="${WORKTREE_BASE}/${BRANCH_NAME}"

echo ""
echo "Creating worktree..."
echo "Branch: ${BRANCH_NAME}"
echo "Path: ${WORKTREE_PATH}"

# Remove worktree if it already exists
if [ -d "$WORKTREE_PATH" ]; then
    echo "Removing existing worktree..."
    cd "$REPO_PATH"
    git worktree remove "$WORKTREE_PATH" --force 2>/dev/null || rm -rf "$WORKTREE_PATH"
fi

# Create worktree
cd "$REPO_PATH"
git fetch origin
git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" origin/$MAIN_BRANCH

echo ""
echo "✓ Worktree created successfully!"
echo ""
echo "Worktree location: ${WORKTREE_PATH}"
echo ""
echo "Issue details saved to: ${WORKTREE_PATH}/.issue-info"
cat > "${WORKTREE_PATH}/.issue-info" <<EOF
ISSUE_NUMBER=${ISSUE_NUM}
ISSUE_URL=${ISSUE_URL}
ISSUE_TITLE=${ISSUE_TITLE}
BRANCH_NAME=${BRANCH_NAME}
CREATED_AT=$(date -Iseconds)
EOF

echo "Next steps:"
echo "1. cd ${WORKTREE_PATH}"
echo "2. Fix the issue"
echo "3. Run: git add . && git commit -m \"Fix #${ISSUE_NUM}: ${ISSUE_TITLE}\""
echo "4. Run: git push origin ${BRANCH_NAME}"
echo "5. Create PR on GitHub or use: gh pr create --title \"Fix #${ISSUE_NUM}: ${ISSUE_TITLE}\" --body \"Fixes #${ISSUE_NUM}\""

