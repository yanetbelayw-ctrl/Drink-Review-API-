const DrinkController = require('./controllers/drinkController');

/**
 * Handle all route requests
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
function handleRoutes(req, res) {
  // Parse URL from request
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method.toUpperCase();
  
  // Extract ID from URL if present for /api/drinks/:id pattern
  const idMatch = path.match(/^\/api\/drinks\/(\d+)$/);
  
  try {
    // ===== GET Requests =====
    
    // GET /api/drinks - Get all drinks
    if (path === '/api/drinks' && method === 'GET') {
      DrinkController.getAllDrinks(req, res);
    }
    // GET /api/drinks/top-rated - Get top rated drinks (before :id route)
    else if (path === '/api/drinks/top-rated' && method === 'GET') {
      DrinkController.getTopRated(req, res);
    }
    // GET /api/drinks/:id - Get single drink by ID
    else if (idMatch && method === 'GET') {
      const id = parseInt(idMatch[1]);
      DrinkController.getDrinkById(req, res, id);
    }
    
    // ===== POST Requests =====
    
    // POST /api/drinks - Create a new drink
    else if (path === '/api/drinks' && method === 'POST') {
      DrinkController.createDrink(req, res);
    }
    
    // ===== PUT Requests =====
    
    // PUT /api/drinks/:id - Update an existing drink
    else if (idMatch && method === 'PUT') {
      const id = parseInt(idMatch[1]);
      DrinkController.updateDrink(req, res, id);
    }
    
    // ===== DELETE Requests =====
    
    // DELETE /api/drinks/:id - Delete a drink
    else if (idMatch && method === 'DELETE') {
      const id = parseInt(idMatch[1]);
      DrinkController.deleteDrink(req, res, id);
    }
    
    // ===== 404 Not Found =====
    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Route not found',
        availableRoutes: {
          getAll: 'GET /api/drinks',
          getById: 'GET /api/drinks/:id',
          getTopRated: 'GET /api/drinks/top-rated',
          create: 'POST /api/drinks',
          update: 'PUT /api/drinks/:id',
          delete: 'DELETE /api/drinks/:id'
        }
      }));
    }
  } catch (error) {
    console.error('Route handling error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Internal Server Error'
    }));
  }
}

module.exports = handleRoutes;