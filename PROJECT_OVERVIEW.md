# Project Overview

`feedback.resonite.com` is an experimental Creative Day project by ProbablePrime to explore minimal, multi-dimensional feedback systems for Resonite.

## Architecture & Tech Stack

- **Frontend / Forms Engine**: Uses `formsmd` (`Formsmd` library) to dynamically render interactive forms from Markdown definitions (`.md` files) loaded client-side.
- **Styling**: Vite, Water.css (`dark.css`), and custom CSS (`src/style.css`).
- **Backend / Routing**: Cloudflare Worker using **Hono** (`hono`) for routing (`/` and `/api/:formType`) and Server-Side Rendering (SSR) via `hono/jsx` and `vite-ssr-components`.
- **Deployment & Assets**: Cloudflare Workers configured via `wrangler.toml` with static asset binding (`[assets] directory = "./dist"`), `@cloudflare/vite-plugin`, and `compatibility_flags = ["nodejs_compat"]`.

## Key Files & Directories

- `src/backend/main.js`: Cloudflare Worker entry point using Hono.
- `src/backend/routes/pages.tsx`: Page routes (e.g., `/` rendering the layout and form components via `hono/jsx`).
- `src/backend/routes/api.js`: API routes handling form submissions (`/api/:formType`).
- `src/backend/components/layout.tsx` & `form.tsx`: Hono JSX components for the HTML layout and form container target.
- `src/frontend/main.js`: Client-side entry point initializing `Formsmd` on `.formsMDTarget` elements.
- `public/forms/`: Markdown form definitions (`LANDING.md`, `BUG.md`, `BUG_STAGING.md`).
- `vite.config.js`: Vite configuration with Cloudflare and SSR plugins.
- `wrangler.toml`: Cloudflare Workers configuration.
- `package.json`: Project dependencies (`formsmd`, `hono`, `vite-ssr-components`, `@cloudflare/vite-plugin`, `vite`, `wrangler`).
- `README.md`: Project description, goals, diagram, and dog-walk tracking.


