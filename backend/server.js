const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Store data in memory
let aiTools = [];

// Load data synchronously at startup
function loadData() {
  try {
    const dataPath = path.join(__dirname, 'data', 'transformed_aitools_with_descriptions_and_images.csv');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    
    // Use csv-parse to parse the CSV file
    const records = parse(fileContent, {
      columns: true, // Use the header row to create objects
      skip_empty_lines: true,
      trim: true
    });
    
    aiTools = records.filter(tool => tool.title); // Filter out empty rows
    
    console.log('Data loaded successfully');
    console.log('Total tools loaded:', aiTools.length);
  } catch (error) {
    console.error('Error loading data:', error);
    // Initialize with empty array if file can't be loaded
    aiTools = [];
  }
}

// Load data immediately
loadData();

// Routes
app.get('/api/tools', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const category = req.query.category;
  const searchUrl = req.query.url;
  const isSingleToolRequest = req.query.single === 'true';

  console.log('Request params:', { page, limit, category, searchUrl, isSingleToolRequest });

  // First filter tools by description to ensure quality content
  const toolsWithDescriptions = aiTools.filter(tool => tool.description && tool.description.trim() !== '');

  // Then filter by category if provided
  const filteredTools = category 
    ? toolsWithDescriptions.filter(tool => {
        if (!tool.filter1) return false;
        const toolCategories = tool.filter1.split(',').map(cat => cat.trim());
        const categoryNormalized = category.toLowerCase().replace(/-/g, ' ');
        return toolCategories.some(cat => cat.toLowerCase() === categoryNormalized);
      })
    : toolsWithDescriptions;
  
  // Get total count for pagination
  const total = filteredTools.length;
  
  // Calculate start and end indices for pagination
  const start = (page - 1) * limit;
  const end = start + limit;
  
  // Get paginated data
  const paginatedTools = filteredTools.slice(start, end);

  console.log('Response stats:', {
    totalTools: total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    toolsOnPage: paginatedTools.length,
    isPaginated: !isSingleToolRequest
  });

  res.json({
    tools: isSingleToolRequest ? filteredTools : paginatedTools,
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      perPage: limit
    }
  });
});

app.get('/api/tools/:id', (req, res) => {
  const tool = aiTools.find(t => t.id === req.params.id);
  if (!tool) {
    return res.status(404).json({ message: 'Tool not found' });
  }
  res.json(tool);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', toolsCount: aiTools.length });
});

// Helper function to get unique categories
function getUniqueCategories() {
  const categories = new Set();
  aiTools.forEach(tool => {
    if (tool.filter1) {
      tool.filter1.split(',').forEach(category => {
        categories.add(category.trim());
      });
    }
  });
  return Array.from(categories);
}

// Helper function to generate sitemap XML
function generateSitemapXML(baseUrl) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add homepage
  xml += `  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;

  // Add all tools
  aiTools.forEach(tool => {
    if (tool.url) {
      xml += `  <url>
    <loc>${baseUrl}/tool/${encodeURIComponent(tool.url)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }
  });

  // Add all categories
  getUniqueCategories().forEach(category => {
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    xml += `  <url>
    <loc>${baseUrl}/category/${encodeURIComponent(categorySlug)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  });

  xml += '</urlset>';
  return xml;
}

// Sitemap endpoint
app.get('/api/sitemap.xml', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const baseUrl = `${protocol}://${req.headers.host}`;
  
  res.header('Content-Type', 'application/xml');
  res.send(generateSitemapXML(baseUrl));
});

// New endpoint for categories
app.get('/api/categories', (req, res) => {
  try {
    // First filter tools to only those with descriptions
    const toolsWithDescriptions = aiTools.filter(tool => tool.description && tool.description.trim() !== '');

    // Create a map to count tools per category
    const categoryMap = toolsWithDescriptions.reduce((acc, tool) => {
      if (tool.filter1) {
        // Split categories if they contain commas and process each one
        const categories = tool.filter1.split(',').map(cat => cat.trim());
        categories.forEach(category => {
          if (category) {
            acc[category] = (acc[category] || 0) + 1;
          }
        });
      }
      return acc;
    }, {});

    // Convert to array and sort by count
    const categories = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .filter(category => category.name.length > 0);

    res.json({ categories });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'Error getting categories' });
  }
});

// Only start the server if we're running directly (not being imported)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app; 