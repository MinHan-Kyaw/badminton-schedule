const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'https://badminton-schedule.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/badminton-manager';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Import models
const GameSession = require('./models/GameSession');

// Routes

// Get current active game session
app.get('/api/game/current', async (req, res) => {
  try {
    const session = await GameSession.findOne({ isActive: true }).sort({ createdAt: -1 });
    
    if (!session) {
      return res.json({
        success: false,
        message: 'No active game session found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error fetching current session:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new game session
app.post('/api/game', async (req, res) => {
  try {
    const { courts, date, time, location, googleMapsLink, maxStandbyPlayers } = req.body;
    
    // Close any existing active sessions
    await GameSession.updateMany(
      { isActive: true },
      { isActive: false }
    );

    const session = new GameSession({
      courts,
      maxPlayers: courts * 6,
      maxStandbyPlayers: maxStandbyPlayers || 4,
      date,
      time,
      location,
      googleMapsLink,
      isActive: true,
      players: [],
      standbyPlayers: []
    });

    const savedSession = await session.save();
    
    res.status(201).json({
      success: true,
      data: savedSession
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update game session
app.put('/api/game/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const session = await GameSession.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Add player to session
app.post('/api/game/:id/players', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const session = await GameSession.findById(id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    // Check if player already exists in either players or standbyPlayers
    const existingPlayer = session.players.find(p => p.name.toLowerCase() === name.toLowerCase()) ||
                          session.standbyPlayers.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        error: 'Player already registered'
      });
    }

    const newPlayer = {
      name: name.trim(),
      joinedAt: new Date()
    };

    // Check total capacity (maxPlayers + maxStandbyPlayers)
    const totalCapacity = session.maxPlayers + session.maxStandbyPlayers;
    const currentTotal = session.players.length + session.standbyPlayers.length;
    
    if (currentTotal >= totalCapacity) {
      return res.status(400).json({
        success: false,
        error: 'Maximum capacity reached (including standby)'
      });
    }

    // If max players reached, add to standby
    if (session.players.length >= session.maxPlayers) {
      session.standbyPlayers.push(newPlayer);
    } else {
      session.players.push(newPlayer);
    }

    const updatedSession = await session.save();
    
    res.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    console.error('Error adding player:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Remove player from session
app.delete('/api/game/:id/players/:playerId', async (req, res) => {
  try {
    const { id, playerId } = req.params;

    const session = await GameSession.findById(id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    // Remove from players first, then from standby if not found
    const playerIndex = session.players.findIndex(p => p._id.toString() === playerId);
    if (playerIndex !== -1) {
      session.players.splice(playerIndex, 1);
      
      // If there are standby players, promote the first one
      if (session.standbyPlayers.length > 0) {
        const promotedPlayer = session.standbyPlayers.shift();
        session.players.push(promotedPlayer);
      }
    } else {
      const standbyIndex = session.standbyPlayers.findIndex(p => p._id.toString() === playerId);
      if (standbyIndex !== -1) {
        session.standbyPlayers.splice(standbyIndex, 1);
      }
    }

    const updatedSession = await session.save();
    
    res.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    console.error('Error removing player:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update player name
app.put('/api/game/:id/players/:playerId', async (req, res) => {
  try {
    const { id, playerId } = req.params;
    const { name } = req.body;

    const session = await GameSession.findById(id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    // Check in both players and standbyPlayers
    let player = session.players.id(playerId);
    let isStandby = false;
    
    if (!player) {
      player = session.standbyPlayers.id(playerId);
      isStandby = true;
    }
    
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    // Check if new name already exists in either array
    const existingPlayer = session.players.find(p => 
      p._id.toString() !== playerId && 
      p.name.toLowerCase() === name.toLowerCase()
    ) || session.standbyPlayers.find(p => 
      p._id.toString() !== playerId && 
      p.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        error: 'Player name already exists'
      });
    }

    player.name = name.trim();
    const updatedSession = await session.save();
    
    res.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Promote standby player to regular player
app.post('/api/game/:id/players/:playerId/promote', async (req, res) => {
  try {
    const { id, playerId } = req.params;

    const session = await GameSession.findById(id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    const standbyIndex = session.standbyPlayers.findIndex(p => p._id.toString() === playerId);
    if (standbyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Standby player not found'
      });
    }

    // Move player from standby to regular players
    const player = session.standbyPlayers.splice(standbyIndex, 1)[0];
    session.players.push(player);

    const updatedSession = await session.save();
    
    res.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    console.error('Error promoting player:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Close game session
app.put('/api/game/:id/close', async (req, res) => {
  try {
    const { id } = req.params;

    const session = await GameSession.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        players: [],
        standbyPlayers: []
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error closing session:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Admin password verification endpoint
app.post('/api/admin/verify-password', (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return res.status(500).json({
        success: false,
        error: 'Admin password not configured'
      });
    }
    
    if (password === adminPassword) {
      res.json({
        success: true,
        message: 'Password verified'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Incorrect password'
      });
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// For Vercel serverless deployment
module.exports = app; 
