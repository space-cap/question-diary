# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development Server
- `npm run dev` - Start Vite development server with HMR
- `npm run preview` - Preview production build locally

### Build and Testing
- `npm run build` - Build for production (runs TypeScript check + Vite build)
- `npm run lint` - Run ESLint on all TypeScript/React files

## Project Architecture

### Tech Stack
- **React 19.1+** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS 4.x** for styling (configured via Vite plugin)
- **ESLint** with TypeScript, React hooks, and React refresh rules

### Build Configuration
- **TypeScript**: Project uses project references (`tsconfig.json` -> `tsconfig.app.json` + `tsconfig.node.json`)
- **Vite**: Configured with React plugin and Tailwind CSS Vite plugin
- **ESLint**: Uses new flat config format with recommended TypeScript and React rules

### Source Structure
- `src/main.tsx` - Application entry point with React 18+ createRoot
- `src/App.tsx` - Main application component
- `src/index.css` - Global styles with Tailwind CSS import
- Entry point: `index.html` references `/src/main.tsx`

### Styling Approach
- **Tailwind CSS 4.x** configured via `@tailwindcss/vite` plugin
- Global styles imported via `@import "tailwindcss"` in `src/index.css`
- No traditional Tailwind config file - uses Vite plugin configuration

### TypeScript Configuration
- **Strict mode enabled** with additional linting rules
- **Module resolution**: bundler mode for Vite compatibility
- **JSX**: react-jsx transform (no React import needed in components)
- Build artifacts go to `./node_modules/.tmp/` to avoid conflicts

## Development Notes

### Key Dependencies
- Uses React 19.1+ (latest features available)
- Tailwind CSS 4.x with Vite integration (not traditional PostCSS setup)
- TypeScript with strict configuration and additional lint rules
- ESLint with React Hooks and React Refresh plugins

### Vite-Specific Features
- HMR (Hot Module Replacement) enabled for fast development
- TypeScript checking integrated into build process
- Tailwind CSS processed via Vite plugin (no separate build step needed)

### Code Style
- ESLint configured for TypeScript + React best practices
- React Hooks rules enforced
- React Refresh rules for proper HMR behavior