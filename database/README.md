# Database Setup for Training Tracker

This directory contains SQL scripts for setting up the Training Tracker database in Neon Postgres.

## Quick Start

1. **Open Neon SQL Editor**

   - Go to your Neon dashboard
   - Select your project
   - Click on "SQL Editor"

2. **Run the initialization script**

   - Open `init.sql` from this directory
   - Copy the entire contents
   - Paste into the Neon SQL Editor
   - Click "Run" or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)

3. **Verify setup**
   - The script will automatically verify that all tables were created
   - You should see a success message: "✅ All tables created successfully!"

## What Gets Created

### NextAuth Tables

- `users` - User accounts
- `accounts` - OAuth provider connections
- `sessions` - User sessions
- `verification_tokens` - Email verification tokens

### Application Tables

- `body_metrics` - Weight and body fat percentage tracking
- `food_entries` - Nutrition and food logging

### Indexes

- Performance indexes on frequently queried columns
- Composite indexes for common query patterns

## Troubleshooting

### Tables Already Exist

The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times. It won't overwrite existing data.

### Permission Errors

Make sure your database user has CREATE TABLE and CREATE INDEX permissions.

### Connection Issues

Verify your `DATABASE_URL` is correct and your Neon database is accessible.

## Schema Details

- All tables use `TEXT` for IDs (UUIDs stored as strings)
- Foreign keys use `ON DELETE CASCADE` for data integrity
- Timestamps use `CURRENT_TIMESTAMP` for automatic date tracking
- Decimal types are used for precise numeric values (weight, calories, macros)
