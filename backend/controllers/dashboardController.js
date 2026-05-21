const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const { Passenger, Flight, Ticket, Airport, Staff } = require('../models');

exports.getStats = async (req, res) => {
  try {
    // 1. Fetch counts
    const passengerCount = await Passenger.count();
    const flightCount = await Flight.count();
    const ticketCount = await Ticket.count();
    const airportCount = await Airport.count();
    const staffCount = await Staff.count();

    // 2. Flight status breakdown
    const flightStatusBreakdown = await Flight.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // 3. Total revenue from Tickets
    const totalRevenueResult = await Ticket.sum('ticket_price');
    const totalRevenue = totalRevenueResult ? parseFloat(totalRevenueResult) : 0;

    // 4. Monthly bookings trend (Grouped by booking date)
    const bookingTrends = await Ticket.findAll({
      attributes: [
        'booking_date',
        [sequelize.fn('COUNT', sequelize.col('ticket_id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('ticket_price')), 'revenue']
      ],
      group: ['booking_date'],
      order: [['booking_date', 'ASC']],
      limit: 15,
      raw: true
    });

    // 5. Query vw_flight_occupancy (Advanced view join usage)
    const flightOccupancy = await sequelize.query(
      'SELECT * FROM vw_flight_occupancy ORDER BY total_revenue DESC LIMIT 5',
      { type: QueryTypes.SELECT }
    );

    // 6. Query recent audit logs (Advanced trigger updates check)
    const recentAudits = await sequelize.query(
      'SELECT * FROM audit_logs ORDER BY action_timestamp DESC LIMIT 8',
      { type: QueryTypes.SELECT }
    );

    // 7. Class type distribution
    const classDistribution = await Ticket.findAll({
      attributes: [
        'class_type',
        [sequelize.fn('COUNT', sequelize.col('class_type')), 'count']
      ],
      group: ['class_type'],
      raw: true
    });

    return res.json({
      success: true,
      data: {
        counts: {
          passengers: passengerCount,
          flights: flightCount,
          tickets: ticketCount,
          airports: airportCount,
          staff: staffCount,
          totalRevenue
        },
        flightStatusBreakdown,
        bookingTrends,
        flightOccupancy,
        classDistribution,
        recentAudits
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard metrics',
      error: error.message
    });
  }
};

// Execute stored procedures dynamically
exports.getPassengerBookingsProc = async (req, res) => {
  try {
    const passengerId = req.params.passengerId;
    const bookings = await sequelize.query(
      'CALL sp_get_passenger_bookings(:passengerId)',
      {
        replacements: { passengerId },
        type: QueryTypes.RAW
      }
    );
    return res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error running sp_get_passenger_bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve passenger bookings via stored procedure',
      error: error.message
    });
  }
};

exports.getFlightRevenueProc = async (req, res) => {
  try {
    const revenue = await sequelize.query(
      'CALL sp_get_flight_revenue()',
      { type: QueryTypes.RAW }
    );
    return res.json({ success: true, data: revenue });
  } catch (error) {
    console.error('Error running sp_get_flight_revenue:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve flight revenue via stored procedure',
      error: error.message
    });
  }
};
