/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://makeurfolio.com',
  generateRobotsTxt: true,
  exclude: ['/dashboard', '/dashboard/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/dashboard", "/api/", "/api/auth/"] },
    ],
    additionalSitemaps: [],
  },
}