const parseBody = require('../utils/parseBody');
const DrinkModel = require('../models/drinkModel');

class DrinkController {
  /**
   * GET /api/drinks
   * Get all drinks with optional search, filter, and sort
   */
  static async getAllDrinks(req, res) {
    try {
      // Parse URL parameters
      const url = new URL(req.url, `http://${req.headers.host}`);
      const searchQuery = url.searchParams.get('search');
      const typeFilter = url.searchParams.get('type');
      const sortBy = url.searchParams.get('sort');
      
      let drinks;
      
      if (searchQuery) {
        drinks = await DrinkModel.searchDrinks(searchQuery);
      } 
      else if (typeFilter) {
        drinks = await DrinkModel.filterByType(typeFilter);
      } 
      else {
        drinks = await DrinkModel.getAllDrinks();
      }
      
      if (sortBy === 'rating') {
        drinks.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'name') {
        drinks.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'price') {
        drinks.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'newest') {
        drinks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        count: drinks.length,
        data: drinks
      }));
    } catch (error) {
      console.error('Error in getAllDrinks:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Internal Server Error'
      }));
    }
  }

  /**
   * GET /api/drinks/:id
   * Get a single drink by ID
   */
  static async getDrinkById(req, res, id) {
    try {
      const drink = await DrinkModel.getDrinkById(id);
      
      // Check if drink exists
      if (!drink) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: `Drink with ID ${id} not found`
        }));
        return;
      }
      
      // Send successful response with drink data
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: drink
      }));
    } catch (error) {
      console.error('Error in getDrinkById:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Internal Server Error'
      }));
    }
  }

  /**
   * POST /api/drinks
   * Create a new drink
   */
  static async createDrink(req, res) {
    try {
      // Parse the request body
      const body = await parseBody(req);
      
      // Validate required fields
      if (!body.name || !body.type) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Please provide required fields: name and type'
        }));
        return;
      }
      
      // Validate rating if provided
      if (body.rating && (body.rating < 0 || body.rating > 5)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Rating must be between 0 and 5'
        }));
        return;
      }
      
      // Validate price if provided
      if (body.price && body.price < 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Price cannot be negative'
        }));
        return;
      }
      
      // Create the drink
      const newDrink = await DrinkModel.createDrink(body);
      
      // Send successful response with created drink
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Drink created successfully',
        data: newDrink
      }));
    } catch (error) {
      // Handle JSON parse errors
      if (error.message === 'Invalid JSON format') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid JSON format in request body'
        }));
        return;
      }
      
      console.error('Error in createDrink:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Internal Server Error'
      }));
    }
  }

  /**
   * PUT /api/drinks/:id
   * Update an existing drink
   */
  static async updateDrink(req, res, id) {
    try {
      // Parse the request body
      const body = await parseBody(req);
      
      // Validate rating if provided
      if (body.rating && (body.rating < 0 || body.rating > 5)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Rating must be between 0 and 5'
        }));
        return;
      }
      
      // Validate price if provided
      if (body.price && body.price < 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Price cannot be negative'
        }));
        return;
      }
      
      // Update the drink
      const updatedDrink = await DrinkModel.updateDrink(id, body);
      
      // Check if drink exists
      if (!updatedDrink) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: `Drink with ID ${id} not found`
        }));
        return;
      }
      
      // Send successful response with updated drink
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Drink updated successfully',
        data: updatedDrink
      }));
    } catch (error) {
      // Handle JSON parse errors
      if (error.message === 'Invalid JSON format') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid JSON format in request body'
        }));
        return;
      }
      
      console.error('Error in updateDrink:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Internal Server Error'
      }));
    }
  }

  /**
   * DELETE /api/drinks/:id
   * Delete a drink by ID
   */
  static async deleteDrink(req, res, id) {
    try {
      // Delete the drink
      const deleted = await DrinkModel.deleteDrink(id);
      
      // Check if drink exists
      if (!deleted) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: `Drink with ID ${id} not found`
        }));
        return;
      }
      
      // Send successful response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: `Drink with ID ${id} deleted successfully`
      }));
    } catch (error) {
      console.error('Error in deleteDrink:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Internal Server Error'
      }));
    }
  }

  /**
   * GET /api/drinks/top-rated
   * Get top rated drinks (must be before /api/drinks/:id route)
   */
  static async getTopRated(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const limit = parseInt(url.searchParams.get('limit')) || 5;
      
      const topDrinks = await DrinkModel.getTopRated(limit);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        count: topDrinks.length,
        data: topDrinks
      }));
    } catch (error) {
      console.error('Error in getTopRated:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Internal Server Error'
      }));
    }
  }
}

module.exports = DrinkController;