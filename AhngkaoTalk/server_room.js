// server.js

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.set('views', './views');
// === PUG engine ===
// app.set('view engine', 'pug');

// === HTML engine ===
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.render('chat.html');
});

var count = 1;
var roomList = new Set(['ROOM 1', 'ROOM 2', 'ROOM 3']);

var roomInfo = new Object();
roomList.forEach(room => {
	roomInfo[room] = new Array();
});
io.on('connection', function (socket) {

	io.to(socket.id).emit('socket id', socket.id);
	console.log('user connected: ', socket.id);
	count++;

	// io.to(socket.id).emit('create name', name);

	socket.on('receive client', function (username, room) {
		socket.name = username;
		socket.join(room, function () {
			let rooms = Object.keys(socket.rooms);
			socket.roomName = room;
			roomList.add(room);
			
			roomInfo[room].push(username);
			console.log(roomInfo);
			io.to(room).emit('all room list', roomList);
			io.to(room).emit('this room in users', roomInfo[room]);
		});
	});

	socket.on('disconnect', function () {
		console.log('user disconnected: ' + socket.id + ' ' + socket.name);
		socket.leave('room', () => {
			io.to('room').emit(`user ${socket.id} has left the room`);
			console.log('user leave this room: ' + socket.id + ' ' + socket.name);
			roomInfo[socket.roomName].splice(roomInfo[socket.roomName].indexOf(socket.name), 1);
			console.log(roomInfo);
		});
	});

	socket.on('disconnect from client', function () {
		socket.disconnect();
	});

	socket.on('send message', function (name, text) {
		var msg = name + ' : ' + text;
		console.log(msg);
		io.to(socket.roomName).emit('receive message', msg, socket.id);
	});

	socket.on('send alert', function (command, name) {
		if (command === 'connected') {
			var msg = name + ' 님이 접속했습니다.'
			console.log(msg);
			io.to(socket.roomName).emit('receive alert', msg);
		}
		if (command === 'disconnected') {
			var msg = name + ' 님이 채팅방을 나갔습니다.'
			console.log(msg);
			io.to(socket.roomName).emit('receive alert', msg);
		}

	});

	//채팅 기록 보관

});

http.listen(3000, function () {
	console.log('server on..');
});