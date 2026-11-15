#!/bin/sh
# AI-assisted: written with Claude Code, reviewed by the team.
# Tests, builds and pushes the built site to the gh-pages branch, which GitHub Pages serves.
# It does not depend on GitHub Actions. The branch holds only build output and is replaced each time.
set -e
npm test
npm run build
remote=$(git remote get-url origin)
tmp=$(mktemp -d)
cp -R dist/. "$tmp"/
touch "$tmp/.nojekyll"
cd "$tmp"
git init -q -b gh-pages
git add -A
git commit -q -m "Publish site"
git -c http.postBuffer=157286400 push -f "$remote" gh-pages
cd - >/dev/null
rm -rf "$tmp"
echo "Published to the gh-pages branch."
