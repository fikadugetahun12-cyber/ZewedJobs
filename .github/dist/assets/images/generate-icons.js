// File: scripts/generate-icons.js
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Configuration
const ICON_CONFIG = {
  // PWA recommended icon sizes
  sizes: [
    { size: 72, name: 'icon-72.png' },
    { size: 96, name: 'icon-96.png' },
    { size: 128, name: 'icon-128.png' },
    { size: 144, name: 'icon-144.png' },
    { size: 152, name: 'icon-152.png' },
    { size: 192, name: 'icon-192.png' },
    { size: 384, name: 'icon-384.png' },
    { size: 512, name: 'icon-512.png' },
  ],
  
  // Apple touch icon sizes
  appleSizes: [
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 167, name: 'apple-touch-icon-167x167.png' },
    { size: 152, name: 'apple-touch-icon-152x152.png' },
    { size: 120, name: 'apple-touch-icon-120x120.png' },
  ],
  
  // Favicon sizes
  faviconSizes: [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
  ],
  
  // Splash screens (iOS)
  splashScreens: [
    { width: 640, height: 1136, name: 'splash-640x1136.png' },
    { width: 750, height: 1334, name: 'splash-750x1334.png' },
    { width: 828, height: 1792, name: 'splash-828x1792.png' },
    { width: 1125, height: 2436, name: 'splash-1125x2436.png' },
    { width: 1242, height: 2688, name: 'splash-1242x2688.png' },
    { width: 1536, height: 2048, name: 'splash-1536x2048.png' },
    { width: 1668, height: 2224, name: 'splash-1668x2224.png' },
    { width: 2048, height: 2732, name: 'splash-2048x2732.png' },
  ],
  
  // Colors
  colors: {
    primary: '#4361ee',
    secondary: '#7209b7',
    accent: '#f72585',
    background: '#ffffff',
  }
};

function generateIcon(size, name) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, ICON_CONFIG.colors.primary);
  gradient.addColorStop(1, ICON_CONFIG.colors.secondary);
  
  // Draw background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw accent circle
  ctx.fillStyle = ICON_CONFIG.colors.accent;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw letter/logo (simplified)
  ctx.fillStyle = ICON_CONFIG.colors.background;
  ctx.font = `bold ${size / 3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PW', size / 2, size / 2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join('dist/assets/images', name);
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Generated: ${name} (${size}x${size})`);
}

function generateSplashScreen(width, height, name) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, ICON_CONFIG.colors.primary);
  gradient.addColorStop(1, ICON_CONFIG.colors.secondary);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // App icon in center
  const iconSize = Math.min(width, height) / 3;
  ctx.fillStyle = ICON_CONFIG.colors.accent;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, iconSize / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // App name
  ctx.fillStyle = ICON_CONFIG.colors.background;
  ctx.font = `bold ${iconSize / 2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('My PWA', width / 2, height / 2 + iconSize);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join('dist/assets/images', name);
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Generated: ${name} (${width}x${height})`);
}

// Generate all icons
function generateAllIcons() {
  // Create directories
  const imagesDir = 'dist/assets/images';
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  console.log('Generating PWA icons...');
  
  // Generate standard icons
  ICON_CONFIG.sizes.forEach(icon => {
    generateIcon(icon.size, icon.name);
  });
  
  // Generate Apple touch icons
  ICON_CONFIG.appleSizes.forEach(icon => {
    generateIcon(icon.size, icon.name);
  });
  
  // Generate favicons
  ICON_CONFIG.faviconSizes.forEach(icon => {
    generateIcon(icon.size, icon.name);
  });
  
  // Generate splash screens (optional)
  if (process.argv.includes('--splash')) {
    ICON_CONFIG.splashScreens.forEach(screen => {
      generateSplashScreen(screen.width, screen.height, screen.name);
    });
  }
  
  // Create favicon.ico (requires sharp or other library)
  createFaviconIco();
  
  console.log('✅ All icons generated successfully!');
}

// Create favicon.ico (multi-size)
function createFaviconIco() {
  // Note: This requires a proper ICO generator library
  // For simplicity, we'll just copy the 32x32 favicon
  const favicon32 = path.join('dist/assets/images', 'favicon-32x32.png');
  const faviconIco = path.join('dist/assets/images', 'favicon.ico');
  
  if (fs.existsSync(favicon32)) {
    fs.copyFileSync(favicon32, faviconIco);
    console.log('Created: favicon.ico (from favicon-32x32.png)');
  }
}

// Run if called directly
if (require.main === module) {
  generateAllIcons();
}

module.exports = { generateAllIcons };
