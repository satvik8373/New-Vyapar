import { Client, Room } from 'colyseus.js';
import { GameState } from '../../server/state/GameState';
import { PlayerState } from '../../server/state/PlayerState';
import { PropertyState } from '../../server/state/PropertyState';
import { GameEngine } from '../game-engine/GameEngine';

export interface QueueStatus {
  players: { id: string; name: string; avatar: string }[];
  countdown: number;
  isCountingDown: boolean;
}

export type ConnectionState = 'disconnected' | 'in_queue' | 'connecting' | 'connected' | 'reconnecting';

export type StateListener = (state: GameState) => void;
export type QueueListener = (status: QueueStatus) => void;
export type ConnectionListener = (state: ConnectionState) => void;

const RECONNECT_TOKEN_KEY = 'navo_reconnect_token';
const RECONNECT_ROOM_KEY = 'navo_reconnect_room_id';

export class MultiplayerService {
  private static instance: MultiplayerService;

  private client: Client;
  private queueRoom: Room | null = null;
  private gameRoom: Room<GameState> | null = null;

  private connectionState: ConnectionState = 'disconnected';
  private stateListeners: Set<StateListener> = new Set();
  private queueListeners: Set<QueueListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();

  private serverUrl: string;

  private constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    // Colyseus runs on port 2567
    this.serverUrl = `${protocol}//${host}:2567`;
    this.client = new Client(this.serverUrl);
  }

  public static getInstance(): MultiplayerService {
    if (!MultiplayerService.instance) {
      MultiplayerService.instance = new MultiplayerService();
    }
    return MultiplayerService.instance;
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  public getGameRoom(): Room<GameState> | null {
    return this.gameRoom;
  }

  public getGameState(): GameState | null {
    return this.gameRoom ? this.gameRoom.state : null;
  }

  public isMultiplayerActive(): boolean {
    return Boolean(this.gameRoom && this.connectionState === 'connected');
  }

  public getSessionId(): string | null {
    return this.gameRoom?.sessionId || null;
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.connectionListeners.forEach((l) => l(state));
  }

  public subscribeState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    if (this.gameRoom?.state) {
      listener(this.gameRoom.state);
    }
    return () => this.stateListeners.delete(listener);
  }

  public subscribeQueue(listener: QueueListener): () => void {
    this.queueListeners.add(listener);
    return () => this.queueListeners.delete(listener);
  }

  public subscribeConnection(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    listener(this.connectionState);
    return () => this.connectionListeners.delete(listener);
  }

  // ── QUICK MATCH / QUEUE ───────────────────────────────────────────────────

  public async joinQueue(
    playerName: string,
    avatar: string,
    onMatchFound: (roomId: string) => void
  ): Promise<void> {
    try {
      this.setConnectionState('in_queue');
      this.queueRoom = await this.client.joinOrCreate('match_queue', {
        name: playerName,
        avatar
      });

      this.queueRoom.onStateChange((state: any) => {
        const playersList: { id: string; name: string; avatar: string }[] = [];
        if (state.players) {
          if (Array.isArray(state.players)) {
            state.players.forEach((p: any) => playersList.push({ id: p.id, name: p.name, avatar: p.avatar }));
          } else if (typeof state.players.forEach === 'function') {
            state.players.forEach((p: any) => playersList.push({ id: p.id, name: p.name, avatar: p.avatar }));
          }
        }
        const queueStatus: QueueStatus = {
          players: playersList,
          countdown: state.countdown ?? 15,
          isCountingDown: state.isCountingDown ?? false
        };
        this.queueListeners.forEach((l) => l(queueStatus));
      });

      this.queueRoom.onMessage('match_ready', async (data: { roomId: string }) => {
        if (this.queueRoom) {
          this.queueRoom.leave();
          this.queueRoom = null;
        }
        onMatchFound(data.roomId);
      });

      this.queueRoom.onError((code, message) => {
        console.error('Queue room error:', code, message);
        this.setConnectionState('disconnected');
      });

      this.queueRoom.onLeave(() => {
        if (this.connectionState === 'in_queue') {
          this.setConnectionState('disconnected');
        }
      });
    } catch (err) {
      console.error('Failed to join matchmaking queue:', err);
      this.setConnectionState('disconnected');
      throw err;
    }
  }

  public cancelQueue(): void {
    if (this.queueRoom) {
      this.queueRoom.send('cancel_queue');
      this.queueRoom.leave();
      this.queueRoom = null;
    }
    this.setConnectionState('disconnected');
  }

  // ── GAME ROOM CONNECTION ──────────────────────────────────────────────────

  public async joinMatchRoom(
    roomId: string,
    playerName: string,
    avatar: string
  ): Promise<Room<GameState>> {
    this.setConnectionState('connecting');
    try {
      this.gameRoom = await this.client.joinById<GameState>(roomId, {
        name: playerName,
        avatar
      });

      this.setupGameRoomListeners();
      this.setConnectionState('connected');
      this.saveReconnectionToken();

      // Trigger start_game so match starts immediately
      this.requestStartGame();

      return this.gameRoom;
    } catch (err) {
      this.setConnectionState('disconnected');
      throw err;
    }
  }

  public async createPrivateRoom(
    roomCode: string,
    playerName: string,
    avatar: string
  ): Promise<Room<GameState>> {
    this.setConnectionState('connecting');
    try {
      this.gameRoom = await this.client.create<GameState>('private_room', {
        roomCode,
        name: playerName,
        avatar,
        isHost: true
      });

      this.setupGameRoomListeners();
      this.setConnectionState('connected');
      this.saveReconnectionToken();
      return this.gameRoom;
    } catch (err) {
      this.setConnectionState('disconnected');
      throw err;
    }
  }

  public async joinPrivateRoom(
    roomCode: string,
    playerName: string,
    avatar: string
  ): Promise<Room<GameState>> {
    this.setConnectionState('connecting');
    try {
      this.gameRoom = await this.client.joinOrCreate<GameState>('private_room', {
        roomCode,
        name: playerName,
        avatar,
        isHost: false
      });

      this.setupGameRoomListeners();
      this.setConnectionState('connected');
      this.saveReconnectionToken();
      return this.gameRoom;
    } catch (err) {
      this.setConnectionState('disconnected');
      throw err;
    }
  }

  public async attemptReconnect(): Promise<boolean> {
    const token = sessionStorage.getItem(RECONNECT_TOKEN_KEY);
    const roomId = sessionStorage.getItem(RECONNECT_ROOM_KEY);
    if (!token || !roomId) return false;

    this.setConnectionState('reconnecting');
    try {
      this.gameRoom = await this.client.reconnect<GameState>(token);
      this.setupGameRoomListeners();
      this.setConnectionState('connected');
      this.saveReconnectionToken();
      return true;
    } catch (err) {
      console.warn('Reconnection failed:', err);
      this.clearReconnectionToken();
      this.setConnectionState('disconnected');
      return false;
    }
  }

  private setupGameRoomListeners(): void {
    if (!this.gameRoom) return;

    // Register with GameEngine as authoritative delegate
    GameEngine.getInstance().setMultiplayerAdapter({
      isMultiplayerActive: () => Boolean(this.gameRoom && this.connectionState === 'connected'),
      roll: () => this.roll(),
      buyProperty: () => this.buyProperty(),
      passProperty: () => this.passProperty(),
      endTurn: () => this.endTurn(),
      payJailFine: () => this.payJailFine(),
      useJailCard: () => this.useJailCard()
    });

    // Synchronize initial state
    GameEngine.getInstance().syncWithColyseus(this.gameRoom.state, this.getSessionId());

    this.gameRoom.onStateChange((state: GameState) => {
      GameEngine.getInstance().syncWithColyseus(state, this.getSessionId());
      this.stateListeners.forEach((l) => l(state));
    });

    this.gameRoom.onLeave((code) => {
      console.log('Left game room with code:', code);
      GameEngine.getInstance().setMultiplayerAdapter(null);
      if (code > 1000) {
        // Unexpected disconnect: try reconnect
        this.attemptReconnect();
      } else {
        this.clearReconnectionToken();
        this.setConnectionState('disconnected');
      }
    });

    this.gameRoom.onError((code, message) => {
      console.error('Game room error:', code, message);
    });
  }

  private saveReconnectionToken(): void {
    if (this.gameRoom?.reconnectionToken && this.gameRoom?.roomId) {
      sessionStorage.setItem(RECONNECT_TOKEN_KEY, this.gameRoom.reconnectionToken);
      sessionStorage.setItem(RECONNECT_ROOM_KEY, this.gameRoom.roomId);
    }
  }

  private clearReconnectionToken(): void {
    sessionStorage.removeItem(RECONNECT_TOKEN_KEY);
    sessionStorage.removeItem(RECONNECT_ROOM_KEY);
  }

  // ── SERVER AUTHORITATIVE ACTION CALLS ─────────────────────────────────────

  public roll(): void {
    this.gameRoom?.send('roll');
  }

  public buyProperty(): void {
    this.gameRoom?.send('buy_property');
  }

  public passProperty(): void {
    this.gameRoom?.send('pass_property');
  }

  public endTurn(): void {
    this.gameRoom?.send('end_turn');
  }

  public payJailFine(): void {
    this.gameRoom?.send('pay_jail_fine');
  }

  public useJailCard(): void {
    this.gameRoom?.send('use_jail_card');
  }

  public requestStartGame(): void {
    this.gameRoom?.send('start_game');
  }

  public leave(): void {
    this.clearReconnectionToken();
    if (this.gameRoom) {
      this.gameRoom.leave();
      this.gameRoom = null;
    }
    GameEngine.getInstance().setMultiplayerAdapter(null);
    this.setConnectionState('disconnected');
  }
}
