# Deployment Guide (`DEPLOY.md`)

This guide outlines the steps required to prepare, instantiate necessary Cloudflare resources, configure secrets, and deploy the **feedback.resonite.com** application to Cloudflare Workers (`workers.dev`).

---

## Prerequisites

1. Ensure you have Node.js installed.
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Authenticate with Cloudflare via Wrangler:
   ```bash
   npx wrangler login
   ```
   *Verify your active account with:*
   ```bash
   npx wrangler whoami
   ```

---

## Step 1: Instantiate Cloudflare Resources

Before deploying, you must create the required Cloudflare resource bindings specified in `wrangler.toml`.

### 1. D1 Database (`DB`)
Create the D1 SQLite database for storing text feedback:
```bash
npx wrangler d1 create feedback-db
```
*After running this command, copy the generated `database_id` from the output and update `wrangler.toml` under `[[d1_databases]]`:*
```toml
[[d1_databases]]
binding = "DB"
database_name = "feedback-db"
database_id = "<YOUR_GENERATED_DATABASE_ID>"
```

### 2. KV Namespace (`RATE_LIMIT_KV`)
Create the KV namespace used for rate limiting:
```bash
npx wrangler kv namespace create RATE_LIMIT_KV
```
*If you want a preview/dev namespace as well, you can create one. Copy the returned `id` and update `wrangler.toml` under `[[kv_namespaces]]`:*
```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "<YOUR_GENERATED_KV_ID>"
```

### 3. R2 Bucket (`BUCKET`)
Create the R2 bucket for file attachments:
```bash
npx wrangler r2 bucket create feedback-resonite-files
```

### 4. Analytics Engine Dataset (`SCORE`)
The Analytics Engine dataset (`SCORE`) is dynamically bound and automatically initialized upon your first analytics event or deployment via the `[[analytics_engine_datasets]]` configuration block in `wrangler.toml`. No separate manual creation command is strictly required.

---

## Step 2: Configure Secrets

The application requires specific secrets for interacting with GitHub, Cloudflare Analytics, and Turnstile bot protection. Set these using Wrangler:

1. **GitHub Personal Access Token** (with repo/issue creation permissions):
   ```bash
   npx wrangler secret put GITHUB_TOKEN
   ```
2. **Cloudflare API Token** (with Account Analytics Read permissions):
   ```bash
   npx wrangler secret put API_TOKEN
   npx wrangler secret put ACCOUNT_ID
   ```
3. **Cloudflare Turnstile Secret Key**:
   ```bash
   npx wrangler secret put TURNSTILE_SECRET_KEY
   ```

*(Optional)* You can also verify your `ACCOUNT_ID` in `wrangler.toml` under `[vars]` if required by specific API integrations.

https://feedback-resonite-com.ydms.workers.dev/landing
---

## Step 3: Build and Test Locally (Preview)

Before pushing to production/`workers.dev`, build the frontend assets and run the worker locally via Miniflare:
```bash
npm run preview
```
This builds the Vite frontend into `./dist` and spins up `wrangler dev`.

---

## Step 4: Deploy to Workers

Once resources and secrets are fully configured, run the deployment script:
```bash
npm run deploy
```
This script automatically executes `npm run build` (building Vite assets into `./dist`) and triggers `wrangler deploy` to publish your worker to your configured `workers.dev` endpoint.


https://feedback-resonite-com.ydms.workers.dev