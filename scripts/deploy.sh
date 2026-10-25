#!/bin/sh
# Actions가 막혀 있을 때의 배포: 로컬 빌드 → dist를 gh-pages 브랜치로 강제 푸시.
# Actions가 풀리면 .github/workflows/deploy.yml 이 대신하므로 이 스크립트는 안 써도 된다.
set -e
cd "$(dirname "$0")/.."
npm run build
cd dist
rm -rf .git
git init -q && git checkout -q -b gh-pages
git -c user.name="Siwoo Youn" -c user.email="323488505+sk8er325@users.noreply.github.com" add -A
git -c user.name="Siwoo Youn" -c user.email="323488505+sk8er325@users.noreply.github.com" commit -q -m "deploy $(date +%Y-%m-%d_%H:%M)"
git push -f https://github.com/sk8er325/sk8er325.github.io.git gh-pages:gh-pages
rm -rf .git
echo "deployed → https://sk8er325.github.io/"
