import Phaser from 'phaser';
import { PlayerData } from '@shared/types/player';
import { TileData } from '@shared/types/board';
import { GAME_CONFIG } from '@shared/constants/config';
import { PROTOTYPE_TILES } from '@shared/game-data/prototypeBoard';
import { BankClient } from '../economy/BankClient';
import { TurnStateMachine } from '../rules/TurnStateMachine';
import { BoardRenderer } from '../board/BoardRenderer';
import { PlayerToken } from '../player/PlayerToken';
import { TokenAnimator } from '../animation/TokenAnimator';
import { DiceRenderer } from '../dice/DiceRenderer';
import { SoundEffects } from '../audio/SoundEffects';
import { GameBridge } from '../bridge/GameBridge';

export class GameScene extends Phaser.Scene {
  private players: PlayerData[] = [];
  private playerTokens: PlayerToken[] = [];
  private tiles: TileData[] = [];
  private bankClient!: BankClient;
  private turnStateMachine!: TurnStateMachine;
  private boardRenderer!: BoardRenderer;
  private tokenAnimator!: TokenAnimator;
  private diceRenderer!: DiceRenderer;
  private soundEffects!: SoundEffects;
  private bridge!: GameBridge;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    this.soundEffects = SoundEffects.getInstance();
    this.bridge = GameBridge.getInstance();

    // 1. Initialize Player Data
    this.players = GAME_CONFIG.PLAYER_DEFAULTS.map(p => ({
      id: p.id,
      name: p.name,
      tokenColor: p.tokenColor,
      tokenColorHex: p.tokenColorHex,
      avatar: p.avatar,
      currentTileIndex: 0,
      balance: GAME_CONFIG.STARTING_BALANCE,
      ownedPropertyIds: [],
      isBankrupt: false,
      colorName: p.colorName,
      isInJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
    }));

    // Deep copy prototype tiles
    this.tiles = JSON.parse(JSON.stringify(PROTOTYPE_TILES));

    // 2. Initialize Central Bank
    this.bankClient = new BankClient();
    this.players.forEach(p => this.bankClient.registerPlayer(p));
    this.bankClient.registerTiles(this.tiles);

    // 3. Render Tabletop Board (Centered)
    this.boardRenderer = new BoardRenderer(this, this.tiles, width / 2, height / 2);

    // 4. Create Player Tokens on START Tile (Tile 0)
    this.players.forEach((player, idx) => {
      const startPos = this.boardRenderer.getTokenPosition(0, idx);
      const token = new PlayerToken(this, player, idx, startPos.x, startPos.y);
      this.playerTokens.push(token);
    });

    // 5. Initialize Token Animator
    this.tokenAnimator = new TokenAnimator(this);

    // 6. Center Tabletop Dice Component
    this.diceRenderer = new DiceRenderer(this, width / 2, height / 2);
    this.diceRenderer.onRollComplete((diceValue: number) => {
      this.handleDiceRollComplete(diceValue);
    });

    // 7. Initialize Turn State Machine
    this.turnStateMachine = new TurnStateMachine(this.players);
    this.turnStateMachine.onStateChange((phase, activePlayer) => {
      const activeIdx = this.turnStateMachine.getActivePlayerIndex();
      this.bridge.emitTurnChanged(activePlayer, activeIdx, phase);
    });

    // 8. Connect React UI Bridge Handlers
    this.bridge.onRollRequested = (forcedResult?: number) => {
      const phase = this.turnStateMachine.getPhase();
      console.log(`[GameScene] Roll requested — current phase: ${phase}`);
      if (phase === 'PLAYER_TURN') {
        this.turnStateMachine.startRoll();
        this.bridge.emitDiceState(true, null);
        this.diceRenderer.roll(forcedResult);
      } else {
        console.warn(`[GameScene] Roll ignored — phase is ${phase}, expected PLAYER_TURN`);
      }
    };

    this.bridge.onToggleSound = () => {
      return this.soundEffects.toggleMute();
    };

    // Expose scene for automation
    (window as unknown as { gameScene: GameScene }).gameScene = this;

