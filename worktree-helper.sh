#!/bin/bash
# Git worktree helper script for AV Systems Manual
# Usage: ./worktree-helper.sh <issue-number> <issue-title>

set -e

REPO_PATH="/root/repos/av-systems-manual"
WORKTREE_BASE="/root/.cursor/worktrees/av-systems-manual"
MAIN_BRANCH="main"

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <issue-number> <issue-title>"
    echo "Example: $0 123 fix-calculator-bug"
    exit 1
fi

ISSUE_NUM=$1
ISSUE_TITLE=$2
BRANCH_NAME="issue-${ISSUE_NUM}-$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')"
WORKTREE_PATH="${WORKTREE_BASE}/${BRANCH_NAME}"

echo "Creating worktree for issue #${ISSUE_NUM}"
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
echo "To work on this issue:"
echo "  cd ${WORKTREE_PATH}"
echo ""
echo "After fixing the issue:"
echo "  cd ${WORKTREE_PATH}"
echo "  git add ."
echo "  git commit -m \"Fix #${ISSUE_NUM}: ${ISSUE_TITLE}\""
echo "  git push origin ${BRANCH_NAME}"
echo ""
echo "Then create a PR from ${BRANCH_NAME} to ${MAIN_BRANCH}"

