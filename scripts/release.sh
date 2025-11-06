#!/bin/bash
set -e

echo "🚀 Frontend Toolkit Release Process"
echo "===================================="
echo ""

# 1. 현재 버전 확인
echo "📦 Current versions:"
pnpm --filter "@frontend-toolkit/*" exec node -p "require('./package.json').name + '@' + require('./package.json').version"
echo ""

# 2. Git 상태 확인
if [[ -n $(git status --porcelain) ]]; then
  echo "❌ Git working directory is not clean. Please commit or stash changes."
  exit 1
fi
echo "✅ Git working directory is clean"
echo ""

# 3. 최신 코드 가져오기
echo "📥 Pulling latest changes..."
git pull origin main
echo ""

# 4. 의존성 설치
echo "📦 Installing dependencies..."
pnpm install
echo ""

# 5. Lint 체크
echo "🔍 Running lint..."
pnpm lint
echo ""

# 6. 타입 체크
echo "🔍 Type checking..."
pnpm check-types
echo ""

# 7. 테스트
echo "🧪 Running tests..."
pnpm test
echo ""

# 8. 빌드 (시간 측정)
echo "⏱️  Building packages..."
time pnpm build
echo ""

# 9. 번들 크기 측정
echo "📊 Bundle size analysis:"
echo ""
for pkg in packages/hooks packages/components packages/utils; do
  if [ -d "$pkg/dist" ]; then
    echo "📦 $pkg:"
    du -sh $pkg/dist
    if command -v gzip &> /dev/null; then
      echo "   gzipped: $(tar -czf - $pkg/dist | wc -c | awk '{print int($1/1024)"KB"}')"
    fi
  fi
done
echo ""

# 10. Changeset 확인
echo "📝 Checking changesets..."
if ! pnpm changeset status; then
  echo ""
  echo "⚠️  No changesets found. Creating one..."
  pnpm changeset
fi
echo ""

# 11. 버전 업데이트
echo "🔼 Updating versions..."
pnpm changeset version
echo ""

# 12. 변경사항 커밋
echo "💾 Committing version changes..."
git add .
git commit -m "chore: version packages" || true
echo ""

# 13. 배포 확인
read -p "🚢 Ready to publish? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "📦 Publishing packages..."
  pnpm changeset publish
  
  echo "🏷️  Pushing tags..."
  git push --follow-tags
  
  echo ""
  echo "✅ Release complete! 🎉"
else
  echo "❌ Release cancelled"
  exit 1
fi
