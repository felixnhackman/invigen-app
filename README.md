# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Changing the logo

The logo is used in three places. Use the same image (or different ones) as needed:

| Where it appears | File to replace |
|------------------|-----------------|
| **Navbar** (top of the site) | `src/assets/logo.png` — replace with your logo (keep the name `logo.png` or update the import in `src/components/Navbar.jsx`). |
| **Browser tab (favicon)** | `src/assets/mylogo.png` — replace with your icon, or change the link in `index.html` (line 6) to point to another file. |
| **PWA / Install icon** (Start Menu, app window, “Add to Home Screen”) | `public/logo.png` — replace with your logo. For best install icons use a square image; 192×192 or 512×512 px works well. |

**One logo everywhere:** Replace all three with the same file (or keep `logo.png` in both `src/assets/` and `public/` in sync). Then run `npm run build` again so the PWA uses the new icon.

## PWA (Progressive Web App)

The app is set up as a PWA so users can install it and use it offline where possible.

- **Manifest**: App name (Invigen), theme color, standalone display, icons.
- **Service worker**: Auto-update; caches JS, CSS, HTML, and images. Supabase API responses use a NetworkFirst cache.
- **Icons**: `public/logo.png` is used for install and splash. For best results, add `public/icon-192.png` (192×192) and `public/icon-512.png` (512×512) and update `vite.config.js` manifest icons to use them.

After `npm run build`, deploy over HTTPS; then “Install” / “Add to Home Screen” will be available in supported browsers.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
