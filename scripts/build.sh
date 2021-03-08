#!/usr/bin/env sh
set -e

npm run lint
npm run build
npm run test
npm run docs:build
