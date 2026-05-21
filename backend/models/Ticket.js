const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ticket = sequelize.define('Ticket', {
  ticket_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  passenger_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Passenger ID is required' }
    }
  },
  flight_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Flight ID is required' }
    }
  },
  seat_number: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Seat number is required' }
    }
  },
  class_type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [['Economy', 'Business', 'First Class']],
        msg: 'Class type must be Economy, Business, or First Class'
      }
    }
  },
  booking_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: { msg: 'Booking date must be a valid date' }
    }
  },
  ticket_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Price must be a valid decimal number' },
      min: { args: [0], msg: 'Price cannot be negative' }
    }
  }
});

module.exports = Ticket;
