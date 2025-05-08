# OmniAgent Deployment Guide

This document provides step-by-step instructions for deploying the OmniAgent dashboard to production.

## Prerequisites

- Node.js 18+ and npm installed
- A Supabase account and project
- A Vercel account (or other hosting platform of your choice)
- Git installed locally

## 1. Supabase Setup

### Database Setup

1. Create a new Supabase project from the [dashboard](https://app.supabase.io)
2. Go to the SQL Editor and run the database setup script from `scripts/supabase-setup.sql`
3. Verify the tables and policies were created correctly

### Auth Configuration

1. In the Supabase dashboard, navigate to Authentication → Settings
2. Configure Site URL to match your production domain
3. Set up redirect URLs for production
4. Enable Email auth provider and configure any additional providers (Google, GitHub, etc.)

### API Keys

Collect the following credentials from your Supabase project:
- Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
- Public (anon) key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`)

## 2. Environment Setup

Create a `.env.production` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## 3. Build and Test Locally

Test the production build locally before deploying:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the production server
npm start
```

Verify that:
- The application runs without errors
- Authentication works with Supabase
- Tasks and settings are being saved to the database
- No hydration warnings appear in the console

## 4. Deploy to Vercel

### Using the Vercel CLI

```bash
# Install Vercel CLI if you don't have it
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Using the Vercel Dashboard

1. Push your code to GitHub, GitLab, or Bitbucket
2. In the Vercel dashboard, click "New Project"
3. Import your repository
4. Configure the environment variables from your `.env.production` file
5. Deploy the project

## 5. Post-Deployment Verification

After deployment, verify:

1. Authentication flows (signup, login, magic link)
2. Task creation and management
3. Real-time updates via Supabase Realtime
4. Admin features (if applicable)
5. Mobile responsiveness

## 6. Enabling Realtime Features

1. In the Supabase dashboard, go to Database → Replication
2. Enable replication for the `tasks`, `steps`, and `user_settings` tables
3. Set the publication to include all changes (INSERT, UPDATE, DELETE)

## 7. Monitoring and Logging

### Vercel Analytics

Enable Vercel Analytics to monitor application performance:

1. In the Vercel dashboard, go to your project
2. Navigate to Settings → Analytics
3. Enable Analytics

### Error Tracking (Optional)

Consider integrating an error tracking service:

1. Create an account with Sentry, LogRocket, or similar service
2. Add their SDK to your project
3. Configure the SDK with your project keys

## 8. Regular Maintenance

- Keep dependencies updated with `npm audit` and `npm update`
- Monitor Supabase usage and billing
- Set up regular database backups
- Review application logs for errors

## Troubleshooting

### Authentication Issues
- Verify Site URL and redirect URLs in Supabase
- Check for CORS issues
- Ensure environment variables are correctly set

### Database Connection Issues
- Check RLS policies
- Verify API keys are correct
- Test database connection directly

### Hydration Errors
- Verify server and client render the same content
- Check for date formatting issues
- Ensure dynamic content has proper fallbacks

## Support

If you encounter issues during deployment, please:
1. Check the logs in Vercel Dashboard
2. Consult the Supabase documentation
3. Open an issue in the project repository 