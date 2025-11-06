#!/bin/bash

echo "🧹 Cleaning build artifacts..."
echo ""

# 빌드 파일 삭제
echo "📦 Removing dist folders..."
find packages apps -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true

echo "📦 Removing .next folders..."
find apps -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true

echo "📦 Removing out folders..."
find apps -name "out" -type d -exec rm -rf {} + 2>/dev/null || true

echo "📦 Removing build folders..."
find . -name "build" -type d -exec rm -rf {} + 2>/dev/null || true

# TypeScript 빌드 정보 삭제
echo "🔧 Removing TypeScript build info..."
find . -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true
find . -name "next-env.d.ts" -type f -delete 2>/dev/null || true

# Turbo 캐시 삭제
echo "⚡ Removing Turbo cache..."
rm -rf .turbo 2>/dev/null || true

# 테스트 커버리지 삭제
echo "🧪 Removing coverage..."
find . -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true

echo ""
echo "✅ Clean complete!"
echo ""
echo "💡 Tip: To also remove node_modules, run:"
echo "   rm -rf node_modules packages/*/node_modules apps/*/node_modules"
