import { Room, Client } from 'colyseus';
import { GameState } from '../state/GameState';
import { PlayerState } from '../state/PlayerState';
import { GameEngine } from '../game/GameEngine';
import { BotEngine, BotDifficulty } from '../game/BotEngine';
import { shuffleMatchTiles } from '../../shared/game-data/boardData';

export interface JoinOptions {
  name?: string;
  avatar?: string;
  tokenColor?: string;
  colorName?: string;
  isBot?: boolean;
}

const PLAYER_COLORS = [
  { tokenColor: '#e11d48', colorName: 'Ruby Crimson' },
  { tokenColor: '#059669', colorName: 'Emerald Green' },
  { tokenColor: '#0284c7', colorName: 'Sapphire Blue' },
  { tokenColor: '#d97706', colorName: 'Amber Gold' }
];

export class NavoVyaparRoom extends Room<{ state: GameState }> {
  maxClients = 4;
  private gameEngine!: GameEngine;
  private botEngine!: BotEngine;
  private fillBots: boolean = false;
  private autoStartTimer: NodeJS.Timeout | null = null;

  onCreate(options: any) {
    this.setState(new GameState());
    const seed = options?.boardSeed || (Math.floor(Math.random() * 900000) + 100000);
    this.state.boardSeed = seed;
    shuffleMatchTiles(seed);
    this.fillBots = Boolean(options?.fillBots);
    this.gameEngine = new GameEngine(this.state);
    this.gameEngine.initializeBoard();
    const difficulty: BotDifficulty = options.botDifficulty || 'normal';
    this.botEngine = new BotEngine(this.gameEngine, this.state, difficulty);

    this.setupMessages();

    // Periodic check for bot turns
    this.setSimulationInterval(() => {
      if (this.state.phase === 'playing') {
        this.botEngine.checkAndExecuteTurn();
      }
    }, 500);
  }

  private setupMessages() {
    this.onMessage('roll', (client) => {
      // If game has not started yet, auto-start immediately
      if (this.state.phase === 'waiting') {
        this.startMatch();
      }
      const result = this.gameEngine.rollDice(client.sessionId);
      if (result.success) {
        this.botEngine.checkAndExecuteTurn();
      } else {
        client.send('error', result.error);
      }
    });

    this.onMessage('buy_property', (client) => {
      const result = this.gameEngine.buyProperty(client.sessionId);
      if (result.success) {
        this.botEngine.checkAndExecuteTurn();
      } else {
        client.send('error', result.error);
      }
    });

    this.onMessage('pass_property', (client) => {
      const result = this.gameEngine.passProperty(client.sessionId);
      if (result.success) {
        this.botEngine.checkAndExecuteTurn();
      } else {
        client.send('error', result.error);
      }
    });

    this.onMessage('end_turn', (client) => {
      const result = this.gameEngine.endTurn(client.sessionId);
      if (result.success) {
        this.botEngine.checkAndExecuteTurn();
      } else {
        client.send('error', result.error);
      }
    });

    this.onMessage('pay_jail_fine', (client) => {
      const result = this.gameEngine.payJailFine(client.sessionId);
      if (result.success) {
        this.botEngine.checkAndExecuteTurn();
      } else {
        client.send('error', result.error);
      }
    });

    this.onMessage('use_jail_card', (client) => {
      const result = this.gameEngine.useJailCard(client.sessionId);
      if (result.success) {
        this.botEngine.checkAndExecuteTurn();
      } else {
        client.send('error', result.error);
      }
    });

    this.onMessage('start_game', (client) => {
      // Host or ready trigger
      if (this.state.phase === 'waiting' || this.state.phase === 'starting') {
        this.startMatch();
      }
    });
  }

  onJoin(client: Client, options: JoinOptions = {}) {
    const playerIndex = this.state.players.size;
    const colorConfig = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];

