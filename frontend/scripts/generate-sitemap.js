const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DOMAIN = 'https://best-ai-directory.eu'; // Replace with your domain
const API_URL = process.env.SERVER_API_URL || 'http://backend:5000/api';

async function generateSitemap() {
  try {
    // Fetch all tools and categories
    const [toolsResponse, categoriesResponse] = await Promise.all([
      axios.get(`${API_URL}/tools?limit=1000`),
      axios.get(`${API_URL}/categories`)
    ]);

    const tools = toolsResponse.data.tools;
    const categories = categoriesResponse.data.categories;

    // Start XML content
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static routes -->
  <url>
    <loc>${DOMAIN}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${DOMAIN}/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${DOMAIN}/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Category pages -->
  ${categories.map(category => `
  <url>
    <loc>${DOMAIN}/category/${encodeURIComponent(category.name.toLowerCase().replace(/ /g, '-'))}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}

  <!-- Tool pages -->
  ${tools.map(tool => `
  <url>
    <loc>${DOMAIN}/tool/${encodeURIComponent(tool.url || tool.title.toLowerCase().replace(/ /g, '-'))}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

    // Format the XML
    sitemap = sitemap.replace(/^\s+/gm, '').replace(/\n+/g, '\n');

    // Write to public directory
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap(); 