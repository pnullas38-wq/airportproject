const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Passenger = sequelize.define('Passenger', {
  passenger_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Passenger name is required' }
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'Age must be an integer' },
      min: { args: [0], msg: 'Age cannot be negative' },
      max: { args: [120], msg: 'Age cannot exceed 120' }
    }
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [['Male', 'Female', 'Other']],
        msg: 'Gender must be Male, Female, or Other'
      }
    }
  },
  passport_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Passport number must be unique'
    },
    validate: {
      notEmpty: { msg: 'Passport number is required' }
    }
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nationality is required' }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Phone number is required' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: { msg: 'Must be a valid email address' }
    }
  }
});

module.exports = Passenger;
