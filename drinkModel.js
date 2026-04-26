const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'drinks.json');

class DrinkModel {
  /**
   * Read all drinks from the JSON file
   * @returns {Promise<Array>} Array of drink objects
   */
  static getAllDrinks() {
    return new Promise((resolve, reject) => {
      fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
          // If file doesn't exist, create it with empty array
          if (err.code === 'ENOENT') {
            fs.writeFile(DATA_FILE, '[]', 'utf8', (writeErr) => {
              if (writeErr) {
                reject(writeErr);
              } else {
                resolve([]);
              }
            });
          } else {
            reject(err);
          }
        } else {
          try {
            const drinks = JSON.parse(data);
            resolve(drinks);
          } catch (parseErr) {
            reject(parseErr);
          }
        }
      });
    });
  }

  /**
   * Save drinks array to JSON file
   * @param {Array} drinks - Array of drink objects
   * @returns {Promise<void>}
   */
  static saveDrinks(drinks) {
    return new Promise((resolve, reject) => {
      const jsonData = JSON.stringify(drinks, null, 2);
      fs.writeFile(DATA_FILE, jsonData, 'utf8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get a single drink by ID
   * @param {number} id - Drink ID
   * @returns {Promise<Object|null>} Drink object or null if not found
   */
  static async getDrinkById(id) {
    try {
      const drinks = await this.getAllDrinks();
      return drinks.find(drink => drink.id === id) || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new drink
   * @param {Object} drinkData - Drink data object
   * @returns {Promise<Object>} Newly created drink object
   */
  static async createDrink(drinkData) {
    try {
      const drinks = await this.getAllDrinks();
      
      const newId = drinks.length > 0 
        ? Math.max(...drinks.map(drink => drink.id)) + 1 
        : 1;
      
      // Create new drink object with metadata
      const newDrink = {
        id: newId,
        name: drinkData.name,
        type: drinkData.type,
        ingredients: drinkData.ingredients || [],
        alcoholContent: drinkData.alcoholContent || 0,
        servingSize: drinkData.servingSize,
        glassType: drinkData.glassType,
        rating: drinkData.rating || 0,
        review: drinkData.review || '',
        price: drinkData.price,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      drinks.push(newDrink);
      await this.saveDrinks(drinks);
      
      return newDrink;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing drink
   * @param {number} id - Drink ID to update
   * @param {Object} updateData - Updated drink data
   * @returns {Promise<Object|null>} Updated drink object or null if not found
   */
  static async updateDrink(id, updateData) {
    try {
      const drinks = await this.getAllDrinks();
      const index = drinks.findIndex(drink => drink.id === id);
      
      if (index === -1) {
        return null;
      }
      
      const updatedDrink = {
        ...drinks[index],
        ...updateData,
        id: drinks[index].id,  // Ensure ID doesn't change
        createdAt: drinks[index].createdAt,  // Preserve creation date
        updatedAt: new Date().toISOString()  // Update modification date
      };
      
      drinks[index] = updatedDrink;
      await this.saveDrinks(drinks);
      
      return updatedDrink;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a drink by ID
   * @param {number} id - Drink ID to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async deleteDrink(id) {
    try {
      const drinks = await this.getAllDrinks();
      const index = drinks.findIndex(drink => drink.id === id);
      
      if (index === -1) {
        return false;
      }
      
      drinks.splice(index, 1);
      await this.saveDrinks(drinks);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search drinks by name, type, or ingredients
   * @param {string} query - Search query string
   * @returns {Promise<Array>} Array of matching drink objects
   */
  static async searchDrinks(query) {
    try {
      const drinks = await this.getAllDrinks();
      const searchTerm = query.toLowerCase();
      
      // Filter drinks that match the search term
      return drinks.filter(drink => 
        drink.name.toLowerCase().includes(searchTerm) ||
        drink.type.toLowerCase().includes(searchTerm) ||
        (drink.ingredients && drink.ingredients.some(
          ingredient => ingredient.toLowerCase().includes(searchTerm)
        ))
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Filter drinks by type
   * @param {string} type - Drink type to filter by
   * @returns {Promise<Array>} Array of filtered drink objects
   */
  static async filterByType(type) {
    try {
      const drinks = await this.getAllDrinks();
      return drinks.filter(drink => 
        drink.type.toLowerCase() === type.toLowerCase()
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get top rated drinks
   * @param {number} limit - Number of drinks to return
   * @returns {Promise<Array>} Array of top rated drinks
   */
  static async getTopRated(limit = 5) {
    try {
      const drinks = await this.getAllDrinks();
      return drinks
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DrinkModel;