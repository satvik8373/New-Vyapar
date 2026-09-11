import { Room, Client, matchMaker } from 'colyseus';
import { Schema, type, MapSchema } from '@colyseus/schema';

export class QueuePlayer extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('string') avatar: string = 'crown';
}

export class MatchQueueState extends Schema {
  @type({ map: QueuePlayer }) players = new MapSchema<QueuePlayer>();
  @type('number') countdown: number = 15;
  @type('boolean') isCountingDown: boolean = false;
}

export class MatchQueue extends Room<{ state: MatchQueueState }> {
  maxClients = 4;
  private countdownTimer: NodeJS.Timeout | null = null;
  private readonly BOT_FILL_TIMEOUT = 15;

  onCreate() {
    this.setState(new MatchQueueState());

    this.onMessage('cancel_queue', (client) => {
      client.leave();
    });
  }

  onJoin(client: Client, options: { name?: string; avatar?: string } = {}) {
    const qPlayer = new QueuePlayer();
    qPlayer.id = client.sessionId;
    qPlayer.name = options.name || `Merchant ${this.state.players.size + 1}`;
    qPlayer.avatar = options.avatar || 'crown';

    this.state.players.set(client.sessionId, qPlayer);

    // If 4 players join, immediately launch match
    if (this.state.players.size === 4) {
      this.launchMatch();
      return;
    }

    // Start 15s countdown if 2 players or more join
    if (this.state.players.size >= 2 && !this.state.isCountingDown) {
      this.startCountdown();
    } else if (this.state.players.size === 1 && !this.state.isCountingDown) {
      // Start countdown even for 1 player after a brief wait so solo players can test with bots
      this.startCountdown();
    }
  }

  private startCountdown() {
    this.state.isCountingDown = true;
    this.state.countdown = this.BOT_FILL_TIMEOUT;

    if (this.countdownTimer) clearInterval(this.countdownTimer);

    this.countdownTimer = setInterval(() => {
      this.state.countdown -= 1;

      if (this.state.countdown <= 0) {
        if (this.countdownTimer) clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.launchMatch();
      }
    }, 1000);
  }

  private async launchMatch() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    // Create authoritative NavoVyapar game room
    try {
      const matchRoom = await matchMaker.createRoom('navo_vyapar', {
        fillBots: true
      });

      // Send room id to all queued clients
      this.broadcast('match_ready', {
        roomId: matchRoom.roomId
      });
    } catch (err) {
      console.error('Failed to create match room:', err);
    }
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);

    if (this.state.players.size === 0 && this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
      this.state.isCountingDown = false;
      this.state.countdown = this.BOT_FILL_TIMEOUT;
    }
  }

  onDispose() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }
}
