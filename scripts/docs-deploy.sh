#!/usr/bin/env sh
set -e

cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

ssh-keyscan github.com > ~/.ssh/known_hosts
ssh-add ~/.ssh/id_rsa
git push -f git@github.com:smartsupp/smartsupp-sdk-websocket.git master:gh-pages

cd -
