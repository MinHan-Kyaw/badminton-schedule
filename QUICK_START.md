# 🚀 Quick Start Guide

## Demo Mode (No Backend Required)

The application is currently set to **Demo Mode** which means you can test all features immediately without setting up MongoDB Atlas.

### Start the Frontend

```bash
npm run dev
```

The application will be available at: http://localhost:5173

### Features Available in Demo Mode

✅ **Court Management**: Set number of courts (1-10)  
✅ **Player Registration**: Add, edit, and remove players  
✅ **Admin Panel**: Toggle between admin and player views  
✅ **Mobile Responsive**: Works great on mobile devices  
✅ **Real-time Updates**: All changes are reflected immediately  
✅ **Capacity Management**: Automatic max player calculation (6 per court)  

### Demo Data

The demo comes pre-loaded with 18 players to show the full functionality:
- Htet, Min, Amps, Valentine, Jack.R, Lee 🥸, Edward, Jack Lee, Hamad, May 🌟, Kevin, Fabien, Benny, BJ, ING, Tete, Chris, Sophie

## Full Setup with MongoDB Atlas

When you're ready to use the full version with persistent data:

1. **Set up MongoDB Atlas** (see README.md for detailed instructions)
2. **Switch to full version** by changing `src/App.tsx`:
   ```tsx
   import BadmintonManager from './components/BadmintonManager'
   // instead of DemoBadmintonManager
   ```
3. **Start the backend**:
   ```bash
   cd server
   npm run dev
   ```
4. **Configure environment variables** (see README.md)

## Current Status

- ✅ Frontend: Complete and working
- ✅ Backend: Complete and ready
- ✅ Demo Mode: Working immediately
- ✅ MongoDB Integration: Ready to use
- ✅ Mobile Responsive: Optimized for mobile

## Next Steps

1. Test the demo mode
2. Set up MongoDB Atlas when ready
3. Deploy to your preferred hosting platform

---

**Note**: The demo mode data is not persisted - it resets when you refresh the page. For persistent data, use the full MongoDB version. 
