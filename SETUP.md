# Quick Setup Guide

## 1. Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Database - Get from your Neon dashboard
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# NextAuth - Generate with: openssl rand -base64 32
AUTH_SECRET=your_generated_secret_here

# Port for local development (defaults to 3002 if not specified)
PORT=3002

# Your app URL (should match the PORT above)
NEXTAUTH_URL=http://localhost:3002

# Google OAuth - From Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 2. Database Setup

Run the SQL schema in your Neon Postgres database:

1. Go to your Neon dashboard
2. Open the SQL Editor
3. Open `database/init.sql` from this project
4. Copy the entire contents and paste into the Neon SQL Editor
5. Click "Run" or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)
6. You should see: "✅ All tables created successfully!"

## 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API" (or "Google Identity API")
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen if prompted
6. Set application type to "Web application"
7. Add authorized redirect URI: `http://localhost:3002/api/auth/callback/google` (or use your custom PORT)
8. Copy the Client ID and Client Secret to your `.env.local`

## 4. PWA Icons

Create two icon files:

- `public/icon-192.png` (192x192 pixels)
- `public/icon-512.png` (512x512 pixels)

You can use any image editor or online icon generator.

## 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser (or the port you specified in PORT).

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Ensure your Neon database allows connections from your IP
- Check that SSL mode is set correctly

### Authentication Issues

- Verify Google OAuth credentials are correct
- Check that redirect URI matches exactly
- Ensure `AUTH_SECRET` is set

### PWA Not Working

- PWA is disabled in development mode
- Build for production: `npm run build && npm start`
- Ensure icons are present in `public/` directory
