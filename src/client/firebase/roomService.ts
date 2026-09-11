import {
  ref,
  get,
  set,
  update,
  remove,
  onValue,
  serverTimestamp,
  Unsubscribe
} from 'firebase/database';
import { rtdb } from './firebaseConfig';
import { PlayerProfile } from './authService';

export interface RoomPlayer {
  uid: string;
  name: string;
  avatar: string;
  color: string;
  colorHex: number;
  colorName: string;
  isHost: boolean;
  ready: boolean;
  joinedAt: number;
}

export interface SyncGameState {
  boardSeed: number;
  activePlayerIndex: number;
  activePlayerId: string;
  phase: string;
  diceState: {
    rolling: boolean;
    value: number | null;
  };
  hoppingState: {
    playerId: string;
    fromIndex?: number;
    toIndex?: number;
    stepIndex?: number;
    currentStep?: number;
    targetStep?: number;
    isJailJump?: boolean;
  } | null;
  players: {
    id: string;
    name: string;
    avatar: string;
    tokenColor: string;
    tokenColorHex: number;
    colorName: string;
    balance: number;
    currentTileIndex: number;
    ownedPropertyIds: number[];
    isBankrupt: boolean;
    isInJail: boolean;
    jailTurns: number;
    getOutOfJailCards: number;
    netWorth: number;
  }[];
  properties: {
    step: number;
    ownerId: string | null;
    houses: number;
    isMortgaged: boolean;
  }[];
  logs: {
    id: string;
    text: string;
    type: string;
    timestamp: number;
  }[];
  selectedProperty?: any;
}

export interface RoomDoc {
  roomCode: string;
  roomName: string;
  hostUid: string;
  hostName: string;
  status: 'LOBBY' | 'PLAYING' | 'ENDED';
  maxPlayers: number;
  createdAt: any;
  updatedAt: any;
  players: RoomPlayer[];
  gameState: SyncGameState | null;
}

export const PLAYER_SLOT_COLORS = [
  { color: '#e11d48', colorHex: 0xe11d48, colorName: 'Ruby Crimson' },
  { color: '#059669', colorHex: 0x059669, colorName: 'Emerald Green' },
  { color: '#0284c7', colorHex: 0x0284c7, colorName: 'Sapphire Blue' },
  { color: '#d97706', colorHex: 0xd97706, colorName: 'Amber Gold' }
];

// Local fallback in-memory room store for offline testing or if database rules are locked
const localRoomsStore: Map<string, RoomDoc> = new Map();
const localRoomListeners: Map<string, Set<(room: RoomDoc | null) => void>> = new Map();

function broadcastLocalRoom(roomCode: string, room: RoomDoc | null) {
  const listeners = localRoomListeners.get(roomCode);
  if (listeners) {
    listeners.forEach((l) => l(room));
  }
}

export function sanitizeGameState(gameState: any): SyncGameState | null {
  if (!gameState) return null;
  let playersList: any[] = [];
  if (Array.isArray(gameState.players)) {
    playersList = gameState.players;
  } else if (gameState.players && typeof gameState.players === 'object') {
    playersList = Object.values(gameState.players);
  }
  return {
    ...gameState,
    players: playersList.map((p: any) => ({
      ...p,
      ownedPropertyIds: Array.isArray(p.ownedPropertyIds) ? p.ownedPropertyIds : []
    })),
    properties: Array.isArray(gameState.properties)
      ? gameState.properties
      : (gameState.properties && typeof gameState.properties === 'object' ? Object.values(gameState.properties) : []),
    logs: Array.isArray(gameState.logs)
      ? gameState.logs
      : (gameState.logs && typeof gameState.logs === 'object' ? Object.values(gameState.logs) : [])
  };
}

export class RoomService {
  private static instance: RoomService;

  private currentRoomCode: string | null = null;
  private activeRoomListener: Unsubscribe | null = null;

