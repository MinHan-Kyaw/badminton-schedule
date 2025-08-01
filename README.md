# 🏸 Badminton Court Manager (Shuttle Hustle)

A modern web application for managing badminton court bookings, player registrations, and game sessions.

## Features

- **Court Management**: Configure number of courts and player limits
- **Player Registration**: Real-time player sign-up with standby list
- **Admin Panel**: Manage game settings, players, and sessions
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live player count and status updates

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 Vercel Deployment Guide

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a MongoDB database
3. **GitHub Repository**: Push your code to GitHub

### Step 1: Deploy Backend Server

1. **Create Backend Project**:
   ```bash
   # Navigate to server directory
   cd server
   
   # Deploy to Vercel
   vercel
   ```

2. **Set Environment Variables**:
   - Go to your Vercel dashboard
   - Navigate to your backend project
   - Go to Settings → Environment Variables
   - Add: `MONGODB_URI` = Your MongoDB connection string

3. **Get Backend URL**:
   - Copy the deployment URL (e.g., `https://your-backend.vercel.app`)

### Step 2: Deploy Frontend

1. **Create Frontend Project**:
   ```bash
   # Navigate to root directory
   cd ..
   
   # Deploy to Vercel
   vercel
   ```

2. **Set Environment Variables**:
   - Go to your Vercel dashboard
   - Navigate to your frontend project
   - Go to Settings → Environment Variables
   - Add: `VITE_API_URL` = Your backend URL + `/api` (e.g., `https://your-backend.vercel.app/api`)

### Step 3: Update CORS (if needed)

If you encounter CORS issues, update your backend `server.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### Step 4: Test Deployment

1. Visit your frontend URL
2. Test all functionality:
   - Create a new game session
   - Add players
   - Test standby functionality
   - Verify admin features

## 🛠️ Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account

### Setup

1. **Clone Repository**:
   ```bash
   git clone <your-repo-url>
   cd Badminton
   ```

2. **Install Dependencies**:
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment Variables**:
   
   Create `.env` file in server directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=3001
   ```
   
   Create `.env` file in root directory:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

4. **Run Development Servers**:
   ```bash
   # Run both frontend and backend
   npm run dev:full
   
   # Or run separately:
   npm run dev          # Frontend only
   npm run server       # Backend only
   ```

5. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## 📁 Project Structure

```
Badminton/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── services/          # API services
│   └── types/             # TypeScript types
├── server/                # Backend server
│   ├── models/            # MongoDB models
│   └── server.js          # Express server
├── vercel.json            # Frontend Vercel config
├── server/vercel.json     # Backend Vercel config
└── package.json           # Frontend dependencies
```

## 🔧 Configuration

### Environment Variables

**Frontend**:
- `VITE_API_URL`: Backend API URL

**Backend**:
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 3001)

### MongoDB Setup

1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Add it to environment variables
4. The app will automatically create collections

## 🎯 Features

### Admin Features
- Configure courts and player limits
- Set game date, time, and location
- Manage player registrations
- Finish game sessions

### Player Features
- Real-time registration
- Automatic standby list when full
- Player name editing
- Session status updates

## 🚀 Deployment Checklist

- [ ] MongoDB Atlas database configured
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] CORS configured
- [ ] All features tested
- [ ] Domain configured (optional)

## 📞 Support

For issues or questions:
1. Check the deployment logs in Vercel dashboard
2. Verify environment variables are set correctly
3. Test API endpoints directly
4. Check MongoDB connection

---

Made with ❤️ by MIN 🧑🏻‍💻
