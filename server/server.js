require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');

const app = express();
const server = http.createServer(app);

// Try to connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/experts', require('./routes/experts'));
app.use('/api/bookings', require('./routes/bookings'));

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // MongoDB duplicate key error (double booking)
  if (err.code === 11000) {
    return res.status(409).json({ 
      error: 'This slot is already booked. Please choose another time.' 
    });
  }
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

const DEFAULT_PORT = process.env.PORT || 5000;
const MAX_PORT_ATTEMPTS = 10;

function startServer(port, attempt = 1) {
  server.listen(port)
    .on('listening', () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📡 API: http://localhost:${port}/api`);
      console.log(`💓 Health: http://localhost:${port}/health`);
      console.log(`📊 Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/expert_booking_dev'}`);
      
      // WebSocket setup after server starts
      const io = socketIo(server, {
        cors: {
          origin: process.env.CLIENT_URL || 'http://localhost:5173',
          methods: ['GET', 'POST'],
          credentials: true
        },
        transports: ['websocket', 'polling']
      });

      // Make io accessible in routes
      app.set('io', io);

      // WebSocket connection handling
      io.on('connection', (socket) => {
        console.log('⚡ New client connected:', socket.id);
        
        // Join a room for expert updates
        socket.on('join-expert', (expertId) => {
          socket.join(`expert-${expertId}`);
          console.log(`Socket ${socket.id} joined expert-${expertId}`);
        });

        // Leave expert room
        socket.on('leave-expert', (expertId) => {
          socket.leave(`expert-${expertId}`);
          console.log(`Socket ${socket.id} left expert-${expertId}`);
        });

        // Handle booking events
        socket.on('booking-created', (data) => {
          // Broadcast to all clients in the expert's room
          socket.to(`expert-${data.expertId}`).emit('slot-booked', {
            expertId: data.expertId,
            date: data.date,
            timeSlot: data.timeSlot,
            bookingId: data.bookingId
          });
        });

        socket.on('disconnect', () => {
          console.log('🔌 Client disconnected:', socket.id);
        });
      });

      console.log('⚡ WebSocket server ready');
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${port} is busy`);
        if (attempt < MAX_PORT_ATTEMPTS) {
          const nextPort = port + 1;
          console.log(`🔄 Trying port ${nextPort}... (attempt ${attempt + 1}/${MAX_PORT_ATTEMPTS})`);
          startServer(nextPort, attempt + 1);
        } else {
          console.error(`❌ Could not find available port after ${MAX_PORT_ATTEMPTS} attempts`);
          process.exit(1);
        }
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });
}

// Start server with fallback
startServer(parseInt(DEFAULT_PORT));

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, closing server...');
  server.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, closing server...');
  server.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});

module.exports = { app, server };