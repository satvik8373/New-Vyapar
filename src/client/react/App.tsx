import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import Phaser from 'phaser';

import { theme } from './theme/theme';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { CreateRoomScreen } from './screens/CreateRoomScreen';
import { JoinRoomScreen } from './screens/JoinRoomScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { GameScreen } from './screens/GameScreen';

import { ProfileModal } from './modals/ProfileModal';
import { FriendsModal } from './modals/FriendsModal';
import { StatsModal } from './modals/StatsModal';
import { SettingsDialog } from './modals/SettingsDialog';
import { HelpDialog } from './components/HelpDialog';
import { AIDifficultyModal } from './modals/AIDifficultyModal';
import { AuthService, PlayerProfile } from '../firebase/authService';
import { RoomService } from '../firebase/roomService';
import { FirebaseMultiplayerAdapter } from '../firebase/firebaseMultiplayerAdapter';
import { UserService, UserProfileDoc } from '../firebase/userService';
import { GameEngine, AIDifficulty } from '../game-engine/GameEngine';

// ── Screen navigation type ────────────────────────────────────────────────
export type AppScreen =
  | 'SPLASH'
  | 'ONBOARDING'
  | 'LOGIN'
  | 'MAIN_MENU'
  | 'CREATE_ROOM'
  | 'JOIN_ROOM'
  | 'LOBBY'
  | 'GAME';

// ── Session persistence key ───────────────────────────────────────────────
const SESSION_KEY = 'navo_vyapar_session';

interface SessionState {
  screen: AppScreen;
  userName: string;
  roomCode: string;
}

function readSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

function writeSession(state: SessionState): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

/** Resolve the startup screen from session — skip animations for restored sessions */
function resolveInitialScreen(): { screen: AppScreen; userName: string; roomCode: string } {
  const saved = readSession();
  if (saved) {
    if (saved.screen === 'SPLASH' || saved.screen === 'ONBOARDING') {
      return { screen: 'LOGIN', userName: saved.userName, roomCode: saved.roomCode };
    }
    return { screen: saved.screen, userName: saved.userName, roomCode: saved.roomCode };
  }
  return { screen: 'SPLASH', userName: 'Trader', roomCode: '' };
}

