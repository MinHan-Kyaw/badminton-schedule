# Automatic Player Rebalancing Feature

## Overview
When the `maxPlayers` setting is changed in the admin panel, the system now automatically rebalances players between the regular players array and standby array to maintain proper capacity limits.

## How It Works

### When Max Players is Increased
- If there are players in the standby list, they are automatically moved to the regular players array
- The number of players moved is limited by:
  - The increase in max players (new max - old max)
  - The number of available standby players
- Example: If max players increases from 18 to 20 and there are 3 standby players, 2 players will be moved from standby to regular players

### When Max Players is Decreased
- If the current number of regular players exceeds the new max players limit, excess players are moved to standby
- The number of players moved is limited by:
  - The number of excess players (current players - new max)
  - Available space in the standby list (max standby - current standby)
- Example: If max players decreases from 20 to 18 and there are 20 regular players, 2 players will be moved to standby (if space is available)

## User Interface Features

### Admin Panel Warning
- When changing the max players value, a blue warning box appears below the input field
- Shows exactly how many players will be moved and in which direction
- Helps admins understand the impact of their changes before saving

### Success Messages
- After saving settings, a detailed success message appears
- Shows how many players were automatically moved
- Examples:
  - "Settings saved! 2 players moved from standby to regular players."
  - "Settings saved! 1 player moved to standby due to reduced max players."

## Technical Implementation

### Backend (server.js)
- Modified the `/api/game/:id` PUT endpoint
- Compares old and new maxPlayers values
- Automatically rebalances players when maxPlayers changes
- Maintains data integrity and proper array management

### Frontend (BadmintonManager.tsx)
- Enhanced `saveSettings` function to detect maxPlayers changes
- Added dynamic warning messages in the admin panel
- Improved success message handling with specific details about player movements

## Benefits
1. **Automatic Management**: No manual intervention required when changing capacity
2. **Data Integrity**: Players are never lost during capacity changes
3. **User Experience**: Clear feedback about what changes will occur
4. **Flexibility**: Supports both increasing and decreasing capacity
5. **Fairness**: Players are moved in FIFO order (first in, first out)

## Example Scenarios

### Scenario 1: Increase Capacity
- Current: 18 max players, 18 regular players, 3 standby players
- Change: Increase to 20 max players
- Result: 20 regular players, 1 standby player (2 moved from standby)

### Scenario 2: Decrease Capacity
- Current: 20 max players, 20 regular players, 2 standby players (max 4)
- Change: Decrease to 18 max players
- Result: 18 regular players, 4 standby players (2 moved to standby)

### Scenario 3: No Movement Needed
- Current: 18 max players, 15 regular players, 2 standby players
- Change: Increase to 20 max players
- Result: 15 regular players, 2 standby players (no movement needed) 
