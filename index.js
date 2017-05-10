var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/my', function(req, res){
  res.sendFile(__dirname + '/circle_origin.png');
});
app.get('/other', function(req, res){
  res.sendFile(__dirname + '/circle_other.png');
});

var users = {}; 
var userpoints = {};
io.on('connection', function(client){

	client.emit('show other', users);
	client.emit('user connected', client.id);
	client.on('connection done', function(coordx, coordy, plcol, plrad, mX, mY){
		users[client.id] = {
			x: coordx,
			y: coordy,
			col: plcol,
			rad: plrad,
			msX: mX,
			msY: mY			
		};
		client.broadcast.emit('user done', coordx, coordy, plcol, plrad, client.id, mX, mY);
	});


	client.on('moving done', function(coordx, coordy, mX, mY){
		users[client.id].x = coordx;
		users[client.id].y = coordy;
		client.broadcast.emit('moving done', coordx, coordy, client.id, mX, mY);
		
	});
	
	client.on('moving point', function(mX, mY) {
		client.broadcast.emit('moving point', mX, mY, client.id)
	});
	
	client.on('disconnect', function(){
		client.broadcast.emit('user disconnected', client.id);
		delete users[client.id];
	});

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});