    // 9. Sync initial state to React UI
    this.bridge.emitPlayersUpdated(this.players);
    this.bridge.emitBankHistory(this.bankClient.getTransactionHistory());

    // 10. Start the game — MUST call startGame() first to set phase to PLAYER_TURN
    this.turnStateMachine.startGame();
    this.startPlayerTurn();
  }

  public triggerRoll(forcedResult?: number): void {
    if (this.bridge.onRollRequested) {
      this.bridge.onRollRequested(forcedResult);
    }
  }

  private startPlayerTurn(): void {
    const activePlayer = this.turnStateMachine.getActivePlayer();
    const activePlayerIndex = this.turnStateMachine.getActivePlayerIndex();

    // Highlight active player token
    this.playerTokens.forEach((tok, idx) => {
      tok.setActiveTurn(idx === activePlayerIndex);
    });

    // Enable dice roll
    this.diceRenderer.setRollEnabled(true);

    // Notify React UI — emit PLAYER_TURN so ActionControlDock enables the Roll button
    this.bridge.emitTurnChanged(activePlayer, activePlayerIndex, 'PLAYER_TURN');
    console.log(`[GameScene] Turn started — ${activePlayer.name} (phase: PLAYER_TURN)`);
  }

  private handleDiceRollComplete(diceValue: number): void {
    const activePlayer = this.turnStateMachine.getActivePlayer();
    const activePlayerIndex = this.turnStateMachine.getActivePlayerIndex();
    const activeToken = this.playerTokens[activePlayerIndex];

    this.turnStateMachine.startMoving();
    this.bridge.emitDiceState(false, diceValue);
    this.bridge.emitTurnChanged(activePlayer, activePlayerIndex, 'MOVING');

    const startTile = activePlayer.currentTileIndex;

    this.tokenAnimator.moveTokenSteps(
      activeToken,
      startTile,
      diceValue,
      this.boardRenderer,
      (_tileIdx) => {
        // Step hook
      },
      () => {
        // Passed START: Collect Salary from NAVO BANK
        this.bankClient.paySalary(activePlayer.id);
        this.bridge.emitPlayersUpdated(this.players);
        this.bridge.emitBankHistory(this.bankClient.getTransactionHistory());
        this.bridge.emitToast(`${activePlayer.name} passed START! Collected ₹${GAME_CONFIG.SALARY_AMOUNT} from NAVO BANK.`, 'success');
      },
      (finalTileIndex) => {
        this.handleTileLanding(activePlayer, finalTileIndex);
      }
    );
  }

  private handleTileLanding(player: PlayerData, tileIndex: number): void {
    this.turnStateMachine.landOnTile();
    const tile = this.tiles[tileIndex];
    const activeIdx = this.turnStateMachine.getActivePlayerIndex();
    this.bridge.emitTurnChanged(player, activeIdx, 'TILE_ACTION');

    switch (tile.type) {
      case 'PROPERTY':
        this.handlePropertyTile(player, tile);
        break;

      case 'START':
        this.bridge.emitToast(`Shree Ganesh! Safe arrival at START.`, 'info');
        this.time.delayedCall(1200, () => this.endCurrentTurn());
        break;

      case 'BANK': {
        const dividend = tile.id === 2 ? 500 : 400;
        this.bankClient.addMoney(player.id, dividend, `${tile.name} payout`, 'BANK_DIVIDEND');
        this.bridge.emitPlayersUpdated(this.players);
        this.bridge.emitBankHistory(this.bankClient.getTransactionHistory());
        this.bridge.emitToast(`${player.name} received ₹${dividend} dividend from NAVO BANK!`, 'success');
        this.time.delayedCall(1600, () => this.endCurrentTurn());
        break;
      }

      case 'TAX': {
        const tax = tile.id === 4 ? 800 : 600;
        this.bankClient.removeMoney(player.id, tax, `${tile.name} levy`, 'PAY_TAX');
        this.bridge.emitPlayersUpdated(this.players);
        this.bridge.emitBankHistory(this.bankClient.getTransactionHistory());
        this.bridge.emitToast(`${player.name} paid ₹${tax} tax to NAVO BANK!`, 'warning');
        this.time.delayedCall(1600, () => this.endCurrentTurn());
        break;
      }

      case 'EVENT':
        this.handleEventCard(player, tile);
        break;

      case 'SPECIAL':
        this.bridge.emitToast(`${player.name} rested at ${tile.name}.`, 'info');
        this.time.delayedCall(1200, () => this.endCurrentTurn());
        break;

      default:
        this.time.delayedCall(1000, () => this.endCurrentTurn());
        break;
    }
  }

  private handlePropertyTile(player: PlayerData, tile: TileData): void {
    if (!tile.ownerId) {
      // Unowned Property: Open Material UI Dialog in React
      const canAfford = this.bankClient.canAfford(player.id, tile.price);
      this.bridge.emitShowPropertyModal(tile, player, canAfford);

      this.bridge.onPropertyAction = (action: 'BUY' | 'PASS') => {
        if (action === 'BUY') {
          const result = this.bankClient.purchaseProperty(player.id, tile.id);
          if (result.success) {
            tile.ownerId = player.id;
            this.boardRenderer.updatePropertyOwner(tile.id, player.id, player.tokenColor, player.name);
            this.bridge.emitPlayersUpdated(this.players);
            this.bridge.emitBankHistory(this.bankClient.getTransactionHistory());
            this.bridge.emitToast(`${player.name} purchased ${tile.name} for ₹${tile.price}!`, 'success');
          } else {
            this.bridge.emitToast(`${result.message}`, 'error');
          }
        } else {
          this.bridge.emitToast(`${player.name} passed on ${tile.name}.`, 'info');
        }

        this.time.delayedCall(800, () => this.endCurrentTurn());
      };
    } else if (tile.ownerId === player.id) {
      this.bridge.emitToast(`${player.name} visited their own estate (${tile.name}).`, 'info');
      this.time.delayedCall(1400, () => this.endCurrentTurn());
    } else {
      // Rent payment
      const rentResult = this.bankClient.payRent(player.id, tile.id);
      if (rentResult.success) {
        this.bridge.emitPlayersUpdated(this.players);
        this.bridge.emitBankHistory(this.bankClient.getTransactionHistory());
        this.bridge.emitToast(`${player.name} paid ₹${rentResult.rentPaid} rent to ${rentResult.ownerName}!`, 'warning');
      }
      this.time.delayedCall(1800, () => this.endCurrentTurn());
    }
  }

  private handleEventCard(player: PlayerData, _tile: TileData): void {
    const events = [
      {
        title: 'Diwali Festival Trade Boom',
        description: 'Vibrant trade across Gujarat! Collect ₹600 from Navo Bank.',
        amount: 600,
        isBonus: true
      },
      {
        title: 'Kutch Handicraft Expo',
        description: 'Export incentive bonus! Collect ₹450 from Navo Bank.',
        amount: 450,
        isBonus: true
      },
      {
        title: 'Monsoon Port Maintenance',
        description: 'Harbour repair dues. Pay ₹350 to Navo Bank.',
        amount: 350,
        isBonus: false
      }
    ];

    const ev = Phaser.Utils.Array.GetRandom(events);

    if (ev.isBonus) {
      this.bankClient.addMoney(player.id, ev.amount, ev.title, 'EVENT_REWARD');
      this.bridge.emitPlayersUpdated(this.players);
      this.bridge.emitBankHistory(this.bankClient.getTransactionHistory());
      this.bridge.emitToast(`[${ev.title}]: +₹${ev.amount} from Navo Bank`, 'success');
    } else {
      this.bankClient.removeMoney(player.id, ev.amount, ev.title, 'EVENT_PENALTY');
      this.bridge.emitPlayersUpdated(this.players);
      this.bridge.emitBankHistory(this.bankClient.getTransactionHistory());
      this.bridge.emitToast(`[${ev.title}]: -₹${ev.amount} to Navo Bank`, 'warning');
    }

    this.time.delayedCall(2000, () => this.endCurrentTurn());
  }

  private endCurrentTurn(): void {
    const currentToken = this.playerTokens[this.turnStateMachine.getActivePlayerIndex()];
    currentToken.setActiveTurn(false);

    this.turnStateMachine.advanceToNextPlayer();
    this.startPlayerTurn();
  }
}
