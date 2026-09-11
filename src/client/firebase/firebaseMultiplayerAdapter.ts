import { MultiplayerAdapter, GameEngine, CHANCE_CARDS } from '../game-engine/GameEngine';
import { RoomService, SyncGameState } from './roomService';
import { BOARD_TILES, BoardTileStep } from '../../shared/game-data/boardData';
import { SoundEffects } from '../audio/SoundEffects';

const BOARD_SIZE = 32;

export class FirebaseMultiplayerAdapter implements MultiplayerAdapter {
  private static instance: FirebaseMultiplayerAdapter | null = null;

  private roomCode: string;
  private myUid: string;
  private unsubscribeRoom: (() => void) | null = null;
  private latestGameState: SyncGameState | null = null;
  private sounds = SoundEffects.getInstance();

  public constructor(roomCode: string, myUid: string) {
    this.roomCode = roomCode;
    this.myUid = myUid;
  }

  public static activate(roomCode: string, myUid: string): FirebaseMultiplayerAdapter {
    if (FirebaseMultiplayerAdapter.instance) {
      FirebaseMultiplayerAdapter.instance.destroy();
    }
    const adapter = new FirebaseMultiplayerAdapter(roomCode, myUid);
    adapter.init();
    FirebaseMultiplayerAdapter.instance = adapter;
    GameEngine.getInstance().setMultiplayerAdapter(adapter);
    return adapter;
  }

  public static getInstance(): FirebaseMultiplayerAdapter | null {
    return FirebaseMultiplayerAdapter.instance;
  }

  private init(): void {
    const roomService = RoomService.getInstance();

    // Immediate initial sync without waiting for socket event
    roomService.getRoom(this.roomCode).then((roomDoc) => {
      if (roomDoc && roomDoc.gameState) {
        this.latestGameState = roomDoc.gameState;
        GameEngine.getInstance().syncWithFirebase(roomDoc.gameState, this.myUid);
      }
    });

    this.unsubscribeRoom = roomService.listenRoom(this.roomCode, (roomDoc) => {
      if (!roomDoc || !roomDoc.gameState) return;
      this.latestGameState = roomDoc.gameState;
      GameEngine.getInstance().syncWithFirebase(roomDoc.gameState, this.myUid);
    });
  }

  public isMultiplayerActive(): boolean {
    return Boolean(this.roomCode && this.unsubscribeRoom);
  }

  public destroy(): void {
    this.sounds.stopCarMoving();
    if (this.unsubscribeRoom) {
      this.unsubscribeRoom();
      this.unsubscribeRoom = null;
    }
    GameEngine.getInstance().setMultiplayerAdapter(null);
    FirebaseMultiplayerAdapter.instance = null;
  }

  private async fetchCurrentState(): Promise<SyncGameState | null> {
    if (this.latestGameState) return this.latestGameState;
    const room = await RoomService.getInstance().getRoom(this.roomCode);
    if (room?.gameState) {
      this.latestGameState = room.gameState;
      return room.gameState;
    }
    return null;
  }

  private sanitizeStateForSync(raw: any): SyncGameState {
    const state = JSON.parse(JSON.stringify(raw)) as SyncGameState;
    if (!Array.isArray(state.properties)) state.properties = [];
    if (!Array.isArray(state.logs)) state.logs = [];
    if (!Array.isArray(state.players)) {
      state.players = Object.values(state.players || {});
    }
    state.players = state.players.map((p: any) => ({
      ...p,
      ownedPropertyIds: Array.isArray(p.ownedPropertyIds) ? p.ownedPropertyIds : []
    }));
    return state;
  }

  /**
   * ROLL DICE
   * Syncs rolling state, plays 3D animation, hops player, evaluates landing, and enables End Turn
   */
  public async roll(): Promise<void> {
    const rawState = await this.fetchCurrentState();
    if (!rawState) return;

    const state = this.sanitizeStateForSync(rawState);
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || activePlayer.id !== this.myUid) {
      console.warn('[Multiplayer] Cannot roll: not your turn!');
      return;
    }

    // Step 1: Broadcast ROLLING state immediately so the 3D dice spins smoothly on BOTH screens!
    state.phase = 'ROLLING';
    state.diceState = { rolling: true, value: null };
    state.hoppingState = null;
    state.selectedProperty = null;
    this.sounds.playDiceRoll();
    this.latestGameState = state;
    GameEngine.getInstance().syncWithFirebase(state, this.myUid);
    await RoomService.getInstance().syncGameState(this.roomCode, state);

