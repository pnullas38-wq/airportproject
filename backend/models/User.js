const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Username is already taken'
    },
    validate: {
      notEmpty: { msg: 'Username is required' },
      len: { args: [3, 50], msg: 'Username must be between 3 and 50 characters' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required' },
      len: { args: [6, 100], msg: 'Password must be at least 6 characters long' }
    }
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'admin',
    validate: {
      isIn: {
        args: [['admin', 'staff']],
        msg: 'Role must be either admin or staff'
      }
    }
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Helper method to validate password
User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
