import { Socket } from 'socket.io';
import express from 'express';
import dotenv from 'dotenv';
import short from 'short-uuid';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { log } from './Utils/utils';

const app = express();
dotenv.config();

interface Player {
  id: string;
  name: string;
  vote: string | undefined;
}

interface Room {
  players: Player[];
  finished: boolean;
}

const port = process.env.PORT || 3000;
const origin = process.env.ORIGIN || `http://127.0.0.1:8080`;

const options = {
  cors: {
    origin: origin,
    methods: ['GET', 'POST'],
  },
};

const httpServer = createServer();
const io = new Server(httpServer, options);
log('Server running in development mode.');
console.log('Origin: ' + origin);
// keeping the connection alive
setInterval(() => {
  io.emit('ping');
  logRooms();
}, 8000);

app.get('/', (req, res) => {
  res.send('<h1>Service Up!</h1>');
});

httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});

const rooms = new Map<String, Room>();

io.on('connection', (socket: Socket) => {
  log('A user connected ' + socket.id);
  let roomId = socket.handshake.query['roomId'] as string;
  let name = sanitize(socket.handshake.query['name'] as string);
  if (!roomId) {
    roomId = short.generate();
    socket.emit('room', roomId);
  }
  socket.join(roomId);

  const room = rooms.get(roomId) || {
    players: [{ id: socket.id, name, vote: undefined }],
    finished: false,
  };
  rooms.set(roomId, { ...room, players: [...room.players, { id: socket.id, name, vote: undefined }] });
  updateClientsInRoom(roomId);

  socket.on('name', (name) => {
    const cleanName = sanitize(name);
    const player = rooms.get(roomId)?.players.find((p) => p.id === socket.id);
    log(`User entered name ${cleanName}`);
    if (player && player.name != cleanName) {
      log(`Changing name from ${player.name} to ${cleanName}`);
      player.name = cleanName;
    }
    updateClientsInRoom(roomId);
  });

  socket.on('vote', (vote: string) => {
    const player = rooms.get(roomId)?.players.find((p) => p.id === socket.id);
    if (player) {
      player.vote = vote;
    }
    log(`Player ${player!.name} voted ${player!.vote}`);

    checkAllPlayersVote(roomId);
    updateClientsInRoom(roomId);
  });

  socket.on('show', () => {
    const room = rooms.get(roomId);
    rooms.set(roomId, { players: room!.players, finished: true });
    io.to(roomId).emit('update', rooms.get(roomId));
  });

  socket.on('restart', () => {
    restartGame(roomId);
  });

  socket.on('leave', () => disconnectPlayer(roomId, socket.id));

  socket.on('disconnect', () => disconnectPlayer(roomId, socket.id));

  // keeping the connection alive
  socket.on('pong', () => {
    rooms.get(roomId)?.players.find((p) => p.id == socket.id);
  });
});

function disconnectPlayer(roomId: string, socketId: string) {
  const player = rooms.get(roomId)?.players.find((p) => p.id === socketId);
  if (player) {
    log(`Player ${player.name} has disconnected`);
    const room = rooms.get(roomId);
    rooms.set(roomId, {
      players: room!.players.filter((p) => p.id !== socketId),
      finished: room!.finished,
    });
  }
  checkAllPlayersVote(roomId);
  updateClientsInRoom(roomId);
}

function updateClientsInRoom(roomId: string) {
  const room = rooms.get(roomId);
  io.to(roomId).emit('update', room);
}

function restartGame(roomId: string) {
  const room = rooms.get(roomId);
  const players = room!.players.map((p) => {
    return { ...p, vote: undefined };
  });
  rooms.set(roomId, { players: players, finished: false });
  log(`Restarted game with Players: ${players.map((p) => p.name).join(', ')}`);
  updateClientsInRoom(roomId);
}

function logRooms() {
  if (rooms) {
    rooms.forEach((room, key) => {
      const players = room.players.map((p) => p.name).join(', ');
      log(
        `Room: ${key} - Players: ${players} - Vote finished: ${room.finished}`
      );
    });
  }
}

function checkAllPlayersVote(roomId: string) {
  const playersInRoom = rooms.get(roomId)?.players;
  if (playersInRoom?.every((p) => p.vote)) {
    rooms.set(roomId, { players: playersInRoom, finished: true });
    updateClientsInRoom(roomId);
  }
}

function sanitize(str: string, limit = 24) {
  return str ? str.substring(0, limit).replace(/[^a-zA-Z0-9]/g, '') : str;
}
