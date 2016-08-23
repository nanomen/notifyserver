var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html') );

// Пдключились
io.on('connection', (socket) => {

  console.log('Client connected');

  socket.on('disconnect', () => console.log('Client disconnected'));
});

// Посылаем события
setTime();

//io.on('getTime', setTime);


setTime function() {
  io.emit('setTime', new Date().toTimeString());
};

http.listen((process.env.PORT || 5000), () => console.log('listening on *:' + (process.env.PORT || 5000)));