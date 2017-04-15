var express = require('express');
var app = express();
var server = require('http').Server(app);//.createServer();
var io = require('socket.io')(server);

var players = [];
var player_data = [];
var messages_recieved = 0;
var playback_data = [];
//var next_player = 0;

function Player (id, col, data) {
    this.color_id = col;
    this.id = id;
    this.data_string = data;
}

io.on('connection', function(socket) {
    console.log('Connected to ' + socket.id + ', players: ' + players.length);
    socket.on ('initialize', function (msg) {
	    var color_num = players.length;

	    var new_player = new Player(socket.id, color_num, msg);

	    socket.broadcast.emit('player_joined', {color_id: new_player.color_id, position:msg});
            socket.emit('init_color', {color_id: new_player.color_id});
	    socket.emit('player_data', {other_players: player_data});

	    player_data.push({color_id: new_player.color_id, position:msg});
	    players.push(new_player);
	    //next_player = next_player + 1;

	    console.log('New color_id: ' + players.length + ', message: ' + msg + ', players: ' + players.length);

    });

    socket.on ('positionUpdate', function (msg) {
	for (var i = 0; i<players.length; i++) {
	    var player = players[i];
	    console.log("player: " + player.id + " " + player.color_id);
	    if (player.id == socket.id) {
		console.log("got " + player.color_id + " msg ");
		playback_data.push({id: player.color_id, data_string: msg});
        	socket.broadcast.emit ('playerMoved', {id: player.color_id, data_string: msg});
	    }
	}
	messages_recieved++;
	if (messages_recieved >= players.length) {
	    io.sockets.emit('playback_ready', playback_data);
	}
	
    });

    socket.on('disconnect', function(){
	console.log('user ' + socket.id + ' disconnected');
	for (player in players) {
	    if (player.id == socket.id) {
		socket.broadcast.emit('player_left', player.color_id);
	    }
	}
    });
});

server.listen(8080, function(){
  console.log('listening on *:8080');
});
