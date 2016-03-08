// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');
var Filter = require('bad-words');
var port = 3000;



console.log("AdamChat Starting");

app.use(express.static(__dirname+"/public"));


// Routing
var page = fs.readFileSync("./public/index.html", "utf8", function(err, data) {
    if (err) throw err;
  });

app.get("/", function(req, res) {
  res.send(page);
});


//  Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;
  

  // when the client emits 'new message', this listens and executes
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
}
    
    
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    socket.lastmsgtime=0;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
  console.log(" ");
});

