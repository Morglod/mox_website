#!/usr/bin/env bash
set -euo pipefail

# Build the site and stage the output on the gh-pages branch
# via a git worktree at ./.deploy.
#
# This script never commits or pushes. Review the staged tree,
# then commit and push yourself:
#
#   cd .deploy
#   git status
#   git add -A
#   git commit -m "Deploy"
#   git push origin gh-pages

cd "$(dirname "$0")"

BRANCH="gh-pages"
WORKTREE=".deploy"

if ! git rev-parse HEAD >/dev/null 2>&1; then
  echo "error: no commits on current branch yet - commit source first" >&2
  exit 1
fi

echo "Building..."
npm run build

echo "Staging $BRANCH worktree at ./$WORKTREE..."

if [ -d "$WORKTREE" ]; then
  git worktree remove "$WORKTREE" --force 2>/dev/null || rm -rf "$WORKTREE"
fi

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git worktree add "$WORKTREE" "$BRANCH"
else
  git worktree add --orphan -b "$BRANCH" "$WORKTREE"
fi

# Wipe the worktree contents (keep the .git pointer file).
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

cp -R dist/. "$WORKTREE/"

cat <<EOF

Build staged on branch '$BRANCH' at ./$WORKTREE.
Nothing committed, nothing pushed. To publish:

  cd $WORKTREE
  git status
  git add -A
  git commit -m "Deploy"
  git push origin $BRANCH

EOF
