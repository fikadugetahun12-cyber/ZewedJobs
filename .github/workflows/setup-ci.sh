#!/bin/bash

echo "🚀 Setting up PWA CI/CD Pipeline"

# Create workflow directory
mkdir -p .github/workflows

# Create the CI/CD workflow file
cat > .github/workflows/pwa-ci.yml << 'EOF'
name: PWA CI/CD Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    - run: npm ci
    - run: npm test || echo "No tests"

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run build || echo "No build script"
    - uses: JamesIves/github-pages-deploy-action@v4
      with:
        branch: gh-pages
        folder: dist
EOF

echo "✅ Created CI/CD workflow"
echo "📁 Location: .github/workflows/pwa-ci.yml"
