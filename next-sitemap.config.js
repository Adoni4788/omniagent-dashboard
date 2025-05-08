/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://omniagent-dashboard.example.com',
  generateRobotsTxt: true,
  // Optional: Generate a separate robots.txt file for disallowing paths
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/settings/', '/console/'],
      },
    ],
  },
  // Exclude pages like login, auth, etc. from sitemap
  exclude: ['/settings/*', '/console/*', '/api/*', '/auth/*'],
  // Generate sitemap dynamically
  generateIndexSitemap: false,
} 