    // Give 1200ms for realistic 3D dice tumbling animation
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Step 2: Roll 1 to 6 and reveal dice face
    const diceVal = Math.floor(Math.random() * 6) + 1;
    const fromTile = activePlayer.currentTileIndex;
    const toTile = (fromTile + diceVal) % BOARD_SIZE;

    state.diceState = { rolling: false, value: diceVal };
    state.logs.unshift({
      id: `log_roll_${Date.now()}`,
      text: `🎲 ${activePlayer.name} rolled a ${diceVal}!`,
      type: 'roll',
      timestamp: Date.now()
    });
    this.sounds.playDiceLand();
    this.latestGameState = state;
    GameEngine.getInstance().syncWithFirebase(state, this.myUid);
    await RoomService.getInstance().syncGameState(this.roomCode, state);

    // Give 450ms pause so both players clearly see the rolled dice face before car starts driving
    await new Promise((resolve) => setTimeout(resolve, 450));

    // Step 3: Tile-by-tile car drive sequence with sound effects and smooth framer motion
    this.sounds.startCarMoving();

    let currentStep = fromTile;
    for (let step = 1; step <= diceVal; step++) {
      currentStep = (currentStep + 1) % BOARD_SIZE;
      activePlayer.currentTileIndex = currentStep;
      state.hoppingState = {
        playerId: activePlayer.id,
        fromIndex: fromTile,
        toIndex: toTile,
        stepIndex: step,
        currentStep,
        targetStep: toTile
      };

      this.sounds.playCarDriveStep(step, diceVal);

      // Check if passed or landed on START (tile 0)
      if (currentStep === 0) {
        const isExactLanding = step === diceVal;
        const salary = isExactLanding ? 2000 : 1000;
        activePlayer.balance += salary;
        activePlayer.netWorth += salary;
        this.sounds.playMoneyChime();

        state.logs.unshift({
          id: `log_pass_${Date.now()}`,
          text: isExactLanding
            ? `🎯 ${activePlayer.name} landed on START — received double dividend ₹2,000!`
            : `💰 ${activePlayer.name} passed START and collected ₹1,000 dividend!`,
          type: 'reward',
          timestamp: Date.now()
        });
      }

      this.latestGameState = state;
      GameEngine.getInstance().syncWithFirebase(state, this.myUid);

      const syncPromise = RoomService.getInstance().syncGameState(this.roomCode, state);
      await Promise.all([
        syncPromise,
        new Promise((resolve) => setTimeout(resolve, 460))
      ]);
    }

    // Step 4: Stop car sound and play brake
    this.sounds.stopCarMoving();
    this.sounds.playCarBrake();

    // Clear hoppingState so the car settles into docked position
    state.hoppingState = null;
    this.latestGameState = state;
    GameEngine.getInstance().syncWithFirebase(state, this.myUid);
    await RoomService.getInstance().syncGameState(this.roomCode, state);

    // 400ms settling pause after braking before inspecting tile
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Step 5: Target tile inspection
    const targetTile: BoardTileStep = BOARD_TILES.find((t) => t.step === toTile) || BOARD_TILES[0];
    let nextPhase = 'RESOLVING';
    let selectedProp: any = null;

