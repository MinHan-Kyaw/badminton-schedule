const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const gameSessionSchema = new mongoose.Schema({
  courts: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 1
  },
  maxStandbyPlayers: {
    type: Number,
    required: true,
    min: 0,
    default: 4
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  googleMapsLink: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  players: [playerSchema],
  standbyPlayers: [playerSchema]
}, {
  timestamps: true
});

// Calculate max players based on courts (6 players per court)
gameSessionSchema.pre('save', function(next) {
  if (this.isModified('courts')) {
    this.maxPlayers = this.courts * 6;
  }
  next();
});

module.exports = mongoose.model('GameSession', gameSessionSchema); 
