var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(require('express').static(__dirname + '/public'));

app.get('/', (req, res) => {

    res.sendFile(__dirname + '/index.html')

});

// Подключились
io.on('connection', (socket) => {

    console.log('Client connected');

    socket.on('disconnect', () => console.log('Client disconnected'));

    socket.on('send.notification', () => {

        io.emit('notification', {
            data: {
                title: 'Title notify',
                link: '/',
                tag: 'tag',
                body: 'Body notify',
                icon: '//s2.favim.com/mini/34/animal-awesome-by-ana-mendes-cat-citty-271169.jpg'
            }
        });

    });

});

http.listen((process.env.PORT || 5000), () => console.log('listening on *:' + (process.env.PORT || 5000)));