# Medicare Web Admin

A React-based admin panel for clinic management system.

## Build Process

The project uses a custom build process to handle the `/admin` base path for Vercel deployment:

1. **Vite Build**: Creates the main build in `dist/`
2. **Postbuild Script**: 
   - Creates `dist/admin/` directory
   - Copies `index.html` and `assets/` to `dist/admin/`
   - Fixes asset paths from `/admin/assets/` to `./assets/`

## Deployment

The application is configured for deployment on Vercel with the following structure:

```
dist/
├── index.html          # Main entry point
├── assets/             # Main assets
└── admin/
    ├── index.html      # Admin entry point (with fixed asset paths)
    └── assets/         # Admin assets (copy of main assets)
```

## Configuration Files

- `vercel.json`: Vercel deployment configuration
- `public/_redirects`: SPA routing rules
- `scripts/fix-assets.js`: Asset path fixing script

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Access

- Development: `http://localhost:3000/admin`
- Production: `https://your-domain.vercel.app/admin`

## Fullscreen/Black Screen Functionality

### Quick Commands (Browser Console)

Open your browser's developer tools (F12) and run these commands:

#### Make Screen Black
```javascript
// Create black overlay
const overlay = document.createElement('div');
overlay.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000000;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
`;
overlay.innerHTML = '<div>Screen is now black</div>';
document.body.appendChild(overlay);
```

#### Remove Black Screen
```javascript
// Remove black overlay
const overlay = document.querySelector('div[style*="background-color: #000000"]');
if (overlay) overlay.remove();
```

#### Toggle Fullscreen
```javascript
// Toggle browser fullscreen
if (!document.fullscreenElement) {
  document.documentElement.requestFullscreen();
} else {
  document.exitFullscreen();
}
```

#### Dark Mode
```javascript
// Toggle dark mode
document.body.classList.toggle('dark-mode');
if (document.body.classList.contains('dark-mode')) {
  document.body.style.cssText = `
    background-color: #000000 !important;
    color: #ffffff !important;
  `;
} else {
  document.body.style.cssText = '';
}
```

### Bookmarklet (One-Click Solution)

Create a bookmark with this JavaScript code:

**Black Screen:**
```javascript
javascript:(function(){const o=document.createElement('div');o.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:9999;display:flex;align-items:center;justify-content:center;color:white;font-size:24px';o.innerHTML='<div>Screen is black</div>';document.body.appendChild(o);})();
```

**Fullscreen:**
```javascript
javascript:(function(){if(!document.fullscreenElement){document.documentElement.requestFullscreen()}else{document.exitFullscreen()}})();
```

### Keyboard Shortcuts

You can also use these browser shortcuts:
- **F11** - Toggle fullscreen
- **Ctrl+Shift+I** - Open developer tools
- **Ctrl+Shift+J** - Open console
