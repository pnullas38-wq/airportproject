const User = require('./User');
const Passenger = require('./Passenger');
const Flight = require('./Flight');
const Ticket = require('./Ticket');
const Staff = require('./Staff');
const Airport = require('./Airport');

// Define Relationships with constraints and cascading options
Passenger.hasMany(Ticket, { 
  foreignKey: 'passenger_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE' 
});
Ticket.belongsTo(Passenger, { 
  foreignKey: 'passenger_id',
  as: 'passenger'
});

Flight.hasMany(Ticket, { 
  foreignKey: 'flight_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE' 
});
Ticket.belongsTo(Flight, { 
  foreignKey: 'flight_id',
  as: 'flight'
});

module.exports = {
  User,
  Passenger,
  Flight,
  Ticket,
  Staff,
  Airport
};
