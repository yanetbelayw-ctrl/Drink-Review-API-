const http = require('http');
const handleRoutes = require('./routes');

// Server configuration
const HOST = 'localhost';
const PORT = process.env.PORT || 3000;

/**
 * Create HTTP server
 * Handles all incoming requests and delegates to router
 */
const server = http.createServer((req, res) => {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Log incoming requests for debugging
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  // Delegate to route handler
  handleRoutes(req, res);
});

// Start server and listen on specified port
server.listen(PORT, HOST, () => {
  console.log(' Drink Review API Server Started!');
  console.log(` Server running at: http://${HOST}:${PORT}`);
  console.log('\n Available Endpoints:');
  console.log('   GET    /api/drinks              - Get all drinks');
  console.log('   GET    /api/drinks/:id          - Get drink by ID');
  console.log('   GET    /api/drinks/top-rated    - Get top rated drinks');
  console.log('    POST   /api/drinks              - Create new drink');
  console.log('   PUT    /api/drinks/:id          - Update drink');
  console.log('    DELETE /api/drinks/:id          - Delete drink');
  console.log('\n Query Parameters:');
  console.log('  ?search=mojito     - Search drinks');
  console.log('  ?type=non-alcoholic - Filter by type');
  console.log('  ?sort=rating       - Sort results (rating, name, price, newest)');
  console.log('  ?limit=10          - Limit results for top-rated');
  console.log('\n Ready to accept requests!\n');
});

// Graceful error handling for the server
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('Please close the other application or change the PORT');
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('\n SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log(' Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});