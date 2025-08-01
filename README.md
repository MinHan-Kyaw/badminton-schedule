# Badminton Court Manager

A full-stack application for managing badminton court bookings and player registrations.

## Features

- ✅ **Google Maps Integration**: Clickable location links and embedded maps
- ✅ **Standby Players System**: Configurable standby limit with automatic promotion
- ✅ **Admin Settings**: Save settings with confirmation dialogs
- ✅ **Match Management**: Finish matches with player cleanup
- ✅ **Real-time Updates**: MongoDB backend with live data sync

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Badminton
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. **Configure MongoDB**
   - Copy `server/env.example` to `server/.env`
   - Update `MONGODB_URI` with your MongoDB Atlas connection string
   ```bash
   cp server/env.example server/.env
   ```

4. **Update the .env file**
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/badminton-manager?retryWrites=true&w=majority
   PORT=3001
   NODE_ENV=development
   ```

## Running the Application

### Option 1: Run Frontend Only (for development)
```bash
npm run dev
```
This will start the frontend on `http://localhost:5173`

### Option 2: Run Backend Only
```bash
npm run server
```
This will start the backend on `http://localhost:3001`

### Option 3: Run Both (Recommended)
```bash
npm run dev:full
```
This will start both frontend and backend simultaneously.

## Quick Start

1. **Run the setup script** (optional):
   ```bash
   ./setup.sh
   ```

2. **Configure MongoDB**:
   ```bash
   cp server/env.example server/.env
   # Edit server/.env with your MongoDB connection string
   ```

3. **Start the application**:
   ```bash
   npm run dev:full
   ```

4. **Access the application**: Open `http://localhost:5173` in your browser

## Usage

1. **Access the application**: Open `http://localhost:5173` in your browser
2. **Admin Mode**: Click "Admin Mode" to access settings
3. **Add Google Maps Link**: In admin mode, add your Google Maps embed URL
4. **Configure Settings**: Set courts, max players, standby limit, etc.
5. **Save Settings**: Click "Save Settings" to persist changes
6. **Player Registration**: Users can register for games
7. **Standby System**: When full, players go to standby list
8. **Finish Match**: Use "Finish Match" to clear players and end session

## Google Maps Integration

To add a map to your location:

1. Go to [Google Maps](https://maps.google.com)
2. Search for your location
3. Click "Share" → "Embed a map"
4. Copy the iframe src URL
5. Paste it in the "Google Maps Link" field in admin mode

## API Endpoints

- `GET /api/game/current` - Get current active session
- `PUT /api/game/:id` - Update session settings
- `POST /api/game/:id/players` - Add player
- `DELETE /api/game/:id/players/:playerId` - Remove player
- `PUT /api/game/:id/close` - Finish match

## Troubleshooting

### Node.js Version Issues
If you encounter Node.js version compatibility issues:
- The application is tested with Node.js v16.13.2
- Some packages may show warnings but the app will still work
- For best performance, consider upgrading to Node.js v18+

### MongoDB Connection
- Ensure your MongoDB Atlas cluster is running
- Check that your IP address is whitelisted in MongoDB Atlas
- Verify your connection string in `server/.env`

## Made with ❤️ by Shuttle Hustle 
