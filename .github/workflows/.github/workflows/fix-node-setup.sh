#!/bin/bash

echo "🔧 Fixing Node.js Setup Issues"
echo "================================"

# Fix 1: Ensure package.json exists
if [ ! -f "package.json" ]; then
    echo "📝 Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "pwa-project",
  "version": "1.0.0",
  "description": "Progressive Web Application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"No tests specified\" && exit 0",
    "build": "echo \"Building...\" && mkdir -p dist && cp -r *.js *.json *.html assets dist/ 2>/dev/null || true"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
EOF
    echo "✅ Created package.json"
fi

# Fix 2: Create essential files
echo "📁 Creating essential files..."

# Service Worker
if [ ! -f "service-worker.js" ]; then
    cat > service-worker.js << 'EOF'
// Service Worker for PWA
const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
EOF
    echo "✅ Created service-worker.js"
fi

# Server.js
if [ ! -f "server.js" ]; then
    cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, './')));

// Service Worker special handling
app.get('/service-worker.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, 'service-worker.js'));
});

// Manifest
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Main route
app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My PWA</title>
    <link rel="manifest" href="/manifest.json">
    <style>
      body { font-family: Arial; padding: 20px; text-align: center; }
    </style>
  </head>
  <body>
    <h1>🚀 PWA Working!</h1>
    <p>Node.js setup fixed successfully!</p>
  </body>
  </html>
  `);
});

app.listen(PORT, () => {
  console.log(\`✅ Server running on port \${PORT}\`);
});
EOF
    echo "✅ Created server.js"
fi

# Manifest
if [ ! -f "manifest.json" ]; then
    cat > manifest.json << 'EOF'
{
  "name": "My PWA",
  "short_name": "PWA",
  "description": "Progressive Web Application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "icons": []
}
EOF
    echo "✅ Created manifest.json"
fi

# Create assets directory
mkdir -p assets/images

echo ""
echo "✅ Setup completed!"
echo "📁 Files created:"
ls -la *.js *.json

echo ""
echo "🚀 To test locally:"
echo "1. npm install"
echo "2. npm start"
echo "3. Open http://localhost:3000"
