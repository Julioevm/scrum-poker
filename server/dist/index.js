"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const short_uuid_1 = __importDefault(require("short-uuid"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const utils_1 = require("./Utils/utils");
const app = (0, express_1.default)();
dotenv.config();
const port = process.env.PORT || 3000;
const origin = process.env.ORIGIN || `http://127.0.0.1:8080`;
const options = {
    cors: {
        origin: origin,
        methods: ['GET', 'POST'],
    },
};
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, options);
(0, utils_1.log)('Server running in development mode.');
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
const rooms = new Map();
io.on('connection', (socket) => {
    (0, utils_1.log)('A user connected ' + socket.id);
    let roomId = socket.handshake.query['roomId'];
    let name = sanitize(socket.handshake.query['name']);
    if (!roomId) {
        roomId = short_uuid_1.default.generate();
        socket.emit('room', roomId);
    }
    socket.join(roomId);
    if (rooms.get(roomId)) {
        rooms.get(roomId).players.push({
            id: socket.id,
            name: name,
            vote: undefined,
        });
    }
    else {
        rooms.set(roomId, {
            players: [
                {
                    id: socket.id,
                    name: name,
                    vote: undefined,
                },
            ],
            finished: false,
        });
    }
    updateClientsInRoom(roomId);
    socket.on('name', (name) => {
        var _a;
        const cleanName = sanitize(name);
        const player = (_a = rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.players.find((p) => p.id === socket.id);
        (0, utils_1.log)(`User entered name ${cleanName}`);
        if (player && player.name != cleanName) {
            (0, utils_1.log)(`Changing name from ${player.name} to ${cleanName}`);
            player.name = cleanName;
        }
        updateClientsInRoom(roomId);
    });
    socket.on('vote', (vote) => {
        var _a;
        const player = (_a = rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.players.find((p) => p.id === socket.id);
        if (player) {
            player.vote = vote;
        }
        (0, utils_1.log)(`Player ${player.name} voted ${player.vote}`);
        checkAllPlayersVote(roomId);
        updateClientsInRoom(roomId);
    });
    socket.on('show', () => {
        const room = rooms.get(roomId);
        rooms.set(roomId, { players: room.players, finished: true });
        io.to(roomId).emit('update', rooms.get(roomId));
    });
    socket.on('restart', () => {
        restartGame(roomId);
    });
    socket.on('leave', () => disconnectPlayer(roomId, socket.id));
    socket.on('disconnect', () => disconnectPlayer(roomId, socket.id));
    // keeping the connection alive
    socket.on('pong', () => {
        var _a;
        (_a = rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.players.find((p) => p.id == socket.id);
    });
});
function disconnectPlayer(roomId, socketId) {
    const room = rooms.get(roomId);
    const player = room === null || room === void 0 ? void 0 : room.players.find((p) => p.id === socketId);
    if (player) {
        (0, utils_1.log)(`Player ${player.name} has disconnected`);
        rooms.set(roomId, {
            players: room.players.filter((p) => p.id !== socketId),
            finished: room.finished,
        });
        // Delete empty rooms
        rooms.get(roomId).players.length < 1 && deleteRoom(roomId);
    }
    checkAllPlayersVote(roomId);
    updateClientsInRoom(roomId);
}
function deleteRoom(roomId) {
    if (rooms.has(roomId)) {
        (0, utils_1.log)(`Deleting room ${roomId}`);
        rooms.delete(roomId);
    }
}
function updateClientsInRoom(roomId) {
    const room = rooms.get(roomId);
    io.to(roomId).emit('update', room);
}
function restartGame(roomId) {
    const room = rooms.get(roomId);
    const players = room.players.map((p) => {
        return Object.assign(Object.assign({}, p), { vote: undefined });
    });
    rooms.set(roomId, { players: players, finished: false });
    (0, utils_1.log)(`Restarted game with Players: ${players.map((p) => p.name).join(', ')}`);
    updateClientsInRoom(roomId);
}
function logRooms() {
    if (rooms) {
        rooms.forEach((room, key) => {
            const players = room.players.map((p) => p.name).join(', ');
            (0, utils_1.log)(`Room: ${key} - Players: ${players} - Vote finished: ${room.finished}`);
        });
    }
}
function checkAllPlayersVote(roomId) {
    var _a;
    const playersInRoom = (_a = rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.players;
    if (playersInRoom === null || playersInRoom === void 0 ? void 0 : playersInRoom.every((p) => p.vote)) {
        rooms.set(roomId, { players: playersInRoom, finished: true });
        updateClientsInRoom(roomId);
    }
}
function sanitize(str, limit = 24) {
    return str ? str.substring(0, limit).replace(/[^a-zA-Z0-9]/g, '') : str;
}
