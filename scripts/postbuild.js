import fs from 'fs';
import path from 'path';

console.log('Starting postbuild process...');

// Helper function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // Check if dist directory exists
  if (!fs.existsSync('dist')) {
    console.error('dist directory not found. Please run "vite build" first.');
    process.exit(1);
  }

  // Check if required files exist
  if (!fs.existsSync('dist/index.html')) {
    console.error('dist/index.html not found. Build may have failed.');
    process.exit(1);
  }

  if (!fs.existsSync('dist/assets')) {
    console.error('dist/assets directory not found. Build may have failed.');
    process.exit(1);
  }

  // Create admin directory
  console.log('Creating dist/admin directory...');
  if (!fs.existsSync('dist/admin')) {
    fs.mkdirSync('dist/admin', { recursive: true });
  }
  console.log('Created dist/admin directory');

  // Copy index.html
  console.log('Copying index.html...');
  fs.copyFileSync('dist/index.html', 'dist/admin/index.html');
  console.log('Copied index.html');

  // Remove existing assets if present and copy new ones
  if (fs.existsSync('dist/admin/assets')) {
    console.log('Removing existing assets directory...');
    fs.rmSync('dist/admin/assets', { recursive: true, force: true });
  }
  
  console.log('Copying assets directory...');
  copyDir('dist/assets', 'dist/admin/assets');
  console.log('Copied assets directory');

  // Copy optional files if they exist
  if (fs.existsSync('dist/firebase-messaging-sw.js')) {
    fs.copyFileSync('dist/firebase-messaging-sw.js', 'dist/admin/firebase-messaging-sw.js');
    console.log('Copied firebase-messaging-sw.js');
  }

  if (fs.existsSync('dist/logo.svg')) {
    fs.copyFileSync('dist/logo.svg', 'dist/admin/logo.svg');
    console.log('Copied logo.svg');
  }

  // Fix asset paths in admin index.html
  console.log('Fixing asset paths...');
  const indexContent = fs.readFileSync('dist/admin/index.html', 'utf8');
  const fixedContent = indexContent.replace(/\/admin\/assets\//g, './assets/');
  fs.writeFileSync('dist/admin/index.html', fixedContent);
  console.log('Fixed asset paths in admin/index.html');

  console.log('Postbuild process completed successfully!');
} catch (error) {
  console.error('Error during postbuild:', error.message);
  process.exit(1);
}
