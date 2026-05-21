const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Staff = sequelize.define('Staff', {
  staff_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Staff name is required' }
    }
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Role is required' }
    }
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Department is required' }
    }
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Salary must be a valid decimal number' },
      min: { args: [0], msg: 'Salary cannot be negative' }
    }
  },
  shift_timing: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Shift timing is required' }
    }
  }
});

module.exports = Staff;
