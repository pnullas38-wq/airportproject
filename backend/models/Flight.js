const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Flight = sequelize.define('Flight', {
  flight_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  flight_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Flight name/number is required' }
    }
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Departure source is required' }
    }
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Destination is required' }
    }
  },
  departure_time: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: { msg: 'Departure time must be a valid date/time' }
    }
  },
  arrival_time: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: { msg: 'Arrival time must be a valid date/time' }
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Scheduled',
    validate: {
      isIn: {
        args: [['Scheduled', 'On Time', 'Delayed', 'Departed', 'Arrived', 'Cancelled']],
        msg: 'Invalid flight status'
      }
    }
  }
});

module.exports = Flight;
