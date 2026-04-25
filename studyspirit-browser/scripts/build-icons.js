/**
 * Build-time script: converts logo.png → icon.ico (Windows) + multiple PNGs
 * Run: node scripts/build-icons.js
 */
const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const SRC  = path.join(__dirname, '../assets/icon.png');
const DEST = path.join(__dirname, '../assets');

async function run() {
  console.log('Building icons from', SRC);

  // Generate sized PNGs for different uses
  const sizes = [16, 32, 48, 64, 128, 256, 512];
  const pngBuffers = [];

  for (const size of sizes) {
    const buf = await sharp(SRC)
      .resize(size, size, { fit: 'contain', background: { r: 10, g: 10, b: 26, alpha: 1 } })
      .png()
      .toBuffer();

    pngBuffers.push({ size, buf });
    console.log(`  ✅ ${size}x${size} PNG generated`);
  }

  // Save 256x256 as icon-256.png (used by electron-builder for .ico on Windows)
  const icon256 = pngBuffers.find(b => b.size === 256);
  fs.writeFileSync(path.join(DEST, 'icon-256.png'), icon256.buf);

  // Save 512x512 as the main icon.png (already copied, just confirm)
  const icon512 = pngBuffers.find(b => b.size === 512);
  fs.writeFileSync(path.join(DEST, 'icon-512.png'), icon512.buf);

  // Generate a tray icon (32x32)
  const icon32 = pngBuffers.find(b => b.size === 32);
  fs.writeFileSync(path.join(DEST, 'tray-icon.png'), icon32.buf);

  console.log('\n✅ All icons generated in assets/');
  console.log('   Note: For a proper .ico file on Windows, use a tool like');
  console.log('   https://convertio.co/png-ico/ to convert assets/icon-256.png → assets/icon.ico');
  console.log('   Then place icon.ico in assets/ before running npm run build:win');
}

run().catch(console.error);
