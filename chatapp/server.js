const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {};

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    users[socket.id] = { username, room };

    socket.emit('message', { username: 'System', text: `Welcome to ${room}, ${username}!` });

    socket.to(room).emit('message', { username: 'System', text: `${username} has joined the room.` });
  });

  socket.on('chatMessage', (msg) => {
    const user = users[socket.id];
    if (user) {
      io.to(user.room).emit('message', { username: user.username, text: msg });
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      io.to(user.room).emit('message', { username: 'System', text: `${user.username} has left the room.` });
      delete users[socket.id];
    }
  });
});


app.use(express.static('public'));

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