export const App: React.FC = () => {
  const initial = resolveInitialScreen();

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(initial.screen);
  const [userName, setUserName] = useState(initial.userName);
  const [userAvatar, setUserAvatar] = useState('crown');
  const [userCoins, setUserCoins] = useState(12500);
  const [userPoints, setUserPoints] = useState(150);
  const [userLevel, setUserLevel] = useState(1);
  const [userRankTitle, setUserRankTitle] = useState('Novice Trader');
  const [roomCode, setRoomCode] = useState(initial.roomCode);

  // Global Modals State
  const [profileOpen, setProfileOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const phaserGameRef = useRef<Phaser.Game | null>(null);

  // Subscribe to Firebase Auth and live Firestore User Database
  useEffect(() => {
    let unsubUser: (() => void) | null = null;
    const unsubAuth = AuthService.getInstance().subscribeAuth((profile: PlayerProfile | null) => {
      if (profile) {
        setUserName(profile.name);
        if (profile.avatar) setUserAvatar(profile.avatar);
        if (typeof profile.coins === 'number') setUserCoins(profile.coins);
        if (typeof profile.points === 'number') setUserPoints(profile.points);
        if (typeof profile.level === 'number') setUserLevel(profile.level);
        if (profile.rankTitle) setUserRankTitle(profile.rankTitle);

        if (unsubUser) unsubUser();
        unsubUser = UserService.getInstance().subscribeUserProfile(profile.uid, (userDoc: UserProfileDoc) => {
          setUserName(userDoc.displayName);
          setUserAvatar(userDoc.avatar);
          setUserCoins(userDoc.coins);
          setUserPoints(userDoc.points);
          setUserLevel(userDoc.level);
          setUserRankTitle(userDoc.rankTitle);
        });
      }
    });

    return () => {
      unsubAuth();
      if (unsubUser) unsubUser();
    };
  }, []);

  // Persist screen to sessionStorage whenever it changes
  useEffect(() => {
    if (currentScreen !== 'SPLASH' && currentScreen !== 'ONBOARDING') {
      writeSession({ screen: currentScreen, userName, roomCode });
    }
  }, [currentScreen, userName, roomCode]);

  // Re-activate multiplayer adapter when restoring an active game screen on page refresh
  useEffect(() => {
    if (currentScreen === 'GAME' && roomCode) {
      const profile = AuthService.getInstance().getCurrentProfile();
      const uid = profile?.uid || 'guest';
      FirebaseMultiplayerAdapter.activate(roomCode, uid);
    }
  }, [currentScreen, roomCode]);

  // Pure React Board is active - Phaser canvas disabled
  useEffect(() => {
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
      phaserGameRef.current = null;
    }
  }, [currentScreen]);

  // Screen Navigation Handlers
  const handleSplashDone = () => setCurrentScreen('ONBOARDING');
  const handleOnboardingDone = () => setCurrentScreen('LOGIN');
  const handleLoginDone = (name: string) => {
    setUserName(name);
    setCurrentScreen('MAIN_MENU');
  };

  const handleCreateRoom = () => setCurrentScreen('CREATE_ROOM');
  const handleJoinRoom = () => setCurrentScreen('JOIN_ROOM');

  const handleStartVsComputer = (difficulty: AIDifficulty) => {
    setAiModalOpen(false);
    setRoomCode('');
    FirebaseMultiplayerAdapter.getInstance()?.destroy();
    GameEngine.getInstance().setMultiplayerAdapter(null);
    GameEngine.getInstance().setAIDifficulty(difficulty);
    GameEngine.getInstance().resetGame(userName);
    setCurrentScreen('GAME');
  };

  const handleCreateSuccess = (code: string) => {
    setRoomCode(code);
    setCurrentScreen('LOBBY');
  };

  const handleJoinSuccess = (code: string, name: string, avatar: string) => {
    setRoomCode(code);
    setUserName(name);
    setUserAvatar(avatar);
    setCurrentScreen('LOBBY');
  };

  const handleStartGame = useCallback(() => {
    const profile = AuthService.getInstance().getCurrentProfile();
    const uid = profile?.uid || 'guest';
    FirebaseMultiplayerAdapter.activate(roomCode, uid);
    setCurrentScreen('GAME');
  }, [roomCode]);

  const handleExitToMenu = () => {
    const profile = AuthService.getInstance().getCurrentProfile();
    if (profile && roomCode) {
      RoomService.getInstance().leaveRoom(roomCode, profile.uid);
    }
    FirebaseMultiplayerAdapter.getInstance()?.destroy();
    GameEngine.getInstance().setMultiplayerAdapter(null);

    // Clear game session — back to menu is intentional navigation
    clearSession();
    writeSession({ screen: 'MAIN_MENU', userName, roomCode: '' });
    setRoomCode('');
    setCurrentScreen('MAIN_MENU');
  };

  const handleLogout = async () => {
    try {
      const profile = AuthService.getInstance().getCurrentProfile();
      if (profile && roomCode) {
        RoomService.getInstance().leaveRoom(roomCode, profile.uid);
      }
      FirebaseMultiplayerAdapter.getInstance()?.destroy();
      GameEngine.getInstance().setMultiplayerAdapter(null);
      await AuthService.getInstance().signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    clearSession();
    setRoomCode('');
    setProfileOpen(false);
    setSettingsOpen(false);
    setAiModalOpen(false);
    setCurrentScreen('LOGIN');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {currentScreen === 'SPLASH' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', height: '100%' }}
            >
              <SplashScreen onComplete={handleSplashDone} />
            </motion.div>
          )}

          {currentScreen === 'ONBOARDING' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', height: '100%' }}
            >
              <OnboardingScreen onComplete={handleOnboardingDone} />
            </motion.div>
          )}

          {currentScreen === 'LOGIN' && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', height: '100%' }}
            >
              <LoginScreen onLogin={handleLoginDone} />
            </motion.div>
          )}

          {currentScreen === 'MAIN_MENU' && (
            <motion.div
              key="main_menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', height: '100%' }}
            >
              <MainMenuScreen
                userName={userName}
                userBalance={userCoins}
                userAvatar={userAvatar}
                userPoints={userPoints}
                userLevel={userLevel}
                userRankTitle={userRankTitle}
                onPlayVsComputer={() => setAiModalOpen(true)}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                onOpenProfile={() => setProfileOpen(true)}
                onOpenFriends={() => setFriendsOpen(true)}
                onOpenStats={() => setStatsOpen(true)}
                onOpenSettings={() => setSettingsOpen(true)}
                onLogout={handleLogout}
              />
            </motion.div>
          )}

          {currentScreen === 'CREATE_ROOM' && (
            <motion.div
              key="create_room"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.25 }}
              style={{ width: '100%', height: '100%' }}
            >
              <CreateRoomScreen
                onBack={() => setCurrentScreen('MAIN_MENU')}
                onCreateSuccess={handleCreateSuccess}
                userName={userName}
                userAvatar={userAvatar}
              />
            </motion.div>
          )}

          {currentScreen === 'JOIN_ROOM' && (
            <motion.div
              key="join_room"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.25 }}
              style={{ width: '100%', height: '100%' }}
            >
              <JoinRoomScreen
                onBack={() => setCurrentScreen('MAIN_MENU')}
                onJoinSuccess={handleJoinSuccess}
                initialName={userName}
                initialAvatar={userAvatar}
              />
            </motion.div>
          )}

          {currentScreen === 'LOBBY' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ width: '100%', height: '100%' }}
            >
              <LobbyScreen
                roomCode={roomCode}
                onBack={() => setCurrentScreen('MAIN_MENU')}
                onStartGame={handleStartGame}
              />
            </motion.div>
          )}

          {currentScreen === 'GAME' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', height: '100%' }}
            >
              <GameScreen onExitToMenu={handleExitToMenu} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Modals accessible from anywhere */}
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          onLogout={handleLogout}
        />

        <FriendsModal
          open={friendsOpen}
          onClose={() => setFriendsOpen(false)}
        />

        <StatsModal
          open={statsOpen}
          onClose={() => setStatsOpen(false)}
        />

        <SettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onOpenHelp={() => setHelpOpen(true)}
          onLeaveGame={() => {
            setSettingsOpen(false);
            handleExitToMenu();
          }}
          onLogout={handleLogout}
        />

        <HelpDialog
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
        />

        <AIDifficultyModal
          open={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          onStart={handleStartVsComputer}
        />
      </Box>
    </ThemeProvider>
  );
};
