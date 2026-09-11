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
import { VoiceChatService } from '../services/VoiceChatService';
import { SoundEffects } from '../audio/SoundEffects';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { FriendService } from '../firebase/friendService';

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
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

function writeSession(state: SessionState): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

/** Resolve the startup screen from persistent session — keep user logged in */
function resolveInitialScreen(): { screen: AppScreen; userName: string; roomCode: string } {
  const isLoggedIn = localStorage.getItem('navo_logged_in') === 'true';
  const savedName = localStorage.getItem('navo_player_name') || 'Trader';
  const saved = readSession();

  // CRITICAL: Never auto-restore to GAME screen on page refresh.
  // A refreshed GAME screen has no live multiplayer connection, causing white screens.
  // Always redirect to MAIN_MENU if the user was in-game.
  if (saved) {
    if (saved.screen === 'GAME') {
      // Clear stale game session — can't safely restore mid-game on refresh
      clearSession();
      return { screen: 'MAIN_MENU', userName: saved.userName || savedName, roomCode: '' };
    }
    if (saved.screen === 'LOBBY' && saved.roomCode) {
      return { screen: 'LOBBY', userName: saved.userName || savedName, roomCode: saved.roomCode };
    }
    if (isLoggedIn) {
      return { screen: 'MAIN_MENU', userName: saved.userName || savedName, roomCode: '' };
    }
    return { screen: saved.screen === 'SPLASH' || saved.screen === 'ONBOARDING' ? 'LOGIN' : saved.screen, userName: saved.userName, roomCode: saved.roomCode };
  }

  if (isLoggedIn) {
    return { screen: 'MAIN_MENU', userName: savedName, roomCode: '' };
  }

  return { screen: 'SPLASH', userName: savedName, roomCode: '' };
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

        localStorage.setItem('navo_logged_in', 'true');
        localStorage.setItem('navo_player_name', profile.name);
        if (profile.avatar) localStorage.setItem('navo_player_avatar', profile.avatar);
        if (profile.uid) localStorage.setItem('navo_user_uid', profile.uid);

        // Track online presence in RTDB
        FriendService.getInstance().setupPresence(profile.uid);

        // Keep logged-in user directly on MAIN_MENU if they were on splash/login
        setCurrentScreen((prev) => {
          if (prev === 'SPLASH' || prev === 'ONBOARDING' || prev === 'LOGIN') {
            return 'MAIN_MENU';
          }
          return prev;
        });

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

  // Persist screen to localStorage whenever it changes
  useEffect(() => {
    if (currentScreen !== 'SPLASH' && currentScreen !== 'ONBOARDING') {
      writeSession({ screen: currentScreen, userName, roomCode });
    }
  }, [currentScreen, userName, roomCode]);

  // Re-activate multiplayer adapter when restoring an active game screen on page refresh
  // NOTE: We no longer auto-restore GAME screens on refresh, so this only fires
  // when navigating into GAME from LOBBY within the same session (not refresh).
  useEffect(() => {
    if (currentScreen === 'GAME' && roomCode) {
      const uid = AuthService.getInstance().getUid() || 'guest';
      FirebaseMultiplayerAdapter.activate(roomCode, uid, userName);
    }
  }, [currentScreen, roomCode, userName]);

  // Pure React Board is active - Phaser canvas disabled
  useEffect(() => {
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
      phaserGameRef.current = null;
    }
  }, [currentScreen]);

  // Screen Navigation Handlers
  const handleSplashDone = () => {
    if (localStorage.getItem('navo_logged_in') === 'true') {
      setCurrentScreen('MAIN_MENU');
    } else {
      setCurrentScreen('ONBOARDING');
    }
  };

  const handleOnboardingDone = () => {
    if (localStorage.getItem('navo_logged_in') === 'true') {
      setCurrentScreen('MAIN_MENU');
    } else {
      setCurrentScreen('LOGIN');
    }
  };

  const handleLoginDone = (name: string) => {
    setUserName(name);
    localStorage.setItem('navo_player_name', name);
    localStorage.setItem('navo_logged_in', 'true');
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
    localStorage.setItem('navo_player_name', name);
    localStorage.setItem('navo_player_avatar', avatar);
    localStorage.setItem('navo_logged_in', 'true');
    setCurrentScreen('LOBBY');
  };

  const handleStartGame = useCallback(() => {
    const uid = AuthService.getInstance().getUid() || 'guest';
    FirebaseMultiplayerAdapter.activate(roomCode, uid, userName);
    setCurrentScreen('GAME');
  }, [roomCode, userName]);

  const handleExitToMenu = () => {
    // 1. Stop all audio immediately
    try { SoundEffects.getInstance().stopCarMoving(); } catch {}

    // 2. Leave room and tear down multiplayer adapter cleanly
    const profile = AuthService.getInstance().getCurrentProfile();
    if (profile && roomCode) {
      RoomService.getInstance().leaveRoom(roomCode, profile.uid).catch(() => {});
    }
    FirebaseMultiplayerAdapter.getInstance()?.destroy();
    VoiceChatService.getInstance().destroy();
    GameEngine.getInstance().setMultiplayerAdapter(null);

    // 3. Reset GameEngine to a clean slate so there's nothing stale in memory
    GameEngine.getInstance().resetGame(userName || 'Player');

    // 4. Clear session and navigate — write MAIN_MENU immediately so refresh is safe
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
      VoiceChatService.getInstance().destroy();
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
              <ErrorBoundary fallbackScreen={handleExitToMenu}>
                <GameScreen onExitToMenu={handleExitToMenu} roomCode={roomCode} />
              </ErrorBoundary>
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