    if (targetTile.type === 'PROPERTY' || targetTile.type === 'PORT') {
      const existingProp = state.properties.find((p) => p.step === toTile);
      const isOwned = Boolean(existingProp && existingProp.ownerId);

      if (!isOwned) {
        // Unowned property - offer buy option
        nextPhase = 'TILE_ACTION';
        selectedProp = {
          step: targetTile.step,
          name: targetTile.name,
          price: targetTile.price || 500,
          color: targetTile.color
        };
        state.logs.unshift({
          id: `log_land_${Date.now()}`,
          text: `${activePlayer.name} rolled ${diceVal} and landed on ${targetTile.name} (Unowned - ₹${(targetTile.price || 500).toLocaleString()}).`,
          type: 'info',
          timestamp: Date.now()
        });
      } else if (existingProp?.ownerId === activePlayer.id) {
        state.logs.unshift({
          id: `log_own_${Date.now()}`,
          text: `${activePlayer.name} landed on their own ${targetTile.name}.`,
          type: 'info',
          timestamp: Date.now()
        });
        nextPhase = 'RESOLVING';
      } else {
        // Owned by opponent - calculate rent
        const owner = state.players.find((p) => p.id === existingProp?.ownerId);
        const rentAmount = GameEngine.getInstance().calculateRent(targetTile.step)?.amount || Math.round((targetTile.price || 500) * 0.1);
        activePlayer.balance = Math.max(0, activePlayer.balance - rentAmount);
        activePlayer.netWorth = Math.max(0, activePlayer.netWorth - rentAmount);
        if (owner) {
          owner.balance += rentAmount;
          owner.netWorth += rentAmount;
        }
        state.logs.unshift({
          id: `log_rent_${Date.now()}`,
          text: `${activePlayer.name} paid ₹${rentAmount.toLocaleString()} rent to ${owner?.name || 'Owner'} for ${targetTile.name}.`,
          type: 'warning',
          timestamp: Date.now()
        });
        nextPhase = 'RESOLVING';
      }
    } else if (targetTile.type === 'TAX') {
      const taxAmount = 250;
      activePlayer.balance = Math.max(0, activePlayer.balance - taxAmount);
      activePlayer.netWorth = Math.max(0, activePlayer.netWorth - taxAmount);
      state.logs.unshift({
        id: `log_tax_${Date.now()}`,
        text: `${activePlayer.name} paid ₹${taxAmount} GST Municipal Tax!`,
        type: 'warning',
        timestamp: Date.now()
      });
      nextPhase = 'RESOLVING';
    } else if (targetTile.type === 'GO_TO_JAIL') {
      activePlayer.currentTileIndex = 8;
      activePlayer.isInJail = true;
      activePlayer.jailTurns = 0;
      state.logs.unshift({
        id: `log_jail_${Date.now()}`,
        text: `🚨 ${activePlayer.name} was caught by Police Choki and sent to Sabarmati Central Jail!`,
        type: 'warning',
        timestamp: Date.now()
      });
      nextPhase = 'RESOLVING';
    } else if (targetTile.type === 'JAIL') {
      state.logs.unshift({
        id: `log_visit_${Date.now()}`,
        text: `${activePlayer.name} is just visiting Sabarmati Jail.`,
        type: 'info',
        timestamp: Date.now()
      });
      nextPhase = 'RESOLVING';
    } else if (targetTile.type === 'CHANCE') {
      const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
      if (card.amount) {
        activePlayer.balance = Math.max(0, activePlayer.balance + card.amount);
        activePlayer.netWorth = Math.max(0, activePlayer.netWorth + card.amount);
      }
      state.logs.unshift({
        id: `log_chance_${Date.now()}`,
        text: `📜 ${activePlayer.name} drew Chance: "${card.title}" (${card.description})`,
        type: 'chance',
        timestamp: Date.now()
      });
      nextPhase = 'RESOLVING';
    } else {
      state.logs.unshift({
        id: `log_roll_${Date.now()}`,
        text: `${activePlayer.name} landed on ${targetTile.name}.`,
        type: 'info',
        timestamp: Date.now()
      });
      nextPhase = 'RESOLVING';
    }

    // Step 6: Enable End Turn button or property buy modal
    state.phase = nextPhase;
    state.diceState = { rolling: false, value: diceVal };
    state.hoppingState = null;
    state.selectedProperty = selectedProp;

