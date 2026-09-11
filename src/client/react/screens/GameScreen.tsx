import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import DomainAddIcon from '@mui/icons-material/DomainAdd';

import { GameEngine, GameEngineState } from '../../game-engine/GameEngine';
import { PropertySheet } from '../modals/PropertySheet';
import { EventCardModal } from '../modals/EventCardModal';
import { TradeModal } from '../modals/TradeModal';
import { SettingsDialog } from '../modals/SettingsDialog';
import { ResultModal } from '../modals/ResultModal';
import { DeedLedgerModal } from '../modals/DeedLedgerModal';
import { NavoBankDrawer } from '../components/NavoBankDrawer';
import { HelpDialog } from '../components/HelpDialog';
import { ToastNotifications } from '../components/ToastNotifications';
import { BoardDivSheet, BoardTileStep, BoardDivSheetHandle } from '../components/BoardDivSheet';
import { BOARD_TILES } from '@shared/game-data/boardData';
import { GameBridge } from '../../bridge/GameBridge';
import { CandyButton } from '../components/common';
import { CornerPlayerHUD, HUDPlayerData } from '../components/hud/CornerPlayerHUD';
import { FloatingUtilityRail } from '../components/hud/FloatingUtilityRail';
import { ActivityLogDrawer } from '../components/hud/ActivityLogDrawer';
import { TitleDeedPopupModal } from '../modals/TitleDeedPopupModal';
import { VoiceChatService, VoiceChatState } from '../../services/VoiceChatService';
import { AuthService } from '../../firebase/authService';
import { NetworkQualityService } from '../../services/NetworkQualityService';

