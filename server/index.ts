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
  roomId: string;
  vote: string | undefined;
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

let players: Player[] = [];

io.on('connection', (socket: Socket) => {
  log('A user connected ' + socket.id);
  let roomId = socket.handshake.query['roomId'] as string;
  let name = socket.handshake.query['name'] as string;
  if (!roomId) {
    roomId = short.generate();
    socket.emit('room', roomId);
  }
  socket.join(roomId);

  players.push({ id: socket.id, name: name, roomId: roomId, vote: undefined });
  updateClientsInRoom(roomId);

  socket.on('name', (name) => {
    const player = players.find((p) => p.id == socket.id);
    log(`User entered name ${name}`);
    if (player && player.name != name) {
      log(`Changing name from ${player.name} to ${name}`);
      player.name = name;
    }
    updateClientsInRoom(roomId);
  });

  socket.on('vote', (vote: string) => {
    let player = players.find((p) => p.id == socket.id);
    if (player) {
      player.vote = vote;
    }
    log(`Player ${player!.name} voted ${player!.vote}`);

    checkAllPlayersVote(roomId);
    updateClientsInRoom(roomId);
  });

  socket.on('show', () => {
    io.to(roomId).emit('show');
  });

  socket.on('restart', () => {
    restartGame(roomId);
  });

  function disconnectPlayer() {
    const player = players.find((p) => p.id === socket.id);
    if (player) {
      log(`Player ${player.name} has disconnected`);
      players = players.filter((p) => p.id !== socket.id);
    }
    checkAllPlayersVote(roomId);
    updateClientsInRoom(roomId);
  }

  socket.on('leave', () => disconnectPlayer());

  socket.on('disconnect', () => disconnectPlayer());

  // keeping the connection alive
  socket.on('pong', () => {
    players.find((p) => p.id == socket.id);
  });
});

function updateClientsInRoom(roomId: string) {
  const roomPlayers = players.filter((p) => p.roomId == roomId);
  io.to(roomId).emit('update', roomPlayers);
}

function restartGame(roomId: string) {
  const roomPlayers = players.filter((p) => p.roomId == roomId);
  roomPlayers.forEach((p) => (p.vote = undefined));
  log(
    `Restarted game with Players: ${roomPlayers.map((p) => p.name).join(', ')}`
  );
  io.to(roomId).emit('restart');
  io.to(roomId).emit('update', roomPlayers);
}

function logRooms() {
  const rooms = players.map((e) => e.roomId);
  if (rooms) {
    for (const room of rooms.filter((val, i, arr) => arr.indexOf(val) == i)) {
      const playersInRoom = players
        .filter((p) => p.roomId == room)
        .map((p) => p.name);
      log(`Room: ${room} - Players: ${playersInRoom.join(', ')}`);
    }
  }
}

function checkAllPlayersVote(roomId: string) {
  const playersInRoom = players.filter((p) => p.roomId == roomId);
  if (playersInRoom.every((p) => p.vote)) {
    io.to(roomId).emit('show');
  }
}
