# Developer Setup Guide

## Quick Start

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd yodoo-rebuild
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   # Copy the example file
   cp .env.example .env.local

   # Generate secure keys
   node scripts/generate-env-keys.js

   # Edit .env.local with your own API keys
   nano .env.local
   ```

3. **Required API Keys:**

   - Get your own Supabase project credentials
   - Get API keys from AI providers you want to use
   - Generate new CSRF_SECRET and ENCRYPTION_KEY (never share these!)

4. **Start development server:**
   ```bash
   pnpm dev
   ```

## Troubleshooting

### Authentication Issues

- Clear browser cookies and cache
- Try incognito/private mode
- Disable browser extensions temporarily
- Ensure you're using your own environment variables

### Hydration Errors

- Disable browser extensions (they add `bis_` attributes)
- Clear browser cache completely
- Try a different browser

### Package Manager Issues

- Delete `node_modules`, `.next`, and lock files
- Run `pnpm install` (not bun or npm)
- Ensure you're using Next.js canary version for nodeMiddleware

## Environment Variables

**NEVER share these between developers:**

- `CSRF_SECRET`
- `ENCRYPTION_KEY`
- `SUPABASE_SERVICE_ROLE`

**Can be shared (but get your own for production):**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- AI provider API keys (get your own)

## Browser Extensions

Some browser extensions (especially password managers, ad blockers, or security tools) can interfere with the app by adding attributes to DOM elements. This causes hydration mismatches and pixelated UI.

**Solution:** Test in incognito mode or disable extensions temporarily.
