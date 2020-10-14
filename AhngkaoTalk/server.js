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

var count=1;
io.on('connection', function(socket){ 
  	console.log('user connected: ', socket.id);  
  	var name = "익명" + count++;                 
	socket.name = name;
	io.to(socket.id).emit('socket id', socket.id);
  	io.to(socket.id).emit('create name', name);   
	
	socket.on('recieve username', function(username){
		socket.name = username;
	});

	socket.on('disconnect', function(){ 
	  console.log('user disconnected: '+ socket.id + ' ' + socket.name);
	  // socket.broadcast.emit 모든 유저들에게 채팅방을 나간 유저의 정보 알림메시지를 뿌림
	});
	socket.on('disconnect from client', function(){ 
		socket.disconnect();
	});

	socket.on('send message', function(name, text){ 
		var msg = name + ' : ' + text;
		socket.name = name;
    	console.log(msg);
    	io.emit('receive message', msg, socket.id);
	});

	socket.on('send alert', function(command, name){
		if(command === 'connected'){
			var msg = name + ' 님이 접속했습니다.'
			socket.name = name;
    		console.log(msg);
    		io.emit('receive alert', msg);
		}
		if(command === 'disconnected'){
			var msg = name + ' 님이 채팅방을 나갔습니다.'
			socket.name = name;
    		console.log(msg);
    		io.emit('receive alert', msg);
		}
		
	});
	
});

http.listen(3000, function(){ 
	console.log('server on..');
});