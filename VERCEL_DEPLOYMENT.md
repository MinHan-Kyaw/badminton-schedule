# 🚀 Vercel Deployment Guide - Single Repository

This guide shows how to deploy your Badminton Manager app from a single GitHub repository to Vercel.

## 📋 Prerequisites

1. **GitHub Repository**: Your code is pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas**: Set up your database

## 🎯 Deployment Strategy

Since you have both frontend and backend in one repo, we'll create **two separate Vercel projects**:

- **Project 1**: Backend (Node.js server)
- **Project 2**: Frontend (React app)

## 🚀 Method 1: Vercel Dashboard (Recommended)

### Step 1: Deploy Backend

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure the project:
   ```
   Project Name: badminton-backend
   Framework Preset: Other (or leave blank)
   Root Directory: server
   Build Command: npm install
   Output Directory: ./
   Install Command: npm install
   ```
5. Click **"Deploy"**

### Step 2: Deploy Frontend

1. Go back to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"** again
3. Import the same GitHub repository
4. Configure the project:
   ```
   Project Name: badminton-frontend
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
5. Click **"Deploy"**

## 🚀 Method 2: Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### Step 2: Deploy Backend
```bash
cd server
vercel
# Follow prompts - choose project name like "badminton-backend"
```

### Step 3: Deploy Frontend
```bash
cd ..
vercel
# Follow prompts - choose project name like "badminton-frontend"
```

## 🔧 Environment Variables Setup

### Backend Project Settings
1. Go to your backend project in Vercel dashboard
2. Navigate to **Settings → Environment Variables**
3. Add:
   ```
   Name: MONGODB_URI
   Value: mongodb+srv://your-username:password@cluster.mongodb.net/badminton
   Environment: Production
   ```

### Frontend Project Settings
1. Go to your frontend project in Vercel dashboard
2. Navigate to **Settings → Environment Variables**
3. Add:
   ```
   Name: VITE_API_URL
   Value: https://your-backend-project.vercel.app/api
   Environment: Production
   ```

## 🔄 Auto-Deployment Setup

Both projects will automatically redeploy when you push to your GitHub repository.

### For Backend Updates:
- Push changes to GitHub
- Vercel detects changes in `/server` directory
- Backend automatically redeploys

### For Frontend Updates:
- Push changes to GitHub
- Vercel detects changes in root directory
- Frontend automatically redeploys

## 🛠️ CORS Configuration

If you encounter CORS issues, update your `server/server.js`:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend-project.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

## 📊 Monitoring

### View Logs:
- Backend: Go to backend project → Functions → View logs
- Frontend: Go to frontend project → Deployments → View logs

### Check Status:
- Both projects show deployment status in dashboard
- Green checkmark = successful deployment
- Red X = deployment failed

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check build logs in Vercel dashboard
   - Verify all dependencies are in package.json

2. **Environment Variables Not Working**:
   - Ensure variables are set for "Production" environment
   - Redeploy after adding variables

3. **CORS Errors**:
   - Update CORS settings in server.js
   - Include your frontend domain

4. **MongoDB Connection Issues**:
   - Verify MONGODB_URI is correct
   - Check MongoDB Atlas network access

## ✅ Deployment Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] MONGODB_URI environment variable set
- [ ] VITE_API_URL environment variable set
- [ ] CORS configured (if needed)
- [ ] Application tested and working
- [ ] Custom domain configured (optional)

## 🎉 Success!

Your Badminton Manager app is now live on Vercel with:
- **Frontend**: `https://your-frontend-project.vercel.app`
- **Backend**: `https://your-backend-project.vercel.app`

Both projects will automatically update when you push changes to GitHub! 🏸✨ 
