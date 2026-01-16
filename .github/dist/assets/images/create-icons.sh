#!/bin/bash
# File: create-icons.sh
# Quick icon generation using ImageMagick

echo "Creating PWA icons..."

# Create images directory
mkdir -p dist/assets/images

# Colors
PRIMARY="#4361ee"
SECONDARY="#7209b7"
ACCENT="#f72585"
WHITE="#ffffff"

# Function to create icon
create_icon() {
  size=$1
  name=$2
  echo "Creating $name ($size x $size)"
  
  # Create gradient background
  convert -size ${size}x${size} \
    gradient:"$PRIMARY"-"$SECONDARY" \
    /tmp/gradient.png
  
  # Create accent circle
  circle_size=$((size / 3))
  convert -size ${size}x${size} xc:none \
    -fill "$ACCENT" \
    -draw "circle $((size/2)),$((size/2)) $((size/2)),$((circle_size/2+size/2))" \
    /tmp/circle.png
  
  # Combine gradient and circle
  composite /tmp/circle.png /tmp/gradient.png /tmp/combined.png
  
  # Add text/logo
  convert /tmp/combined.png \
    -fill "$WHITE" \
    -pointsize $((size/3)) \
    -font Arial \
    -gravity center \
    -draw "text 0,0 'PW'" \
    "dist/assets/images/$name"
}

# Generate standard PWA icons
create_icon 72 "icon-72.png"
create_icon 96 "icon-96.png"
create_icon 128 "icon-128.png"
create_icon 144 "icon-144.png"
create_icon 152 "icon-152.png"
create_icon 192 "icon-192.png"
create_icon 384 "icon-384.png"
create_icon 512 "icon-512.png"

# Generate Apple touch icons
create_icon 180 "apple-touch-icon.png"
create_icon 167 "apple-touch-icon-167x167.png"
create_icon 152 "apple-touch-icon-152x152.png"
create_icon 120 "apple-touch-icon-120x120.png"

# Generate favicons
create_icon 16 "favicon-16x16.png"
create_icon 32 "favicon-32x32.png"
create_icon 48 "favicon-48x48.png"

# Copy 32x32 as favicon.ico
cp "dist/assets/images/favicon-32x32.png" "dist/assets/images/favicon.ico"

# Create fallback image
convert -size 800x600 \
  gradient:"$PRIMARY"-"$SECONDARY" \
  -fill "$WHITE" \
  -pointsize 48 \
  -font Arial \
  -gravity center \
  -draw "text 0,0 'Image Not Available'" \
  "dist/assets/images/fallback.jpg"

# Create screenshot placeholder
convert -size 1280x720 \
  gradient:"$PRIMARY"-"$SECONDARY" \
  -fill "$ACCENT" \
  -stroke "$WHITE" \
  -strokewidth 2 \
  -draw "roundrectangle 100,100 1180,620 20,20" \
  -fill "$WHITE" \
  -pointsize 32 \
  -font Arial \
  -gravity center \
  -draw "text 0,0 'App Screenshot'" \
  "dist/assets/images/screenshot.png"

echo "✅ All icons created successfully!"