    this.latestGameState = state;
    GameEngine.getInstance().syncWithFirebase(state, this.myUid);
    await RoomService.getInstance().syncGameState(this.roomCode, state);
  }

  /**
   * BUY PROPERTY
   */
  public async buyProperty(): Promise<void> {
    const rawState = await this.fetchCurrentState();
    if (!rawState) return;

    const state = this.sanitizeStateForSync(rawState);
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || activePlayer.id !== this.myUid) return;

    const prop = state.selectedProperty;
    if (!prop) return;

    if (activePlayer.balance < prop.price) {
      console.warn('Insufficient balance to purchase property');
      return;
    }

    // Deduct price and assign ownership
    activePlayer.balance -= prop.price;
    if (!activePlayer.ownedPropertyIds.includes(prop.step)) {
      activePlayer.ownedPropertyIds.push(prop.step);
    }

    const existingIndex = state.properties.findIndex((p) => p.step === prop.step);
    if (existingIndex !== -1) {
      state.properties[existingIndex].ownerId = activePlayer.id;
    } else {
      state.properties.push({
        step: prop.step,
        ownerId: activePlayer.id,
        houses: 0,
        isMortgaged: false
      });
    }

    state.logs.unshift({
      id: `log_bought_${Date.now()}`,
      text: `🎉 ${activePlayer.name} bought ${prop.name} for ₹${prop.price.toLocaleString()}!`,
      type: 'reward',
      timestamp: Date.now()
    });

    // CRITICAL: Clear hoppingState and selectedProperty so End Turn appears
    state.phase = 'RESOLVING';
    state.selectedProperty = null;
    state.hoppingState = null;

    this.sounds.playMoneyChime();
    this.latestGameState = state;
    await RoomService.getInstance().syncGameState(this.roomCode, state);
  }

  /**
   * PASS PROPERTY
   */
  public async passProperty(): Promise<void> {
    const rawState = await this.fetchCurrentState();
    if (!rawState) return;

    const state = this.sanitizeStateForSync(rawState);
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || activePlayer.id !== this.myUid) return;

    const prop = state.selectedProperty;
    state.logs.unshift({
      id: `log_pass_${Date.now()}`,
      text: `${activePlayer.name} passed on buying ${prop?.name || 'the property'}.`,
      type: 'info',
      timestamp: Date.now()
    });

    // CRITICAL: Clear hoppingState and selectedProperty so End Turn appears
    state.phase = 'RESOLVING';
    state.selectedProperty = null;
    state.hoppingState = null;

    this.latestGameState = state;
    await RoomService.getInstance().syncGameState(this.roomCode, state);
  }

  /**
   * END TURN
   */
  public async endTurn(): Promise<void> {
    const rawState = await this.fetchCurrentState();
    if (!rawState) return;

    const state = this.sanitizeStateForSync(rawState);
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || activePlayer.id !== this.myUid) return;

    let nextIndex = (state.activePlayerIndex + 1) % state.players.length;
    let attempts = 0;
    while (state.players[nextIndex]?.isBankrupt && attempts < state.players.length) {
      nextIndex = (nextIndex + 1) % state.players.length;
      attempts++;
    }
    const nextPlayer = state.players[nextIndex];

    state.activePlayerIndex = nextIndex;
    state.activePlayerId = nextPlayer.id;
    state.phase = 'PLAYER_TURN';
    state.diceState = { rolling: false, value: null };
    state.hoppingState = null;
    state.selectedProperty = null;

    state.logs.unshift({
      id: `log_turn_${Date.now()}`,
      text: `Turn passed to ${nextPlayer.name} (${nextPlayer.colorName}).`,
      type: 'info',
      timestamp: Date.now()
    });

    this.latestGameState = state;
    await RoomService.getInstance().syncGameState(this.roomCode, state);
  }

  public async payJailFine(): Promise<void> {
    const rawState = await this.fetchCurrentState();
    if (!rawState) return;

    const state = this.sanitizeStateForSync(rawState);
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || activePlayer.id !== this.myUid) return;

    const fine = 500;
    activePlayer.balance = Math.max(0, activePlayer.balance - fine);
    activePlayer.isInJail = false;
    activePlayer.jailTurns = 0;

    state.logs.unshift({
      id: `log_jail_fine_${Date.now()}`,
      text: `${activePlayer.name} paid ₹${fine} Sabarmati Jail Bail fine and was released!`,
      type: 'info',
      timestamp: Date.now()
    });

    state.phase = 'PLAYER_TURN';
    state.hoppingState = null;
    this.latestGameState = state;
    await RoomService.getInstance().syncGameState(this.roomCode, state);
  }

  public async useJailCard(): Promise<void> {
    const rawState = await this.fetchCurrentState();
    if (!rawState) return;

    const state = this.sanitizeStateForSync(rawState);
    const activePlayer = state.players[state.activePlayerIndex];
    if (!activePlayer || activePlayer.id !== this.myUid) return;

    if (activePlayer.getOutOfJailCards > 0) {
      activePlayer.getOutOfJailCards -= 1;
      activePlayer.isInJail = false;
      activePlayer.jailTurns = 0;

      state.logs.unshift({
        id: `log_jail_card_${Date.now()}`,
        text: `${activePlayer.name} used a VIP Release Pass and left Sabarmati Jail!`,
        type: 'reward',
        timestamp: Date.now()
      });

      state.phase = 'PLAYER_TURN';
      state.hoppingState = null;
      this.latestGameState = state;
      await RoomService.getInstance().syncGameState(this.roomCode, state);
    }
  }
}
