const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Airport = sequelize.define('Airport', {
  airport_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  airport_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Airport name is required' }
    }
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'City is required' }
    }
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Country is required' }
    }
  },
  runway_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'Runway count must be an integer' },
      min: { args: [1], msg: 'Runway count must be at least 1' }
    }
  },
  terminal_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'Terminal count must be an integer' },
      min: { args: [1], msg: 'Terminal count must be at least 1' }
    }
  }
});

module.exports = Airport;
