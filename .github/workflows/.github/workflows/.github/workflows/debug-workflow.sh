#!/bin/bash

echo "🔍 Debugging GitHub Actions Setup"
echo "================================="

echo "1. Checking current directory:"
pwd
ls -la

echo ""
echo "2. Checking package.json:"
if [ -f "package.json" ]; then
  cat package.json
else
  echo "❌ package.json not found!"
fi

echo ""
echo "3. Checking Node.js availability:"
if command -v node &> /dev/null; then
  echo "✅ Node.js: $(node --version)"
else
  echo "❌ Node.js not installed"
fi

if command -v npm &> /dev/null; then
  echo "✅ npm: $(npm --version)"
else
  echo "❌ npm not installed"
fi

echo ""
echo "4. Checking workflow files:"
if [ -d ".github/workflows" ]; then
  find .github/workflows -name "*.yml" -o -name "*.yaml" | while read file; do
    echo "📄 $file"
    head -20 "$file"
    echo ""
  done
else
  echo "❌ No .github/workflows directory"
fi

echo ""
echo "5. Testing with minimal workflow:"
cat > .github/workflows/test.yml << 'EOF'
name: Test Workflow
on: [workflow_dispatch]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Hello World"
      - run: node --version || echo "Node not found"
EOF

echo "✅ Created test workflow"
echo "Go to GitHub → Actions → Test Workflow → Run workflow"
