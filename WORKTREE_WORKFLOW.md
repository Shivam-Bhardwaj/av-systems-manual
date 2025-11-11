# AV Systems Manual - Issue-Based Development Workflow

## Quick Start

When you create a GitHub issue and paste the link here, I will:

1. **Parse the issue URL** and extract issue number and details
2. **Create a git worktree** with a feature branch
3. **Fix the issue** in the worktree
4. **Commit the changes** with proper message
5. **Push the branch** and create a PR

## Usage

Just paste a GitHub issue URL like:
```
https://github.com/Shivam-Bhardwaj/av-systems-manual/issues/42
```

I'll handle the rest automatically!

## Manual Workflow (if needed)

### Create Worktree
```bash
cd /root/repos/av-systems-manual
./issue-handler.sh https://github.com/Shivam-Bhardwaj/av-systems-manual/issues/42
```

### Work on Issue
```bash
cd /root/.cursor/worktrees/av-systems-manual/issue-42-<title>
# Make changes...
git add .
git commit -m "Fix #42: <description>"
git push origin issue-42-<title>
```

### Create PR
```bash
gh pr create --title "Fix #42: <description>" --body "Fixes #42"
```

Or create manually on GitHub.

## Worktree Structure

- **Main repo**: `/root/repos/av-systems-manual`
- **Worktrees**: `/root/.cursor/worktrees/av-systems-manual/<branch-name>`
- **Issue info**: Each worktree contains `.issue-info` file with issue details

## Cleanup

After PR is merged:
```bash
cd /root/repos/av-systems-manual
git worktree remove /root/.cursor/worktrees/av-systems-manual/<branch-name>
git branch -d issue-<num>-<title>  # Delete local branch
```

