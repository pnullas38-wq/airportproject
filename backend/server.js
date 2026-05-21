const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: '*', // In production, replace with specific frontend domains
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Socket.io for Real-time Synchronization
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Share Socket.io instance with Express app
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Bind API Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Airport Management System REST API.',
    docs: '/api'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    server.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1);
  }
}

startServer();
