const express = require('express');
const router = express.Router();
const makeCrudController = require('../controllers/crudController');
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const {
  Passenger,
  Flight,
  Ticket,
  Staff,
  Airport
} = require('../models');

// Controllers initialization
const passengerController = makeCrudController(Passenger, {
  searchFields: ['name', 'passport_number', 'nationality', 'email', 'phone']
});

const flightController = makeCrudController(Flight, {
  searchFields: ['flight_name', 'source', 'destination', 'status']
});

const ticketController = makeCrudController(Ticket, {
  include: [
    { model: Passenger, as: 'passenger', attributes: ['name', 'passport_number', 'email'] },
    { model: Flight, as: 'flight', attributes: ['flight_name', 'source', 'destination', 'departure_time'] }
  ],
  searchFields: ['seat_number', 'class_type']
});

const staffController = makeCrudController(Staff, {
  searchFields: ['name', 'role', 'department', 'shift_timing']
});

const airportController = makeCrudController(Airport, {
  searchFields: ['airport_name', 'city', 'country']
});

// Setup helper to apply standard RBAC rules to a resource
// GET is open to all logged in users. POST, PUT, DELETE are restricted to admins.
const registerCrudRoutes = (prefix, controller) => {
  router.get(prefix, authMiddleware, controller.getAll);
  router.get(`${prefix}/:id`, authMiddleware, controller.getById);
  router.post(prefix, authMiddleware, adminMiddleware, controller.create);
  router.put(`${prefix}/:id`, authMiddleware, adminMiddleware, controller.update);
  router.delete(`${prefix}/:id`, authMiddleware, adminMiddleware, controller.delete);
};

// Register CRUD APIs
registerCrudRoutes('/passengers', passengerController);
registerCrudRoutes('/flights', flightController);
registerCrudRoutes('/tickets', ticketController);
registerCrudRoutes('/staff', staffController);
registerCrudRoutes('/airports', airportController);

// Dashboard & DBMS Advanced SQL Routes
router.get('/dashboard/stats', authMiddleware, dashboardController.getStats);
router.get('/dashboard/passenger-bookings/:passengerId', authMiddleware, dashboardController.getPassengerBookingsProc);
router.get('/dashboard/flight-revenue', authMiddleware, dashboardController.getFlightRevenueProc);

module.exports = router;
