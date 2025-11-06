#!/bin/bash
set -e

echo "📊 Performance Measurement"
echo "=========================="
echo ""

REPORT_FILE="PERFORMANCE.md"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# 결과 파일 초기화
cat > $REPORT_FILE << EOF
# Performance Report

Generated: $TIMESTAMP

## Build Performance

EOF

# 1. 빌드 시간 측정
echo "⏱️  Measuring build time..."
echo ""

BUILD_START=$(date +%s)
pnpm build > /dev/null 2>&1
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

echo "Build time: ${BUILD_TIME}s"
echo "- Total build time: **${BUILD_TIME}s**" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 2. 번들 크기 측정
echo ""
echo "📦 Measuring bundle sizes..."
echo ""

echo "## Bundle Sizes" >> $REPORT_FILE
echo "" >> $REPORT_FILE

for pkg in packages/hooks packages/components packages/utils; do
  if [ -d "$pkg/dist" ]; then
    PKG_NAME=$(basename $pkg)
    SIZE=$(du -sh $pkg/dist | cut -f1)
    
    echo "- $PKG_NAME: $SIZE"
    echo "- **@frontend-toolkit/$PKG_NAME**: $SIZE" >> $REPORT_FILE
    
    # gzip 크기
    if command -v gzip &> /dev/null; then
      GZIP_SIZE=$(tar -czf - $pkg/dist 2>/dev/null | wc -c | awk '{print int($1/1024)"KB"}')
      echo "  (gzipped: $GZIP_SIZE)"
      echo "  - gzipped: $GZIP_SIZE" >> $REPORT_FILE
    fi
  fi
done

echo "" >> $REPORT_FILE

# 3. 타입 체크 시간
echo ""
echo "🔍 Measuring type check time..."
echo ""

TYPE_START=$(date +%s)
pnpm check-types > /dev/null 2>&1
TYPE_END=$(date +%s)
TYPE_TIME=$((TYPE_END - TYPE_START))

echo "Type check time: ${TYPE_TIME}s"
echo "## Type Check" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "- Type check time: **${TYPE_TIME}s**" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 4. 테스트 커버리지
echo ""
echo "🧪 Measuring test coverage..."
echo ""

if pnpm test --coverage --run > /dev/null 2>&1; then
  echo "## Test Coverage" >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  echo "Run \`pnpm test --coverage\` for detailed report" >> $REPORT_FILE
  echo "" >> $REPORT_FILE
fi

# 5. 의존성 크기
echo ""
echo "📦 Analyzing dependencies..."
echo ""

echo "## Dependencies" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if [ -d "node_modules" ]; then
  NODE_MODULES_SIZE=$(du -sh node_modules | cut -f1)
  echo "- node_modules size: **$NODE_MODULES_SIZE**" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# 결과 출력
echo ""
echo "✅ Measurement complete!"
echo ""
echo "📄 Report saved to: $REPORT_FILE"
echo ""
cat $REPORT_FILE
