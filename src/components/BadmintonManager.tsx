import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ArrowUp,
} from "lucide-react";
import { GameSession, Player, GameSettings } from "../types";
import { gameApi } from "../services/api";

const BadmintonManager: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [removingPlayer, setRemovingPlayer] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingName, setEditingName] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<string | null>(null);
  const [showFinishMatchDialog, setShowFinishMatchDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load current session on component mount
  useEffect(() => {
    loadCurrentSession();
  }, []);

  const loadCurrentSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await gameApi.getCurrentSession();
      if (response.success && response.data) {
        setGameSession(response.data);
      } else {
        // No active session found, create a default one
        setGameSession({
          courts: 3,
          maxPlayers: 18,
          maxStandbyPlayers: 4,
          date: "Saturday",
          time: "10:00 AM–12:00 PM",
          location: "Green Hill",
          isActive: false,
          players: [],
          standbyPlayers: [],
        });
      }
    } catch (err) {
      setError("Failed to load game session. Please try again.");
      console.error("Error loading session:", err);
    } finally {
      setLoading(false);
    }
  };



  const saveSettings = async (formData: any) => {
    try {
      setSavingSettings(true);
      setError(null);
      let response;

      if (gameSession?._id) {
        // Update existing session
        response = await gameApi.updateSession(
          gameSession._id,
          formData
        );
      } else {
        // Create new session
        const newSession = {
          ...formData,
          isActive: true,
          players: [],
          standbyPlayers: [],
        };
        response = await gameApi.createSession(newSession);
      }

      if (response.success && response.data) {
        setGameSession(response.data);
        setHasUnsavedChanges(false);
        setSuccess("Settings saved successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Failed to save settings. Please try again.");
      console.error("Error saving settings:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  const finishMatch = async () => {
    if (!gameSession?._id) return;

    try {
      setError(null);
      const response = await gameApi.closeSession(gameSession._id);
      if (response.success && response.data) {
        setGameSession(response.data);
        setShowFinishMatchDialog(false);
        setSuccess("Match finished successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Failed to finish match. Please try again.");
      console.error("Error finishing match:", err);
    }
  };

  const addPlayer = async () => {
    if (!gameSession || !newPlayerName.trim()) return;

    // Check if we've reached total capacity (regular + standby)
    const totalCapacity = gameSession.maxPlayers + (gameSession.maxStandbyPlayers || 0);
    const currentTotal = gameSession.players.length + (gameSession.standbyPlayers?.length || 0);
    
    if (currentTotal >= totalCapacity) {
      setError("Maximum capacity reached! No more players can be added.");
      return;
    }

    try {
      setAddingPlayer(true);
      setError(null);
      const player: Omit<Player, "_id"> = {
        name: newPlayerName.trim(),
        joinedAt: new Date(),
      };

      const response = await gameApi.addPlayer(gameSession._id!, player);
      if (response.success && response.data) {
        setGameSession(response.data);
        setNewPlayerName("");
        
        // Determine if player was added as regular or standby
        const wasAddedAsStandby = response.data.standbyPlayers?.some(p => p.name === newPlayerName.trim());
        const successMessage = wasAddedAsStandby 
          ? "Player added to standby list successfully!" 
          : "Player added successfully!";
        
        setSuccess(successMessage);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Failed to add player. Please try again.");
      console.error("Error adding player:", err);
    } finally {
      setAddingPlayer(false);
    }
  };

  const removePlayer = async (playerId: string) => {
    if (!gameSession?._id) return;

    try {
      setRemovingPlayer(true);
      setError(null);
      const response = await gameApi.removePlayer(gameSession._id, playerId);
      if (response.success && response.data) {
        setGameSession(response.data);
        setSuccess("Player removed successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Failed to remove player. Please try again.");
      console.error("Error removing player:", err);
    } finally {
      setRemovingPlayer(false);
    }
  };

  const confirmRemovePlayer = (playerId: string) => {
    setPlayerToRemove(playerId);
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (playerToRemove) {
      await removePlayer(playerToRemove);
      setPlayerToRemove(null);
      setShowConfirmDialog(false);
    }
  };

  const handleCancelRemove = () => {
    setPlayerToRemove(null);
    setShowConfirmDialog(false);
  };

  const handleAdminModeClick = () => {
    if (!isAdmin) {
      setShowPasswordModal(true);
      setAdminPassword("");
      setPasswordError("");
    } else {
      setIsAdmin(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!adminPassword.trim()) {
      setPasswordError("Please enter a password");
      return;
    }

    try {
      setVerifyingPassword(true);
      setPasswordError("");
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAdmin(true);
        setShowPasswordModal(false);
        setAdminPassword("");
        setPasswordError("");
      } else {
        setPasswordError("Incorrect password");
      }
    } catch (error) {
      console.error('Password verification error:', error);
      setPasswordError("Error verifying password");
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setAdminPassword("");
    setPasswordError("");
    setVerifyingPassword(false);
  };

  // Helper functions for time range
  const getStartTime = (timeString: string): string => {
    if (!timeString) return "10:00 AM";
    const parts = timeString.split("–");
    return parts[0]?.trim() || "10:00 AM";
  };

  const getEndTime = (timeString: string): string => {
    if (!timeString) return "12:00 PM";
    const parts = timeString.split("–");
    return parts[1]?.trim() || "12:00 PM";
  };



  // Convert various Google Maps URLs to embed format
  const convertToEmbedUrl = (url: string): string => {
    // Handle Google Maps app links (maps.app.goo.gl)
    if (url.includes("maps.app.goo.gl")) {
      // For app links, we'll use the coordinates for Green Hill Badminton
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.1234567890123!2d98.9679692!3d18.8042396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3a6010b17c85%3A0x2b7b5e5ce44df965!2sGreen%20Hill%20Badminton!5e0!3m2!1sen!2sth!4v1234567890123`;
    }

    // Handle Google Maps place links
    if (url.includes("google.com/maps/place/")) {
      // Extract coordinates from the URL
      const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        const lat = coordMatch[1];
        const lng = coordMatch[2];
        // Create a proper embed URL with the coordinates
        return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.1234567890123!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3a6010b17c85%3A0x2b7b5e5ce44df965!2sGreen%20Hill%20Badminton!5e0!3m2!1sen!2sth!4v1234567890123`;
      }
    }

    // Handle regular Google Maps URLs
    if (url.includes("/maps/")) {
      return url.replace("/maps/", "/maps/embed/");
    }

    // If it's already an embed URL, return as is
    if (url.includes("/maps/embed")) {
      return url;
    }

    // Fallback: return the original URL
    return url;
  };

  const startEdit = (index: number) => {
    if (!gameSession) return;
    setEditingIndex(index);

    // Check if it's a regular player or standby player
    if (index < gameSession.players.length) {
      setEditingName(gameSession.players[index].name);
    } else {
      const standbyIndex = index - gameSession.players.length;
      setEditingName(gameSession.standbyPlayers[standbyIndex].name);
    }
  };

  const saveEdit = async () => {
    if (!gameSession || editingIndex === -1 || !editingName.trim()) return;

    try {
      setError(null);

      // Check if it's a regular player or standby player
      let player;
      if (editingIndex < gameSession.players.length) {
        player = gameSession.players[editingIndex];
      } else {
        const standbyIndex = editingIndex - gameSession.players.length;
        player = gameSession.standbyPlayers[standbyIndex];
      }

      const response = await gameApi.updatePlayer(
        gameSession._id!,
        player._id!,
        { name: editingName.trim() }
      );

      if (response.success && response.data) {
        setGameSession(response.data);
        setEditingIndex(-1);
        setEditingName("");
        setSuccess("Player name updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Failed to update player name. Please try again.");
      console.error("Error updating player:", err);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditingName("");
  };

  const promotePlayer = async (playerId: string) => {
    if (!gameSession?._id) return;

    try {
      setError(null);
      const response = await gameApi.promotePlayer(gameSession._id, playerId);
      if (response.success && response.data) {
        setGameSession(response.data);
        setSuccess("Player promoted successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Failed to promote player. Please try again.");
      console.error("Error promoting player:", err);
    }
  };

  const AdminPanel: React.FC = () => {
    // Local state for form inputs (only updates when save is clicked)
    const [formData, setFormData] = useState({
      courts: gameSession?.courts || 3,
      maxPlayers: gameSession?.maxPlayers || 18,
      maxStandbyPlayers: gameSession?.maxStandbyPlayers || 4,
      date: gameSession?.date || "Saturday",
      time: gameSession?.time || "10:00 AM–12:00 PM",
      location: gameSession?.location || "Green Hill",
      googleMapsLink: gameSession?.googleMapsLink || "",
    });

    // Update form data when gameSession changes
    useEffect(() => {
      if (gameSession) {
        setFormData({
          courts: gameSession.courts || 3,
          maxPlayers: gameSession.maxPlayers || 18,
          maxStandbyPlayers: gameSession.maxStandbyPlayers || 4,
          date: gameSession.date || "Saturday",
          time: gameSession.time || "10:00 AM–12:00 PM",
          location: gameSession.location || "Green Hill",
          googleMapsLink: gameSession.googleMapsLink || "",
        });
      }
    }, [gameSession]);

    // Handle input changes (only updates local state)
    const handleInputChange = (field: keyof GameSettings, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setHasUnsavedChanges(true);
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Admin Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Courts
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.courts}
              onChange={(e) => {
                const courts = parseInt(e.target.value) || 1;
                handleInputChange("courts", courts);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Players (Auto: {formData.courts * 6})
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.maxPlayers}
              onChange={(e) =>
                handleInputChange("maxPlayers", parseInt(e.target.value) || 1)
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Standby Players
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.maxStandbyPlayers}
              onChange={(e) =>
                handleInputChange("maxStandbyPlayers", parseInt(e.target.value) || 0)
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day
            </label>
            <select
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Start Time
                </label>
                <select
                  value={getStartTime(formData.time)}
                  onChange={(e) => {
                    const timeRange = `${e.target.value}–${getEndTime(formData.time)}`;
                    handleInputChange("time", timeRange);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="6:00 AM">6:00 AM</option>
                  <option value="7:00 AM">7:00 AM</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                  <option value="9:00 PM">9:00 PM</option>
                  <option value="10:00 PM">10:00 PM</option>
                  <option value="11:00 PM">11:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  End Time
                </label>
                <select
                  value={getEndTime(formData.time)}
                  onChange={(e) => {
                    const timeRange = `${getStartTime(formData.time)}–${e.target.value}`;
                    handleInputChange("time", timeRange);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7:00 AM">7:00 AM</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                  <option value="9:00 PM">9:00 PM</option>
                  <option value="10:00 PM">10:00 PM</option>
                  <option value="11:00 PM">11:00 PM</option>
                  <option value="12:00 AM">12:00 AM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps Link
            </label>
            <input
              type="url"
              value={formData.googleMapsLink}
              onChange={(e) => handleInputChange("googleMapsLink", e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => saveSettings(formData)}
            disabled={!hasUnsavedChanges || savingSettings}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {savingSettings ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>

          {gameSession?.isActive && (
            <button
              onClick={() => setShowFinishMatchDialog(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Finish Match
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading game session...</p>
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">No game session found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🏸 Badminton Court Manager
          </h1>
          <button
            onClick={handleAdminModeClick}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isAdmin ? "Switch to Player View" : "Admin Mode"}
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-800 font-medium">{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800 font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Admin Panel */}
        {isAdmin && <AdminPanel />}

        {/* Game Info Card - Only show when there's an active match */}
        {gameSession.isActive && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {gameSession.date} {gameSession.courts} Court Badminton Game -
              Sign Up
            </h2>

            <div className="text-lg text-gray-700 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏸</span>
                <span className="font-semibold">Badminton Activity</span>
              </div>

              <div className="space-y-2 text-base">
                <div className="flex items-center gap-2">
                  <span>🏟</span>
                  <span>
                    <strong>Courts:</strong> {gameSession.courts}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    <strong>Location:</strong>{" "}
                    {gameSession.googleMapsLink ? (
                      <a
                        href={gameSession.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                      >
                        {gameSession.location}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      gameSession.location
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    <strong>Time:</strong> {gameSession.time}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">🐉 Important:</span> Signing up
                means you agree to split the costs. If you need to cancel,
                please do so at least 24 hours in advance. Last-minute
                cancellations will not be refunded.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <span className="font-semibold">💰 Cost:</span> Venue and
                shuttlecock fees will be split equally. Payment can be made via
                cash or QR code.
              </p>
            </div>

            {/* Player Registration */}
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder={
                    gameSession.players.length >= gameSession.maxPlayers 
                      ? "Enter your name (will be added to standby)" 
                      : "Enter your name"
                  }
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && addPlayer()}
                />
                <button
                  onClick={addPlayer}
                  disabled={
                    !newPlayerName.trim() ||
                    (gameSession.players.length + (gameSession.standbyPlayers?.length || 0)) >= 
                    (gameSession.maxPlayers + (gameSession.maxStandbyPlayers || 0)) ||
                    addingPlayer
                  }
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {addingPlayer ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <div className="flex justify-center items-center gap-4 mb-2">
                  <span
                    className={`text-lg font-semibold ${
                      gameSession.players.length >= gameSession.maxPlayers
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {gameSession.players.length} / {gameSession.maxPlayers} players
                  </span>
                  {gameSession.standbyPlayers && gameSession.standbyPlayers.length > 0 && (
                    <span className="text-blue-600 text-lg font-semibold">
                      {gameSession.standbyPlayers.length} / {gameSession.maxStandbyPlayers} standby
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Total: {gameSession.players.length + (gameSession.standbyPlayers?.length || 0)} / {gameSession.maxPlayers + (gameSession.maxStandbyPlayers || 0)} capacity
                </div>
                {gameSession.players.length >= gameSession.maxPlayers && (
                  <div className="text-orange-600 text-sm mt-1">
                    Regular slots full - New players will be added to standby list
                  </div>
                )}
                {(gameSession.players.length + (gameSession.standbyPlayers?.length || 0)) >= (gameSession.maxPlayers + (gameSession.maxStandbyPlayers || 0)) && (
                  <div className="text-red-600 text-sm mt-1 font-semibold">
                    Maximum capacity reached - No more players can be added
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Players List */}
        {gameSession.isActive && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Registered Players
            </h3>

            {gameSession.players.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No players registered yet. Be the first to sign up!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {gameSession.players.map((player, index) => (
                  <div
                    key={player._id || index}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-600 text-sm">
                        {index + 1}.
                      </span>
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 p-1 border border-gray-300 rounded text-sm"
                          onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                          autoFocus
                        />
                      ) : (
                        <span className="text-gray-800 text-sm">
                          {player.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {editingIndex === index ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(index)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => confirmRemovePlayer(player._id!)}
                            disabled={removingPlayer}
                            className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {removingPlayer ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Standby Players List */}
        {gameSession.isActive &&
          gameSession.standbyPlayers &&
          gameSession.standbyPlayers.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Standby Players
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {gameSession.standbyPlayers.map((player, index) => (
                  <div
                    key={player._id || index}
                    className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-3 hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-orange-600 text-sm">
                        S{index + 1}.
                      </span>
                      {editingIndex === index + gameSession.players.length ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 p-1 border border-gray-300 rounded text-sm"
                          onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                          autoFocus
                        />
                      ) : (
                        <span className="text-gray-800 text-sm">
                          {player.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {editingIndex === index + gameSession.players.length ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              startEdit(index + gameSession.players.length)
                            }
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => promotePlayer(player._id!)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Promote to regular player"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => confirmRemovePlayer(player._id!)}
                            disabled={removingPlayer}
                            className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {removingPlayer ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Map Section */}
        {gameSession?.googleMapsLink && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Map
            </h3>
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe
                src={convertToEmbedUrl(gameSession.googleMapsLink)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Badminton Court Location"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>Made with ❤️ by MIN 🧑🏻‍💻</p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Removal
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this player? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelRemove}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={removingPlayer}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {removingPlayer ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Access Required
            </h3>
            <p className="text-gray-600 mb-4">
              Please enter the admin password to access admin settings.
            </p>
            <div className="mb-4">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                disabled={verifyingPassword}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                onKeyPress={(e) => e.key === "Enter" && !verifyingPassword && handlePasswordSubmit()}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-2">{passwordError}</p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handlePasswordCancel}
                disabled={verifyingPassword}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={verifyingPassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {verifyingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Access Admin"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Match Confirmation Dialog */}
      {showFinishMatchDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Finish Match
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to finish this match? This will:
              <br />• Clear all registered players
              <br />• Set the session as inactive
              <br />• This action cannot be undone
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowFinishMatchDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={finishMatch}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Finish Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadmintonManager;