    const player = new PlayerState();
    player.id = client.sessionId;
    player.sessionId = client.sessionId;
    player.name = options.name || `Merchant ${playerIndex + 1}`;
    player.avatar = options.avatar || 'crown';
    player.tokenColor = options.tokenColor || colorConfig.tokenColor;
    player.colorName = options.colorName || colorConfig.colorName;
    player.position = 0;
    player.balance = 5000;
    player.netWorth = 5000;
    player.connected = true;
    player.isBot = options.isBot ?? false;
    player.turnOrder = playerIndex;

    this.state.players.set(client.sessionId, player);
    this.state.statusMessage = `${player.name} joined the room. (${this.state.players.size}/4)`;

    // Auto-start immediately if 4 players joined
    if (this.state.players.size >= 4 && this.state.phase === 'waiting') {
      this.startMatch();
      return;
    }

    // Auto-start match after a short grace period (1 second) so all connecting players can arrive
    // and remaining seats are automatically filled with bots
    if (this.state.phase === 'waiting') {
      if (this.autoStartTimer) clearTimeout(this.autoStartTimer);
      this.autoStartTimer = setTimeout(() => {
        if (this.state.phase === 'waiting' && this.state.players.size > 0) {
          this.startMatch();
        }
      }, 1000);
    }
  }

  public addBotPlayer(name: string, avatar: string = 'diamond'): PlayerState {
    const botIndex = this.state.players.size;
    const botId = `bot_${botIndex}_${Math.random().toString(36).substr(2, 4)}`;
    const colorConfig = PLAYER_COLORS[botIndex % PLAYER_COLORS.length];

    const bot = new PlayerState();
    bot.id = botId;
    bot.sessionId = botId;
    bot.name = name;
    bot.avatar = avatar;
    bot.tokenColor = colorConfig.tokenColor;
    bot.colorName = colorConfig.colorName;
    bot.position = 0;
    bot.balance = 5000;
    bot.netWorth = 5000;
    bot.connected = true;
    bot.isBot = true;
    bot.turnOrder = botIndex;

    this.state.players.set(botId, bot);
    return bot;
  }

  public fillRemainingSeatsWithBots(): void {
    const botNames = ['Computer 1 (AI)', 'Computer 2 (AI)', 'Computer 3 (AI)', 'Computer 4 (AI)'];
    let nameIdx = 0;
    while (this.state.players.size < 4) {
      const name = botNames[nameIdx % botNames.length];
      this.addBotPlayer(name, 'bot');
      nameIdx++;
    }
  }

  public startMatch(): void {
    if (this.autoStartTimer) {
      clearTimeout(this.autoStartTimer);
      this.autoStartTimer = null;
    }
    if (this.state.phase === 'playing') return;

    if (this.state.players.size < 4) {
      this.fillRemainingSeatsWithBots();
    }
    this.gameEngine.startGame();
    this.botEngine.checkAndExecuteTurn();
  }

  async onLeave(client: Client, code?: number) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    const consented = code === 1000 || code === undefined;

    player.connected = false;
    this.state.statusMessage = `${player.name} disconnected.`;

    if (consented) {
      // Voluntary departure: convert directly to bot
      player.isBot = true;
      player.name = `${player.name} (Bot)`;
      this.botEngine.checkAndExecuteTurn();
      return;
    }

    try {
      // 30-second reconnection window
      await this.allowReconnection(client, 30);
      player.connected = true;
      this.state.statusMessage = `${player.name} reconnected!`;
    } catch (e) {
      // Reconnect window expired: convert to bot so game continues seamlessly
      player.isBot = true;
      player.name = `${player.name} (Bot)`;
      this.state.statusMessage = `${player.name} failed to reconnect. Bot took over.`;
      this.botEngine.checkAndExecuteTurn();
    }
  }

  onDispose() {
    if (this.autoStartTimer) {
      clearTimeout(this.autoStartTimer);
      this.autoStartTimer = null;
    }
    this.botEngine.cleanup();
  }
}
