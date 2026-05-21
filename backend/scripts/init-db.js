const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || ''
};

const dbName = process.env.DB_NAME || 'airport_management';

async function init() {
  console.log('Starting Database Initialization...');

  // 1. Create Database if it doesn't exist
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server successfully.');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database "${dbName}" verified/created.`);
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }

  // 2. Connect Sequelize & Sync Models
  const sequelize = require('../config/db');
  const { User, Passenger, Flight, Ticket, Staff, Airport } = require('../models');

  try {
    // Force sync deletes existing tables and recreates them
    await sequelize.sync({ force: true });
    console.log('Database tables synchronized successfully.');

    // 3. Create Audit Logs table
    console.log('Creating audit_logs table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        audit_id INT AUTO_INCREMENT PRIMARY KEY,
        action_type VARCHAR(50) NOT NULL,
        table_name VARCHAR(50) NOT NULL,
        record_id INT NOT NULL,
        action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        details TEXT
      );
    `);

    // 4. Create Views
    console.log('Creating database views...');
    await sequelize.query(`
      CREATE OR REPLACE VIEW vw_booking_details AS
      SELECT 
          t.ticket_id,
          t.seat_number,
          t.class_type,
          t.booking_date,
          t.ticket_price,
          p.passenger_id,
          p.name AS passenger_name,
          p.passport_number,
          p.email AS passenger_email,
          f.flight_id,
          f.flight_name,
          f.source,
          f.destination,
          f.departure_time,
          f.arrival_time,
          f.status AS flight_status
      FROM tickets t
      JOIN passengers p ON t.passenger_id = p.passenger_id
      JOIN flights f ON t.flight_id = f.flight_id;
    `);

    await sequelize.query(`
      CREATE OR REPLACE VIEW vw_flight_occupancy AS
      SELECT 
          f.flight_id,
          f.flight_name,
          f.source,
          f.destination,
          f.departure_time,
          f.status,
          COUNT(t.ticket_id) AS total_bookings,
          COALESCE(SUM(t.ticket_price), 0) AS total_revenue
      FROM flights f
      LEFT JOIN tickets t ON f.flight_id = t.flight_id
      GROUP BY f.flight_id, f.flight_name, f.source, f.destination, f.departure_time, f.status;
    `);

    // 5. Create Stored Procedures
    console.log('Creating stored procedures...');
    await sequelize.query(`DROP PROCEDURE IF EXISTS sp_get_passenger_bookings;`);
    await sequelize.query(`
      CREATE PROCEDURE sp_get_passenger_bookings(IN in_passenger_id INT)
      BEGIN
          SELECT 
              t.ticket_id,
              t.seat_number,
              t.class_type,
              t.booking_date,
              t.ticket_price,
              f.flight_name,
              f.source,
              f.destination,
              f.departure_time,
              f.status AS flight_status
          FROM tickets t
          JOIN flights f ON t.flight_id = f.flight_id
          WHERE t.passenger_id = in_passenger_id
          ORDER BY t.booking_date DESC;
      END;
    `);

    await sequelize.query(`DROP PROCEDURE IF EXISTS sp_get_flight_revenue;`);
    await sequelize.query(`
      CREATE PROCEDURE sp_get_flight_revenue()
      BEGIN
          SELECT 
              f.flight_id,
              f.flight_name,
              COALESCE(SUM(t.ticket_price), 0) AS total_revenue
          FROM flights f
          LEFT JOIN tickets t ON f.flight_id = t.flight_id
          GROUP BY f.flight_id, f.flight_name
          ORDER BY total_revenue DESC;
      END;
    `);

    // 6. Create Triggers
    console.log('Creating database triggers...');
    await sequelize.query(`DROP TRIGGER IF EXISTS before_ticket_insert;`);
    await sequelize.query(`
      CREATE TRIGGER before_ticket_insert
      BEFORE INSERT ON tickets
      FOR EACH ROW
      BEGIN
          IF NEW.booking_date IS NULL THEN
              SET NEW.booking_date = CURDATE();
          END IF;
          SET NEW.seat_number = UPPER(NEW.seat_number);
      END;
    `);

    await sequelize.query(`DROP TRIGGER IF EXISTS after_ticket_insert;`);
    await sequelize.query(`
      CREATE TRIGGER after_ticket_insert
      AFTER INSERT ON tickets
      FOR EACH ROW
      BEGIN
          INSERT INTO audit_logs (action_type, table_name, record_id, details)
          VALUES ('INSERT', 'tickets', NEW.ticket_id, CONCAT('Ticket booked for Passenger ID: ', NEW.passenger_id, ', Flight ID: ', NEW.flight_id, ', Seat: ', NEW.seat_number, ', Class: ', NEW.class_type));
      END;
    `);

    await sequelize.query(`DROP TRIGGER IF EXISTS after_ticket_delete;`);
    await sequelize.query(`
      CREATE TRIGGER after_ticket_delete
      AFTER DELETE ON tickets
      FOR EACH ROW
      BEGIN
          INSERT INTO audit_logs (action_type, table_name, record_id, details)
          VALUES ('DELETE', 'tickets', OLD.ticket_id, CONCAT('Ticket cancelled for Passenger ID: ', OLD.passenger_id, ', Flight ID: ', OLD.flight_id, ', Seat: ', OLD.seat_number));
      END;
    `);

    // 7. Seed Sample Data
    console.log('Seeding sample data...');

    // Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Seeded User: admin / admin123');

    // Airports
    const airports = await Airport.bulkCreate([
      { airport_name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', runway_count: 4, terminal_count: 6 },
      { airport_name: 'London Heathrow Airport', city: 'London', country: 'UK', runway_count: 2, terminal_count: 5 },
      { airport_name: 'Changi Airport', city: 'Singapore', country: 'Singapore', runway_count: 3, terminal_count: 4 },
      { airport_name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', runway_count: 4, terminal_count: 3 },
      { airport_name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', runway_count: 2, terminal_count: 3 }
    ]);
    console.log('Seeded 5 Airports.');

    // Passengers
    const passengers = await Passenger.bulkCreate([
      { name: 'John Doe', age: 34, gender: 'Male', passport_number: 'US1234567', nationality: 'American', phone: '+15550199', email: 'john.doe@example.com' },
      { name: 'Jane Smith', age: 28, gender: 'Female', passport_number: 'GB9876543', nationality: 'British', phone: '+44207946', email: 'jane.smith@example.com' },
      { name: 'Aarav Mehta', age: 42, gender: 'Male', passport_number: 'IN4567891', nationality: 'Indian', phone: '+91987654', email: 'aarav.mehta@example.com' },
      { name: 'Yuki Tanaka', age: 31, gender: 'Female', passport_number: 'JP5678901', nationality: 'Japanese', phone: '+8135550', email: 'yuki.tanaka@example.com' },
      { name: 'Sarah Connor', age: 45, gender: 'Female', passport_number: 'US0009991', nationality: 'American', phone: '+15550180', email: 'sarah.c@example.com' }
    ]);
    console.log('Seeded 5 Passengers.');

    // Flights
    const now = new Date();
    const flights = await Flight.bulkCreate([
      {
        flight_name: 'AI-101',
        source: 'New Delhi',
        destination: 'New York',
        departure_time: new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
        arrival_time: new Date(now.getTime() + 38 * 60 * 60 * 1000),
        status: 'Scheduled'
      },
      {
        flight_name: 'EK-203',
        source: 'Dubai',
        destination: 'London',
        departure_time: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours from now
        arrival_time: new Date(now.getTime() + 20 * 60 * 60 * 1000),
        status: 'On Time'
      },
      {
        flight_name: 'SQ-308',
        source: 'Singapore',
        destination: 'Dubai',
        departure_time: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        arrival_time: new Date(now.getTime() + 13 * 60 * 60 * 1000),
        status: 'Delayed'
      },
      {
        flight_name: 'BA-227',
        source: 'London',
        destination: 'New York',
        departure_time: new Date(now.getTime() - 4 * 60 * 60 * 1000), // departed 4 hours ago
        arrival_time: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        status: 'Departed'
      },
      {
        flight_name: 'UA-882',
        source: 'New York',
        destination: 'Singapore',
        departure_time: new Date(now.getTime() - 24 * 60 * 60 * 1000), // arrived
        arrival_time: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        status: 'Arrived'
      }
    ]);
    console.log('Seeded 5 Flights.');

    // Tickets
    await Ticket.bulkCreate([
      { passenger_id: passengers[0].passenger_id, flight_id: flights[0].flight_id, seat_number: '12A', class_type: 'Economy', booking_date: '2026-05-20', ticket_price: 650.00 },
      { passenger_id: passengers[1].passenger_id, flight_id: flights[1].flight_id, seat_number: '02B', class_type: 'Business', booking_date: '2026-05-19', ticket_price: 1800.00 },
      { passenger_id: passengers[2].passenger_id, flight_id: flights[2].flight_id, seat_number: '01A', class_type: 'First Class', booking_date: '2026-05-21', ticket_price: 3200.00 },
      { passenger_id: passengers[3].passenger_id, flight_id: flights[3].flight_id, seat_number: '18D', class_type: 'Economy', booking_date: '2026-05-18', ticket_price: 520.00 },
      { passenger_id: passengers[4].passenger_id, flight_id: flights[0].flight_id, seat_number: '14C', class_type: 'Economy', booking_date: '2026-05-21', ticket_price: 650.00 }
    ]);
    console.log('Seeded 5 Tickets.');

    // Staff
    await Staff.bulkCreate([
      { name: 'Alice Johnson', role: 'Pilot', department: 'Flight Operations', salary: 120000.00, shift_timing: 'Morning Shift' },
      { name: 'Bob Carter', role: 'Cabin Crew', department: 'Flight Operations', salary: 45000.00, shift_timing: 'Mixed Shift' },
      { name: 'Charlie Green', role: 'Air Traffic Controller', department: 'Control Tower', salary: 95000.00, shift_timing: 'Night Shift' },
      { name: 'Diana Prince', role: 'Security Agent', department: 'Airport Security', salary: 55000.00, shift_timing: 'Evening Shift' },
      { name: 'Evan Wright', role: 'Maintenance Engineer', department: 'Engineering', salary: 80000.00, shift_timing: 'Morning Shift' }
    ]);
    console.log('Seeded 5 Staff members.');

    console.log('Database Initialized Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing database and seeding:', error);
    process.exit(1);
  }
}

init();