  public static getInstance(): RoomService {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
    }
    return RoomService.instance;
  }

  /**
   * Generate 5-character readable code
   */
  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  public getCurrentRoomCode(): string | null {
    return this.currentRoomCode;
  }

  /**
   * Fetch current room data from Firebase Realtime Database
   */
  public async getRoom(roomCode: string): Promise<RoomDoc | null> {
    const cleanCode = roomCode.trim().toUpperCase();
    try {
      const snap = await get(ref(rtdb, `rooms/${cleanCode}`));
      if (snap.exists()) {
        const raw = snap.val();
        if (raw) {
          const players: RoomPlayer[] = Array.isArray(raw.players)
            ? (raw.players as RoomPlayer[])
            : (Object.values(raw.players || {}) as RoomPlayer[]);
          const roomData: RoomDoc = {
            ...raw,
            players,
            gameState: sanitizeGameState(raw.gameState)
          };
          localRoomsStore.set(cleanCode, roomData);
          return roomData;
        }
      }
    } catch (e) {
      console.warn('[RoomService] getRoom fetch error:', e);
    }
    return localRoomsStore.get(cleanCode) || null;
  }

  /**
   * Create a new multiplayer room in Firebase Realtime Database
   */
  public async createRoom(
    hostProfile: PlayerProfile,
    roomName?: string,
    maxPlayers: number = 4
  ): Promise<string> {
    const roomCode = this.generateRoomCode();
    const hostColor = PLAYER_SLOT_COLORS[0];
    const initialPlayer: RoomPlayer = {
      uid: hostProfile.uid,
      name: hostProfile.name,
      avatar: hostProfile.avatar || 'crown',
      color: hostColor.color,
      colorHex: hostColor.colorHex,
      colorName: hostColor.colorName,
      isHost: true,
      ready: true,
      joinedAt: Date.now()
    };

    const newRoom: RoomDoc = {
      roomCode,
      roomName: roomName || `${hostProfile.name}'s Gujarat Trade`,
      hostUid: hostProfile.uid,
      hostName: hostProfile.name,
      status: 'LOBBY',
      maxPlayers: Math.min(Math.max(maxPlayers, 2), 4),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      players: [initialPlayer],
      gameState: null
    };

    const roomRef = ref(rtdb, `rooms/${roomCode}`);

    try {
      await set(roomRef, newRoom);
      console.log(`[RoomService] Room ${roomCode} created successfully on Firebase Realtime Database.`);
      this.currentRoomCode = roomCode;
      localRoomsStore.set(roomCode, newRoom);
      return roomCode;
    } catch (err: any) {
      console.warn('[RoomService] RTDB write failed, continuing with resilient local room session:', err);
      localRoomsStore.set(roomCode, newRoom);
      this.currentRoomCode = roomCode;
      broadcastLocalRoom(roomCode, newRoom);
      return roomCode;
    }
  }

  /**
   * Join an existing room via 5-letter code
   */
  public async joinRoom(
    roomCode: string,
    playerProfile: PlayerProfile
  ): Promise<RoomDoc> {
    const cleanCode = roomCode.trim().toUpperCase();
    const roomRef = ref(rtdb, `rooms/${cleanCode}`);

    let room: RoomDoc | null = null;
    try {
      const snap = await get(roomRef);
      if (snap.exists()) {
        room = snap.val() as RoomDoc;
      }
    } catch (err) {
      console.warn('[RoomService] RTDB get failed, checking local store:', err);
    }

    // Fallback to local store if not in RTDB or offline
    if (!room) {
      room = localRoomsStore.get(cleanCode) || null;
    }

    if (!room) {
      throw new Error(`Room "${cleanCode}" not found. Please verify the code.`);
    }

    if (room.status !== 'LOBBY') {
      throw new Error(`Game in room "${cleanCode}" has already started.`);
    }

    // Check if player is already inside
    const playersList: RoomPlayer[] = Array.isArray(room.players)
      ? (room.players as RoomPlayer[])
      : (Object.values(room.players || {}) as RoomPlayer[]);
    const existingIndex = playersList.findIndex((p) => p.uid === playerProfile.uid);
    if (existingIndex !== -1) {
      this.currentRoomCode = cleanCode;
      return { ...room, players: playersList };
    }

    if (playersList.length >= room.maxPlayers) {
      throw new Error(`Room "${cleanCode}" is full (${playersList.length}/${room.maxPlayers} players).`);
    }

    const colorConfig = PLAYER_SLOT_COLORS[playersList.length % PLAYER_SLOT_COLORS.length];
    const newPlayer: RoomPlayer = {
      uid: playerProfile.uid,
      name: playerProfile.name,
      avatar: playerProfile.avatar || 'diamond',
      color: colorConfig.color,
      colorHex: colorConfig.colorHex,
      colorName: colorConfig.colorName,
      isHost: false,
      ready: true,
      joinedAt: Date.now()
    };

    const updatedPlayers = [...playersList, newPlayer];
    const updatedRoom = {
      ...room,
      players: updatedPlayers,
      updatedAt: Date.now()
    };

    try {
      await update(roomRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('[RoomService] RTDB update players failed, saving locally:', err);
    }

    localRoomsStore.set(cleanCode, updatedRoom);
    broadcastLocalRoom(cleanCode, updatedRoom);
    this.currentRoomCode = cleanCode;
    return updatedRoom;
  }

  /**
   * Real-time listener for the room document
   */
  public listenRoom(
    roomCode: string,
    onUpdate: (room: RoomDoc | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    const cleanCode = roomCode.trim().toUpperCase();
    const roomRef = ref(rtdb, `rooms/${cleanCode}`);

    // Subscribe to local store in case offline/fallback is active
    if (!localRoomListeners.has(cleanCode)) {
      localRoomListeners.set(cleanCode, new Set());
    }
    const localListeners = localRoomListeners.get(cleanCode)!;
    localListeners.add(onUpdate);

    // Provide initial state from local store if present
    if (localRoomsStore.has(cleanCode)) {
      onUpdate(localRoomsStore.get(cleanCode)!);
    }

    const unsubscribeRTDB = onValue(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const raw = snapshot.val();
          if (raw) {
            const players: RoomPlayer[] = Array.isArray(raw.players)
              ? (raw.players as RoomPlayer[])
              : (Object.values(raw.players || {}) as RoomPlayer[]);
            const roomData: RoomDoc = {
              ...raw,
              players,
              gameState: sanitizeGameState(raw.gameState)
            };
            localRoomsStore.set(cleanCode, roomData);
            onUpdate(roomData);
          }
        }
      },
      (err) => {
        console.warn(`[RoomService] RTDB listen error for ${cleanCode}:`, err);
        if (!localRoomsStore.has(cleanCode) && onError) {
          onError(err);
        }
      }
    );

    return () => {
      unsubscribeRTDB();
      localListeners.delete(onUpdate);
    };
  }

  /**
   * Host starts the game from Lobby
   */
  public async startGame(roomCode: string, hostUid: string): Promise<void> {
    const cleanCode = roomCode.trim().toUpperCase();
    const roomRef = ref(rtdb, `rooms/${cleanCode}`);

    let room: RoomDoc | null = null;
    try {
      const snap = await get(roomRef);
      if (snap.exists()) {
        room = snap.val() as RoomDoc;
      }
    } catch {
      // ignore
    }
    if (!room) {
      room = localRoomsStore.get(cleanCode) || null;
    }

    if (!room) {
      throw new Error('Room does not exist.');
    }

    if (room.hostUid !== hostUid) {
      throw new Error('Only the room host can start the game.');
    }

    const playersList: RoomPlayer[] = Array.isArray(room.players)
      ? (room.players as RoomPlayer[])
      : (Object.values(room.players || {}) as RoomPlayer[]);
    const boardSeed = Math.floor(Math.random() * 900000) + 100000;
    const initialPlayers = playersList.map((p) => ({
      id: p.uid,
      name: p.name,
      avatar: p.avatar,
      tokenColor: p.color,
      tokenColorHex: p.colorHex,
      colorName: p.colorName,
      balance: 5000,
      currentTileIndex: 0,
      ownedPropertyIds: [] as number[],
      isBankrupt: false,
      isInJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
      netWorth: 5000
    }));

    const initialGameState: SyncGameState = {
      boardSeed,
      activePlayerIndex: 0,
      activePlayerId: playersList[0].uid,
      phase: 'PLAYER_TURN',
      diceState: { rolling: false, value: null },
      hoppingState: null,
      players: initialPlayers,
      properties: [],
      logs: [
        {
          id: `log_start_${Date.now()}`,
          text: `Match started! ${playersList.length} merchants competing for Gujarat!`,
          type: 'info',
          timestamp: Date.now()
        }
      ]
    };

    const updatedRoom: RoomDoc = {
      ...room,
      status: 'PLAYING',
      gameState: initialGameState,
      updatedAt: Date.now()
    };

    try {
      await update(roomRef, {
        status: 'PLAYING',
        gameState: initialGameState,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('[RoomService] RTDB startGame update failed, applying locally:', e);
    }

    localRoomsStore.set(cleanCode, updatedRoom);
    broadcastLocalRoom(cleanCode, updatedRoom);
  }

  /**
   * Sync active game state changes across all connected devices in real time
   */
  public async syncGameState(roomCode: string, updatedState: Partial<SyncGameState>): Promise<void> {
    const cleanCode = roomCode.trim().toUpperCase();
    const cleanState = sanitizeGameState(updatedState);
    if (!cleanState) return;

    try {
      await update(ref(rtdb, `rooms/${cleanCode}/gameState`), cleanState);
      await update(ref(rtdb, `rooms/${cleanCode}`), { updatedAt: serverTimestamp() });
    } catch (e) {
      console.warn('[RoomService] RTDB syncGameState failed, updating locally:', e);
    }

    const existing = localRoomsStore.get(cleanCode);
    if (existing) {
      const updated: RoomDoc = {
        ...existing,
        gameState: cleanState,
        updatedAt: Date.now()
      };
      localRoomsStore.set(cleanCode, updated);
      broadcastLocalRoom(cleanCode, updated);
    }
  }

  /**
   * Leave a room
   */
  public async leaveRoom(roomCode: string, uid: string): Promise<void> {
    try {
      const cleanCode = roomCode.trim().toUpperCase();
      const roomRef = ref(rtdb, `rooms/${cleanCode}`);

      let room: RoomDoc | null = null;
      const snap = await get(roomRef);
      if (snap.exists()) {
        room = snap.val() as RoomDoc;
      }
      if (!room) {
        room = localRoomsStore.get(cleanCode) || null;
      }
      if (!room) return;

      const playersList: RoomPlayer[] = Array.isArray(room.players)
        ? (room.players as RoomPlayer[])
        : (Object.values(room.players || {}) as RoomPlayer[]);
      const remaining: RoomPlayer[] = playersList.filter((p) => p.uid !== uid);

      if (remaining.length === 0 || (room.hostUid === uid && room.status === 'LOBBY')) {
        await remove(roomRef).catch(() => {});
        localRoomsStore.delete(cleanCode);
        broadcastLocalRoom(cleanCode, null);
      } else {
        const newHostUid = room.hostUid === uid ? remaining[0].uid : room.hostUid;
        const newHostName = room.hostUid === uid ? remaining[0].name : room.hostName;
        await update(roomRef, {
          players: remaining,
          hostUid: newHostUid,
          hostName: newHostName,
          updatedAt: serverTimestamp()
        }).catch(() => {});

        const updated: RoomDoc = {
          ...room,
          players: remaining,
          hostUid: newHostUid,
          hostName: newHostName,
          updatedAt: Date.now()
        };
        localRoomsStore.set(cleanCode, updated);
        broadcastLocalRoom(cleanCode, updated);
      }

      if (this.currentRoomCode === cleanCode) {
        this.currentRoomCode = null;
      }
    } catch (e) {
      console.warn('[RoomService] Error leaving room:', e);
    }
  }
}
