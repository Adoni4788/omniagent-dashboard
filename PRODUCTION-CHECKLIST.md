# OmniAgent Production Deployment Checklist

Use this checklist to ensure your OmniAgent deployment is production-ready. Check off each item as you complete it.

## 1. Supabase Configuration

- [ ] **Database Schema**
  - [ ] Run `scripts/supabase-setup.sql` in the SQL Editor
  - [ ] Verify all tables were created successfully
  - [ ] Confirm RLS policies are enabled and working
  - [ ] Test queries with different user contexts to verify RLS

- [ ] **Authentication**
  - [ ] Configure Site URL in Supabase Auth settings
  - [ ] Set up proper redirect URLs
  - [ ] Test login flow
  - [ ] Test signup flow
  - [ ] Test magic link flow
  - [ ] Test session persistence

- [ ] **Realtime**
  - [ ] Enable Realtime for the `tasks` table
  - [ ] Enable Realtime for the `steps` table
  - [ ] Enable Realtime for the `user_settings` table
  - [ ] Test that updates propagate in real-time

## 2. Environment Variables

- [ ] **Local Environment**
  - [ ] `.env.local` has all required variables
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` is set correctly
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` is set correctly
  - [ ] `NEXT_PUBLIC_USE_MOCK_DATA` is set to `false`

- [ ] **Production Environment (Vercel)**
  - [ ] All environment variables are configured in Vercel dashboard
  - [ ] Variables are the production values (not development)
  - [ ] Consider using Vercel's environment variable encryption for sensitive values

## 3. Build and Test

- [ ] **Local Production Build**
  - [ ] Run `npm run build` locally to verify it builds successfully
  - [ ] Test the production build with `npm start`
  - [ ] Check for any console errors
  - [ ] Verify all pages load correctly
  - [ ] Test all core functionality

- [ ] **Performance**
  - [ ] Run `npm run analyze` to check bundle size
  - [ ] Optimize large dependencies if necessary
  - [ ] Check for unnecessary re-renders
  - [ ] Verify API response times are acceptable

## 4. Security

- [ ] **Secure Headers**
  - [ ] Content-Security-Policy is configured
  - [ ] X-Frame-Options is set to DENY
  - [ ] X-Content-Type-Options is set to nosniff
  - [ ] Referrer-Policy is configured properly

- [ ] **Input Validation**
  - [ ] All form inputs are validated
  - [ ] API requests validate parameters
  - [ ] Zod schemas are used consistently

- [ ] **Authentication Flows**
  - [ ] Protected routes are properly secured
  - [ ] Authorization checks for different security levels
  - [ ] Session expiration and refresh mechanisms work

## 5. Error Handling

- [ ] **Client-Side Errors**
  - [ ] Global error boundary is in place
  - [ ] `useErrorHandler` hook is used for data operations
  - [ ] User-friendly error messages are shown
  - [ ] Critical errors don't break the application

- [ ] **Server-Side Errors**
  - [ ] API endpoints have proper error handling
  - [ ] Error logging is in place
  - [ ] Errors provide enough context for debugging

## 6. Monitoring & Logging

- [ ] **Analytics**
  - [ ] Set up Vercel Analytics or similar
  - [ ] Configure important events to track
  - [ ] Test that analytics are recording correctly

- [ ] **Error Tracking**
  - [ ] Consider integrating Sentry, LogRocket, or similar services
  - [ ] Configure error grouping and notifications
  - [ ] Test error reporting

## 7. Deployment

- [ ] **CI/CD**
  - [ ] Set up CI/CD pipeline if not using Vercel's automatic deployment
  - [ ] Configure build checks

- [ ] **Domain Configuration**
  - [ ] Set up custom domain in Vercel
  - [ ] Configure SSL certificate
  - [ ] Set up proper redirects (www vs non-www, etc.)

- [ ] **CDN and Caching**
  - [ ] Configure appropriate caching headers
  - [ ] Test asset loading performance

## 8. Post-Deployment Verification

- [ ] **Functionality Check**
  - [ ] Verify all core features work in production
  - [ ] Test on different browsers
  - [ ] Test on mobile devices

- [ ] **Performance Check**
  - [ ] Run Lighthouse audit
  - [ ] Verify Time to First Byte (TTFB)
  - [ ] Verify First Contentful Paint (FCP)

## 9. Backup and Rollback Plan

- [ ] **Database Backup**
  - [ ] Ensure Supabase backups are enabled
  - [ ] Document backup restoration process

- [ ] **Version Rollback**
  - [ ] Document how to rollback to previous version
  - [ ] Test rollback procedure

## 10. Documentation

- [ ] **User Documentation**
  - [ ] Create basic user guide if needed
  - [ ] Document any known limitations

- [ ] **Developer Documentation**
  - [ ] All major components and flows are documented
  - [ ] Setup and deployment process is documented
  - [ ] API endpoints and data models are documented 