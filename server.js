const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

// Other middleware
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, './'), {
  setHeaders: (res, filePath) => {
    // Set cache headers for static assets
    if (filePath.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Set proper MIME types
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Special handling for service worker
app.get('/service-worker.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, 'service-worker.js'));
});

// Serve manifest with proper headers
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Main route
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="A modern Progressive Web App">
        <title>My Progressive Web App</title>
        <link rel="manifest" href="/manifest.json">
        <link rel="icon" href="/assets/images/logo-72.png">
        <meta name="theme-color" content="#667eea">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px 20px;
            }
            
            header {
                text-align: center;
                margin-bottom: 50px;
            }
            
            .logo {
                width: 150px;
                height: 150px;
                margin: 0 auto 30px;
                background: white;
                border-radius: 30px;
                padding: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .logo img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            
            h1 {
                font-size: 3rem;
                margin-bottom: 15px;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            .subtitle {
                font-size: 1.5rem;
                opacity: 0.9;
                margin-bottom: 30px;
            }
            
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 30px;
                margin-bottom: 50px;
            }
            
            .feature-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                padding: 30px;
                border-radius: 20px;
                transition: transform 0.3s ease;
            }
            
            .feature-card:hover {
                transform: translateY(-10px);
            }
            
            .feature-icon {
                font-size: 50px;
                margin-bottom: 20px;
            }
            
            .feature-card h3 {
                font-size: 1.5rem;
                margin-bottom: 15px;
            }
            
            .buttons {
                display: flex;
                gap: 20px;
                justify-content: center;
                flex-wrap: wrap;
                margin-top: 40px;
            }
            
            button {
                background: white;
                color: #667eea;
                border: none;
                padding: 15px 30px;
                font-size: 1.1rem;
                border-radius: 50px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            button:hover {
                transform: translateY(-3px);
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
            }
            
            .install-btn {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
            }
            
            .status {
                margin-top: 30px;
                text-align: center;
                padding: 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                backdrop-filter: blur(5px);
            }
            
            @media (max-width: 768px) {
                .container {
                    padding: 20px 10px;
                }
                
                h1 {
                    font-size: 2rem;
                }
                
                .features {
                    grid-template-columns: 1fr;
                }
                
                .buttons {
                    flex-direction: column;
                    align-items: center;
                }
                
                button {
                    width: 100%;
                    max-width: 300px;
                    justify-content: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <div class="logo">
                    <img src="/assets/images/logo-192.png" alt="App Logo">
                </div>
                <h1>My Progressive Web App</h1>
                <p class="subtitle">Fast, Reliable & Installable</p>
            </header>
            
            <div class="features">
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>Instant Loading</h3>
                    <p>App loads instantly, even on flaky networks or offline</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3>Installable</h3>
                    <p>Add to home screen and use like a native app</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔔</div>
                    <h3>Push Notifications</h3>
                    <p>Receive updates even when the app is closed</p>
                </div>
            </div>
            
            <div class="buttons">
                <button onclick="installPWA()" class="install-btn" id="installButton">
                    📲 Install App
                </button>
                <button onclick="sendNotification()">
                    🔔 Test Notification
                </button>
                <button onclick="clearCache()">
                    🗑️ Clear Cache
                </button>
            </div>
            
            <div class="status">
                <p id="connectionStatus">Checking connection...</p>
                <p id="serviceWorkerStatus">Checking Service Worker...</p>
            </div>
        </div>

        <script>
            // Service Worker Registration
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/service-worker.js')
                        .then(registration => {
                            console.log('ServiceWorker registered: - server.js:283', registration);
                            document.getElementById('serviceWorkerStatus').textContent = 
                                '✅ Service Worker Registered (v' + CACHE_NAME + ')';
                            
                            // Check for updates
                            registration.addEventListener('updatefound', () => {
                                const newWorker = registration.installing;
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                        console.log('New content available! - server.js:292');
                                        showUpdateNotification();
                                    }
                                });
                            });
                        })
                        .catch(error => {
                            console.error('ServiceWorker registration failed: - server.js:299', error);
                            document.getElementById('serviceWorkerStatus').textContent = 
                                '❌ Service Worker Registration Failed';
                        });
                });
            } else {
                document.getElementById('serviceWorkerStatus').textContent = 
                    '❌ Service Worker Not Supported';
            }

            // Network Status
            function updateNetworkStatus() {
                const status = navigator.onLine ? '✅ Online' : '❌ Offline';
                document.getElementById('connectionStatus').textContent = status;
            }
            
            window.addEventListener('online', updateNetworkStatus);
            window.addEventListener('offline', updateNetworkStatus);
            updateNetworkStatus();

            // PWA Installation
            let deferredPrompt;
            const installButton = document.getElementById('installButton');
            
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                installButton.style.display = 'flex';
                
                installButton.addEventListener('click', () => {
                    installButton.style.display = 'none';
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted install - server.js:333');
                        } else {
                            console.log('User dismissed install - server.js:335');
                        }
                        deferredPrompt = null;
                    });
                });
            });

            function installPWA() {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        console.log(choiceResult.outcome === 'accepted - server.js:346' ? 
                            'User accepted install' : 'User dismissed install');
                        deferredPrompt = null;
                    });
                } else {
                    alert('Installation is not available or already installed');
                }
            }

            // Send Test Notification
            async function sendNotification() {
                if (!('Notification' in window)) {
                    alert('This browser does not support notifications');
                    return;
                }
                
                if (Notification.permission === 'granted') {
                    new Notification('Test Notification', {
                        body: 'This is a test notification from your PWA',
                        icon: '/assets/images/logo-72.png'
                    });
                } else if (Notification.permission !== 'denied') {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        sendNotification();
                    }
                }
            }

            // Clear Cache
            async function clearCache() {
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(
                        cacheNames.map(cacheName => caches.delete(cacheName))
                    );
                    alert('Cache cleared! The page will reload.');
                    window.location.reload();
                } else {
                    alert('Cache API not supported');
                }
            }

            // Update Notification
            function showUpdateNotification() {
                if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                }
            }

            // Periodic Sync
            if ('periodicSync' in navigator && 'serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.periodicSync.register('update-content', {
                        minInterval: 24 * 60 * 60 * 1000 // 24 hours
                    });
                });
            }
        </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'offline.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`
    🚀 Server running on port ${PORT}
    📱 PWA available at http://localhost:${PORT}
    🔧 Service Worker registered at /service-worker.js
    📄 Manifest at /manifest.json
  `);
});

module.exports = app;