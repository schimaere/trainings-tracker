# Training Tracker

A Next.js application for tracking fitness metrics and nutrition with Google authentication and PWA support.

## Features

- **Body Metrics Tracking**: Track weight and body fat percentage over time with visual charts
- **Nutrition Tracking**: Log meals and track calories, protein, carbs, and fat
- **Google Authentication**: Secure login with NextAuth
- **Multi-user Support**: Each user has their own isolated data
- **PWA Support**: Installable as a Progressive Web App for mobile use
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env.local` and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:

   - `DATABASE_URL`: Your Neon Postgres connection string
   - `AUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `PORT`: Port for local development (defaults to 3002 if not specified)
   - `NEXTAUTH_URL`: Your app URL (should match the PORT, e.g., `http://localhost:3002`)
   - `GOOGLE_CLIENT_ID`: From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET`: From Google Cloud Console

3. **Set up the database:**

   - Go to your Neon dashboard and open the SQL Editor
   - Copy and paste the contents of `database/init.sql`
   - Execute the SQL script
   - You should see: "✅ All tables created successfully!"

4. **Set up Google OAuth:**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3002/api/auth/callback/google` (or use your custom PORT)
   - Copy Client ID and Client Secret to your `.env.local`

5. **Run the development server:**

   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3002](http://localhost:3002)** in your browser (or the port you specified in PORT).

## Database Schema

The app uses the following main tables:

- `users`: User accounts (managed by NextAuth)
- `accounts`: OAuth account connections
- `sessions`: User sessions
- `body_metrics`: Weight and body fat tracking
- `food_entries`: Nutrition/food logging

## PWA Setup

### Icons

You need to create PWA icons for the app to work properly:

- Create `public/icon-192.png` (192x192 pixels)
- Create `public/icon-512.png` (512x512 pixels)

You can use any image editor or online tools to create these icons. They should represent your app's branding.

### Installation

On mobile devices, you can install this app as a PWA:

- **iOS**: Use Safari's "Add to Home Screen" option
- **Android**: Chrome will prompt to install when visiting the site

## Tech Stack

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type safety
- **NextAuth v4**: Authentication
- **Neon Postgres**: Serverless PostgreSQL database
- **Tailwind CSS**: Styling
- **Recharts**: Data visualization
- **next-pwa**: PWA support