interface GameScreenProps {
  onExitToMenu: () => void;
  roomCode?: string;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onExitToMenu, roomCode }) => {
  const engine = GameEngine.getInstance();
  const bridge = GameBridge.getInstance();
  const voiceService = VoiceChatService.getInstance();
  const networkService = NetworkQualityService.getInstance();

  const [engineState, setEngineState] = useState<GameEngineState>(engine.getState());
  const [isMuted, setIsMuted] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceChatState>(voiceService.getState());
  const [networkPing, setNetworkPing] = useState<number>(() => networkService.getPing());

  const {
    players,
    activePlayerIndex,
    phase,
    diceState,
    hoppingState,
    logs,
    activeChanceCard,
    winner,
    monopolyAchieved
  } = engineState;

  // Modal & Drawer dialog states
  const [bankOpen, setBankOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [deedLedgerOpen, setDeedLedgerOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const boardRef = useRef<BoardDivSheetHandle>(null);
  const [boardScale, setBoardScale] = useState<number>(1);

  // Mobile Portrait Orientation Detection (Landscape-First Guidance)
  const [isPortraitMobile, setIsPortraitMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth && window.innerWidth < 768;
  });
  const [dismissRotateHint, setDismissRotateHint] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsPortraitMobile(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // On-screen themed card collection popup
  const [viewingDeedPlayer, setViewingDeedPlayer] = useState<HUDPlayerData | null>(null);

  // Track newly acquired property step to highlight on the card stack
  const [lastAcquiredStep, setLastAcquiredStep] = useState<number | undefined>(undefined);

  // Automatically pop open the on-screen deed collection ONLY when the human player (own player) buys a property!
  const prevPropsRef = useRef<Record<string, number[]>>({});
  useEffect(() => {
    const heroPlayer = players.find((p) => p.isHuman) || players[0];
    players.forEach((p) => {
      const prev = prevPropsRef.current[p.id] || [];
      const curr = p.ownedPropertyIds || [];
      if (curr.length > prev.length) {
        const newlyBought = curr.find((id) => !prev.includes(id));
        // CRITICAL FIX: Only pop open the deed popup for YOUR OWN player. Never for opponents!
        if (newlyBought !== undefined && p.isHuman && p.id === heroPlayer?.id) {
          setLastAcquiredStep(newlyBought);
          setViewingDeedPlayer(p as HUDPlayerData);
        }
      }
      prevPropsRef.current[p.id] = [...curr];
    });
  }, [players]);

  // Clean up any stray Phaser canvases from document.body
  useEffect(() => {
    document.querySelectorAll('body > canvas').forEach((c) => c.remove());
  }, []);

  useEffect(() => {
    const unsubEngine = engine.subscribe((state) => {
      setEngineState(state);
    });

    return () => {
      unsubEngine();
    };
  }, [engine]);

  const heroPlayer = players.find((p) => p.isHuman) || players[0];

  // ── Live Voice Chat Lifecycle ───────────────────────────────────────────
  useEffect(() => {
    const profile = AuthService.getInstance().getCurrentProfile();
    const myUid = profile?.uid || heroPlayer?.id || 'player-1';
    const myName = profile?.name || heroPlayer?.name || 'Player';

    if (roomCode) {
      voiceService.initRoom(roomCode, myUid, myName);
    }

    const unsub = voiceService.subscribe((state) => {
      setVoiceState(state);
      if (state.error) {
        bridge.emitToast(state.error, 'error');
      }
    });

    return () => {
      unsub();
    };
  }, [roomCode, heroPlayer?.id, heroPlayer?.name]);

  // ── Network Quality Ping Listener ────────────────────────────────────────
  useEffect(() => {
    return networkService.subscribe((ping) => {
      setNetworkPing(ping);
    });
  }, [networkService]);

  const handleToggleMic = async () => {
    if (!roomCode) {
      bridge.emitToast(
        'Live Mic is active during multiplayer matches. Create or join a room to talk live!',
        'info'
      );
      return;
    }

    const wasInVoice = voiceState.isInVoice;
    const wasMuted = voiceState.isMuted;

    const success = await voiceService.toggleMic();
    if (!wasInVoice && success) {
      bridge.emitToast(
        '🎙️ Live Voice Chat connected! Speak freely with players.',
        'success'
      );
    } else if (wasInVoice) {
      if (wasMuted) {
        bridge.emitToast('🎙️ Microphone unmuted.', 'info');
      } else {
        bridge.emitToast('🔇 Microphone muted.', 'info');
      }
    }
  };

  const handleToggleMutePeer = (peerId: string) => {
    const isNowMuted = voiceService.toggleMutePeer(peerId);
    const peerPlayer = players.find((p) => p.id === peerId);
    const peerName = peerPlayer?.name || 'Player';
    if (isNowMuted) {
      bridge.emitToast(`Muted ${peerName}'s voice`, 'info');
    } else {
      bridge.emitToast(`Unmuted ${peerName}'s voice`, 'info');
    }
  };

  const winnerPlayer = winner ? players.find((p) => p.id === winner || p.name === winner) : null;
  const activePlayer = players[activePlayerIndex];
  const isHumanTurn = activePlayer?.isHuman ?? true;

  const canRoll =
    (phase === 'PLAYER_TURN' || phase === 'WAITING') &&
    !diceState.rolling &&
    !hoppingState &&
    isHumanTurn;

  const canEndTurn = phase === 'RESOLVING' && isHumanTurn && !hoppingState;
  const activePlayerData = players[activePlayerIndex];

  // Keyboard shortcuts: Space to Roll, E to End Turn, B to Buy, P to Pass
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' || e.key === ' ') {
        if (canRoll) {
          e.preventDefault();
          engine.requestRoll();
        }
      } else if (e.key === 'e' || e.key === 'E') {
        if (canEndTurn) {
          e.preventDefault();
          engine.endTurn();
        }
      } else if (e.key === 'b' || e.key === 'B') {
        if (phase === 'TILE_ACTION' && engineState.selectedProperty && isHumanTurn) {
          e.preventDefault();
          if ((activePlayerData?.balance ?? 0) >= (engineState.selectedProperty.price ?? 0)) {
            engine.buyProperty(engineState.selectedProperty.step);
          }
        }
      } else if (e.key === 'p' || e.key === 'P') {
        if (phase === 'TILE_ACTION' && engineState.selectedProperty && isHumanTurn) {
          e.preventDefault();
          engine.passProperty();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canRoll, canEndTurn, phase, engineState.selectedProperty, isHumanTurn, activePlayerData?.balance, engine]);

  const handleInspectTile = (tile: BoardTileStep) => {
    engine.inspectProperty(tile.step);
  };

  // Arrange players across 4 corners (Human player anchors to bottom-right hero spot)
  const humanPlayer = players.find((p) => p.isHuman) || players[0];
  const opponents = players.filter((p) => p.id !== humanPlayer?.id);

  const prevOwnedIdsRef = useRef<number[]>(humanPlayer?.ownedPropertyIds || []);

  // Detect newly acquired property by human player to highlight on their HUD deck
  useEffect(() => {
    const currentIds = humanPlayer?.ownedPropertyIds || [];
    const prevIds = prevOwnedIdsRef.current;

    if (currentIds.length > prevIds.length) {
      const newStep = currentIds.find((id) => !prevIds.includes(id));
      if (newStep !== undefined) {
        setLastAcquiredStep(newStep);
      }
    }
    prevOwnedIdsRef.current = currentIds;
  }, [humanPlayer?.ownedPropertyIds]);

  const pTopLeft = opponents[0] || (players.length > 0 && players[0].id !== humanPlayer?.id ? players[0] : null);
  const pTopRight = opponents[1] || null;
  const pBottomLeft = opponents[2] || null;
  const pHero = humanPlayer || (players.length > 0 ? players[0] : null);

  const latestLog = logs && logs.length > 0 ? logs[0].text : null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        touchAction: 'none',
        backgroundImage: `radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, rgba(241,245,249,0.65) 100%), url('/assets/images/light_tabletop_wood.jpg')`,
        backgroundColor: '#f1f5f9',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Rotate-to-landscape hint — mobile portrait only, dismissable */}
      {isPortraitMobile && !dismissRotateHint && (
        <Box
          sx={{
            position: 'absolute',
            /* Push below the top HUD chips and safe area */
            top: 'calc(max(10px, env(safe-area-inset-top)) + 40px)',
            left: '50%',
            transform: 'translateX(-50%)',
            /* Above the board and ping bar, below modals */
            zIndex: 200,
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            borderRadius: '16px',
            py: 0.5,
            px: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
            border: '1px solid rgba(255,255,255,0.15)',
            /* Fit between the two top corner HUDs — ~90px chip on each side */
            maxWidth: 'calc(100vw - 180px)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <Typography sx={{ fontSize: '10.5px', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            🔄 Rotate for best view
          </Typography>
          <Box
            component="span"
            onClick={() => setDismissRotateHint(true)}
            sx={{ fontSize: '13px', fontWeight: 900, cursor: 'pointer', color: '#94a3b8', ml: 0.5, lineHeight: 1, flexShrink: 0, '&:hover': { color: '#fff' } }}
          >
            ✕
          </Box>
        </Box>
      )}
      {/* ====================================================================
          1. 4-CORNER FLOATING PLAYER HUDS (BUSINESS TOUR STYLE)
          ==================================================================== */}
      {/* Top-Left: Opponent 1 */}
      {pTopLeft && (
        <CornerPlayerHUD
          player={pTopLeft}
          position="top-left"
          isActiveTurn={activePlayer?.id === pTopLeft.id}
          onTrade={() => setTradeOpen(true)}
          isInVoice={Boolean(voiceState.peers[pTopLeft.id])}
          isMicMuted={voiceState.peers[pTopLeft.id]?.isMuted}
          isSpeaking={voiceState.peers[pTopLeft.id]?.isSpeaking}
          isPeerMutedLocally={voiceState.mutedPeerIds?.includes(pTopLeft.id)}
          onToggleMutePeer={handleToggleMutePeer}
        />
      )}

      {/* Top-Right: Opponent 2 */}
      {pTopRight && (
        <CornerPlayerHUD
          player={pTopRight}
          position="top-right"
          isActiveTurn={activePlayer?.id === pTopRight.id}
          onTrade={() => setTradeOpen(true)}
          isInVoice={Boolean(voiceState.peers[pTopRight.id])}
          isMicMuted={voiceState.peers[pTopRight.id]?.isMuted}
          isSpeaking={voiceState.peers[pTopRight.id]?.isSpeaking}
          isPeerMutedLocally={voiceState.mutedPeerIds?.includes(pTopRight.id)}
          onToggleMutePeer={handleToggleMutePeer}
        />
      )}

      {/* Bottom-Left: Opponent 3 */}
      {pBottomLeft && (
        <CornerPlayerHUD
          player={pBottomLeft}
          position="bottom-left"
          isActiveTurn={activePlayer?.id === pBottomLeft.id}
          onTrade={() => setTradeOpen(true)}
          isInVoice={Boolean(voiceState.peers[pBottomLeft.id])}
          isMicMuted={voiceState.peers[pBottomLeft.id]?.isMuted}
          isSpeaking={voiceState.peers[pBottomLeft.id]?.isSpeaking}
          isPeerMutedLocally={voiceState.mutedPeerIds?.includes(pBottomLeft.id)}
          onToggleMutePeer={handleToggleMutePeer}
        />
      )}

      {/* Bottom-Right: You (Hero Active Player) */}
      {pHero && (
        <CornerPlayerHUD
          player={pHero}
          position="bottom-right"
          isActiveTurn={activePlayer?.id === pHero.id}
          isHeroPlayer={true}
          lastAcquiredStep={lastAcquiredStep}
          onOpenDeedPopup={(p) => setViewingDeedPlayer(p)}
          isInVoice={voiceState.isInVoice}
          isMicMuted={voiceState.isMuted}
          isSpeaking={voiceState.isSpeaking}
          pingMs={networkPing}
        />
      )}

      {/* ====================================================================
          2. CENTER STAGE: FULLSCREEN HERO GUJARAT BOARD
          ==================================================================== */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Fullscreen Tabletop Board Sheet */}
        <BoardDivSheet
          ref={boardRef}
          onTileClick={handleInspectTile}
          onScaleChange={setBoardScale}
        />

        {/* Property Sheet Deed Card (Centered in Stage) */}
        <PropertySheet />

        {/* Chance Card Event Modal (Only pops on human player turn) */}
        <EventCardModal
          open={Boolean(activeChanceCard) && isHumanTurn}
          title={activeChanceCard?.title || 'Gujarat Commercial Opportunity'}
          description={activeChanceCard?.description || ''}
          amount={activeChanceCard?.amount ?? 0}
          isReward={activeChanceCard?.isReward ?? true}
          onClose={() => {}}
        />
      </Box>

      {/* ====================================================================
          3. BOTTOM FLOATING UTILITY CONSOLE DOCK (WITH ZOOM HUMP & ACTIONS)
          ==================================================================== */}
      <FloatingUtilityRail
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        isMicActive={voiceState.isInVoice}
        isMicMuted={voiceState.isMuted}
        isSpeaking={voiceState.isSpeaking}
        onToggleMic={handleToggleMic}
        onZoomIn={() => boardRef.current?.zoomIn()}
        onZoomOut={() => boardRef.current?.zoomOut()}
        onResetZoom={() => boardRef.current?.resetZoom()}
        boardScale={boardScale}
        onOpenTrade={() => setTradeOpen(true)}
        onOpenBank={() => setBankOpen(true)}
        onOpenLogs={() => setLogsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        unreadLogCount={logs.length}
        isPortrait={isPortraitMobile}
      />

      {/* ====================================================================
          4. BOTTOM MATCH STATUS & NETWORK PING BAR (REFERENCE STYLE)
          ==================================================================== */}
      <div className="bottom-match-ping-bar">
        <span className="ping-text">ping: {networkPing} ms</span>
        {latestLog && <span className="latest-log-pill">{latestLog}</span>}
        <span className="version-text">v2.19.27 • GUJARAT BUSINESS BOARD</span>
      </div>

      {/* ====================================================================
          5. SLIDE-OUT ACTIVITY LOG DRAWER
          ==================================================================== */}
      <ActivityLogDrawer
        open={logsOpen}
        onClose={() => setLogsOpen(false)}
        logs={logs}
      />

      {/* ====================================================================
          6. CONTEXTUAL MODALS & DRAWERS
          ==================================================================== */}
      {/* Monopoly Achieved Notification Banner */}
      {monopolyAchieved && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2500,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
            border: '1.5px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 1.5,
            maxWidth: '90vw',
            boxSizing: 'border-box'
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 3px 0 #059669, 0 6px 14px rgba(16, 185, 129, 0.4)'
            }}
          >
            <DomainAddIcon sx={{ fontSize: 26, color: '#ffffff' }} />
          </Box>
          <Box sx={{ minWidth: 200 }}>
            <Typography sx={{ fontWeight: 850, fontSize: '15px', color: '#34d399', lineHeight: 1.2 }}>
              MONOPOLY UNLOCKED!
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#e2e8f0', mt: 0.3 }}>
              {players.find((p) => p.id === monopolyAchieved.playerId)?.name} now controls all {monopolyAchieved.colorName} properties. Upgrades available!
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto', flexShrink: 0 }}>
            {monopolyAchieved.playerId === activePlayer?.id && (
              <CandyButton
                variant="mint"
                size="sm"
                onClick={() => {
                  const firstTile = monopolyAchieved.tiles[0];
                  engine.clearMonopolyNotification();
                  engine.inspectProperty(firstTile);
                }}
              >
                Upgrade Properties
              </CandyButton>
            )}
            <CandyButton
              variant="glass"
              size="sm"
              onClick={() => engine.clearMonopolyNotification()}
            >
              Dismiss
            </CandyButton>
          </Box>
        </Box>
      )}

      <TradeModal
        open={tradeOpen}
        onClose={() => setTradeOpen(false)}
        onSendOffer={(msg) => bridge.emitToast(`Trade offer sent: ${msg}`, 'info')}
      />

      <NavoBankDrawer
        open={bankOpen}
        onClose={() => setBankOpen(false)}
      />

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenHelp={() => setHelpOpen(true)}
        onLeaveGame={onExitToMenu}
      />

      <HelpDialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />

      <ResultModal
        open={resultOpen || Boolean(winner)}
        onPlayAgain={() => {
          setResultOpen(false);
          engine.resetGame(heroPlayer?.name || 'Satvik');
        }}
        onBackToHome={() => {
          setResultOpen(false);
          onExitToMenu();
        }}
        winnerName={winnerPlayer?.name || (typeof winner === 'string' ? winner : undefined) || 'Champion'}
        isHumanWinner={Boolean(heroPlayer && (winnerPlayer?.id === heroPlayer.id || winner === heroPlayer.name))}
        humanPlayer={heroPlayer}
        allPlayers={players}
      />

      <DeedLedgerModal
        open={deedLedgerOpen}
        onClose={() => setDeedLedgerOpen(false)}
      />

      {/* Themed On-Screen Title Deed Popup */}
      <TitleDeedPopupModal
        open={Boolean(viewingDeedPlayer)}
        player={viewingDeedPlayer}
        highlightStep={lastAcquiredStep}
        onClose={() => setViewingDeedPlayer(null)}
        onInspectTile={handleInspectTile}
      />

      <ToastNotifications />
    </Box>
  );
};
