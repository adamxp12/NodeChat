var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var Filter = require('bad-words');


var ver = 1.2;
console.log('');
console.log('NodeChat V'+ver);
app.use(express.static(__dirname + '/public'));

var page = fs.readFileSync("./public/chat.inc", "utf8", function(err, data) {
		if (err) throw err;
	});


app.get('/', function(req, res){
  res.send(page);
});

var numUsers = 0;

io.on('connection', function(socket){
  var addedUser = false;
  //console.log('a user connected');

  socket.on('new message', function (data) {
    filter = new Filter();
    msg = filter.clean(data);
    var lastmsgtime = socket.lastmsgtime;
    var timesince = lastmsgtime+5000;
    var d = new Date();    
    if(timesince<d.getTime()) { // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: msg
    });
  console.log("Chat - "+socket.username+": "+msg);

  socket.lastmsgtime = d.getTime();
} else {
  console.log("Failed send - "+socket.username+": "+msg);
}
 });

  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    socket.lastmsgtime=0;
    addedUser = true;

    socket.emit('login', {
      numUsers: numUsers
    });

    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
    console.log('');
    console.log('   Hello '+socket.username);
    console.log('');
  });

  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
      console.log('');
      console.log('   Goodbye '+socket.username);
      console.log('');
    }
  });

});




http.listen(3000, function(){
  console.log('listening on *:3000');
  console.log(' ');
});