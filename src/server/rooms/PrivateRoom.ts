import { Client } from 'colyseus';
import { NavoVyaparRoom, JoinOptions } from './NavoVyaparRoom';

export interface PrivateRoomOptions extends JoinOptions {
  roomCode?: string;
  isHost?: boolean;
}

export class PrivateRoom extends NavoVyaparRoom {
  public roomCode: string = '';

  onCreate(options: PrivateRoomOptions) {
    super.onCreate(options);

    this.roomCode = options.roomCode || this.generateRoomCode();
    this.setMetadata({ roomCode: this.roomCode });

    this.onMessage('request_start', (client) => {
      // Start match with available players and fill bots
      this.startMatch();
    });
  }

  onJoin(client: Client, options: PrivateRoomOptions = {}) {
    super.onJoin(client, options);
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'NAVO-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
