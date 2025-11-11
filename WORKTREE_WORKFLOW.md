# AV Systems Manual - Git Worktree Workflow

This repository uses git worktrees for issue-based development.

## Workflow

When you create a GitHub issue and want to fix it:

1. **Create worktree** (automated via script):
   ```bash
   cd /root/repos/av-systems-manual
   ./worktree-helper.sh <issue-number> <issue-title>
   ```
   
   Example:
   ```bash
   ./worktree-helper.sh 42 fix-spl-calculator-display
   ```

2. **Work on the issue**:
   ```bash
   cd /root/.cursor/worktrees/av-systems-manual/issue-42-fix-spl-calculator-display
   # Make your changes...
   ```

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Fix #42: fix-spl-calculator-display"
   git push origin issue-42-fix-spl-calculator-display
   ```

4. **Create PR**:
   - Go to GitHub repository
   - Create PR from `issue-42-fix-spl-calculator-display` to `main`
   - Link the PR to the issue using "Fixes #42" or "Closes #42"

## Worktree Locations

- Main repository: `/root/repos/av-systems-manual`
- Worktrees: `/root/.cursor/worktrees/av-systems-manual/<branch-name>`

## Cleanup

To remove a worktree after PR is merged:
```bash
cd /root/repos/av-systems-manual
git worktree remove /root/.cursor/worktrees/av-systems-manual/<branch-name>
```

