const { Op } = require('sequelize');

/**
 * Reusable controller factory that generates CRUD route handlers for a given Sequelize Model.
 * Supports Search, Pagination, Filters, and Sorting out of the box.
 * 
 * @param {import('sequelize').ModelCtor<any>} Model - The Sequelize model
 * @param {Object} options - Configuration options
 * @param {Array} options.include - Model associations to include in queries
 * @param {Array<string>} options.searchFields - Columns to include in fuzzy search
 * @param {string} options.primaryKey - Primary key of the model (default is auto-detected)
 */
const makeCrudController = (Model, options = {}) => {
  const pk = options.primaryKey || Model.primaryKeyAttribute || 'id';
  const include = options.include || [];
  const searchFields = options.searchFields || [];

  return {
    // Read all records with pagination, searching, sorting, and filtering
    getAll: async (req, res, next) => {
      try {
        const {
          page = 1,
          limit = 10,
          search = '',
          sortBy = pk,
          sortOrder = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const parsedLimit = parseInt(limit);

        // Build search conditions
        const searchConditions = [];
        if (search && searchFields.length > 0) {
          searchFields.forEach((field) => {
            searchConditions.push({
              [field]: { [Op.like]: `%${search}%` }
            });
          });
        }

        // Build filter conditions from query params (exclude page, limit, search, sortBy, sortOrder)
        const filterConditions = {};
        Object.keys(req.query).forEach((key) => {
          if (!['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key)) {
            // Check if key is a valid attribute of the model
            if (Model.rawAttributes[key]) {
              filterConditions[key] = req.query[key];
            }
          }
        });

        // Combine search and filters
        const whereClause = {};
        if (searchConditions.length > 0) {
          whereClause[Op.or] = searchConditions;
        }
        Object.assign(whereClause, filterConditions);

        // Fetch counts and rows
        const { count, rows } = await Model.findAndCountAll({
          where: whereClause,
          limit: parsedLimit,
          offset: offset,
          order: [[sortBy, sortOrder]],
          include: include
        });

        const totalPages = Math.ceil(count / parsedLimit);

        return res.json({
          success: true,
          meta: {
            totalItems: count,
            totalPages: totalPages,
            currentPage: parseInt(page),
            limit: parsedLimit
          },
          data: rows
        });
      } catch (error) {
        console.error(`Error in getAll for ${Model.name}:`, error);
        return res.status(500).json({
          success: false,
          message: `Failed to retrieve records for ${Model.name}`,
          error: error.message
        });
      }
    },

    // Read a single record by ID
    getById: async (req, res) => {
      try {
        const record = await Model.findByPk(req.params.id, { include });
        if (!record) {
          return res.status(404).json({
            success: false,
            message: `Record with id ${req.params.id} not found`
          });
        }
        return res.json({ success: true, data: record });
      } catch (error) {
        console.error(`Error in getById for ${Model.name}:`, error);
        return res.status(500).json({
          success: false,
          message: `Failed to retrieve record`,
          error: error.message
        });
      }
    },

    // Create a new record
    create: async (req, res) => {
      try {
        const record = await Model.create(req.body);
        
        // Notify all clients of update via socket if present
        if (req.app.get('io')) {
          req.app.get('io').emit('db-change', {
            model: Model.name,
            action: 'CREATE',
            data: record
          });
        }

        return res.status(201).json({
          success: true,
          message: `${Model.name} created successfully`,
          data: record
        });
      } catch (error) {
        console.error(`Error in create for ${Model.name}:`, error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
          return res.status(400).json({
            success: false,
            message: error.errors.map((e) => e.message).join(', '),
            errors: error.errors
          });
        }
        return res.status(500).json({
          success: false,
          message: `Failed to create ${Model.name}`,
          error: error.message
        });
      }
    },

    // Update an existing record
    update: async (req, res) => {
      try {
        const record = await Model.findByPk(req.params.id);
        if (!record) {
          return res.status(404).json({
            success: false,
            message: `Record with id ${req.params.id} not found`
          });
        }

        await record.update(req.body);

        // Notify all clients of update via socket
        if (req.app.get('io')) {
          req.app.get('io').emit('db-change', {
            model: Model.name,
            action: 'UPDATE',
            data: record
          });
        }

        return res.json({
          success: true,
          message: `${Model.name} updated successfully`,
          data: record
        });
      } catch (error) {
        console.error(`Error in update for ${Model.name}:`, error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
          return res.status(400).json({
            success: false,
            message: error.errors.map((e) => e.message).join(', '),
            errors: error.errors
          });
        }
        return res.status(500).json({
          success: false,
          message: `Failed to update ${Model.name}`,
          error: error.message
        });
      }
    },

    // Delete a record
    delete: async (req, res) => {
      try {
        const record = await Model.findByPk(req.params.id);
        if (!record) {
          return res.status(404).json({
            success: false,
            message: `Record with id ${req.params.id} not found`
          });
        }

        await record.destroy();

        // Notify all clients of update via socket
        if (req.app.get('io')) {
          req.app.get('io').emit('db-change', {
            model: Model.name,
            action: 'DELETE',
            id: req.params.id
          });
        }

        return res.json({
          success: true,
          message: `${Model.name} deleted successfully`
        });
      } catch (error) {
        console.error(`Error in delete for ${Model.name}:`, error);
        return res.status(500).json({
          success: false,
          message: `Failed to delete ${Model.name}. Make sure there are no linked records.`,
          error: error.message
        });
      }
    }
  };
};

module.exports = makeCrudController;
