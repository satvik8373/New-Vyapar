import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server, matchMaker } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';

import { MatchQueue } from './rooms/MatchQueue';
import { NavoVyaparRoom } from './rooms/NavoVyaparRoom';
import { PrivateRoom } from './rooms/PrivateRoom';

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

// Compatibility bridge for colyseus.js client (which expects response.room.name / response.room.roomId)
const origInvokeMethod = (matchMaker.controller as any).invokeMethod.bind(matchMaker.controller);
(matchMaker.controller as any).invokeMethod = async function(
  method: string,
  roomName: string,
  clientOptions?: any,
  authOptions?: any
) {
  const result = await origInvokeMethod(method, roomName, clientOptions, authOptions);
  if (result && result.roomId && !result.room) {
    result.room = {
      roomId: result.roomId,
      name: result.name || roomName,
      processId: result.processId
    };
  }
  return result;
};

// Protocol bridge: colyseus.js 0.16 does not expect handshakeLength prefix in Protocol.JOIN_ROOM
import { getMessageBytes, Protocol } from '@colyseus/core';
(getMessageBytes as any)[Protocol.JOIN_ROOM] = (reconnectionToken: string, serializerId: string, handshake?: Uint8Array) => {
  const tokenBuf = Buffer.from(reconnectionToken || '', 'utf8');
  const serializerBuf = Buffer.from(serializerId || '', 'utf8');
  const handshakeLen = handshake?.byteLength || 0;

  const totalLen = 1 + 1 + tokenBuf.length + 1 + serializerBuf.length + handshakeLen;
  const buffer = Buffer.allocUnsafe(totalLen);

  let offset = 0;
  buffer[offset++] = Protocol.JOIN_ROOM;
  buffer[offset++] = tokenBuf.length;
  tokenBuf.copy(buffer, offset);
  offset += tokenBuf.length;

  buffer[offset++] = serializerBuf.length;
  serializerBuf.copy(buffer, offset);
  offset += serializerBuf.length;

  if (handshake && handshakeLen > 0) {
    buffer.set(handshake, offset);
    offset += handshakeLen;
  }

  return buffer;
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', server: 'Navo Vyapar Colyseus', uptime: process.uptime() });
});

const server = http.createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({
    server
  })
});

// Register rooms
gameServer.define('match_queue', MatchQueue);
gameServer.define('navo_vyapar', NavoVyaparRoom);
gameServer.define('private_room', PrivateRoom).filterBy(['roomCode']);

gameServer.listen(port).then(() => {
  console.log(`🎮 Navo Vyapar Colyseus Server running on ws://localhost:${port}`);
}).catch((err) => {
  console.error('Failed to start server:', err);
});
