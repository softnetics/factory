#!/bin/bash -e
export GIT_COMMITTER_NAME=softnetics-fresh-app-bot
export GIT_AUTHOR_NAME=softnetics-fresh-app-bot
export GIT_COMMITTER_EMAIL=softnetics-fresh-app-bot@users.noreply.github.com
export GIT_AUTHOR_EMAIL=softnetics-fresh-app-bot@users.noreply.github.com

cd workspace/fresh-app
rm -rf .git
git init
git remote add origin "https://x-access-token:$GH_PUSH_TOKEN@github.com/softnetics/$(cat ../tmp/project).git"
git fetch origin
git reset --soft origin/main || echo "No existing branch"
git add --all && git commit -m "$(cat ../tmp/message)" || echo "Nothing to commit"
git push origin HEAD:refs/heads/main
