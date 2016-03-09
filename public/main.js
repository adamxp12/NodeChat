$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms

  // Initialize variables
  var $window = $(window);
  var $body = $('#body');
  var $usernameInput = $('.usernamebox'); // Input for username
  var $messages = $('.msgs'); // Messages area
  var $inputMessage = $('.msgbox'); // Input message input box

  var $loginPage = $('.hide'); // The login page
  var $chatPage = $('.chatwindow'); // The chatroom page

  // Prompt for setting a username
  var username;
  var lastmsgtime;
  var connected = false;
  var $currentInput = $usernameInput.focus();
  var $msgsound = $('#msgsound');
  var $joinsound = $('#joinsound');
  var $buzzsound = $('#buzzsound');

  var socket = io();

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
      if(username=="admblnt") {
        $(body).css({"background": "url('adm.jpg')", "backgroundsize": "cover"});
      }
      joinsound.play(); // Play sound when you login
      lastmsgtime = 0;
    }
  }

  // Sends a chat message
  // function sendMessage () {
  //   var message = $inputMessage.val();

  //   // Prevent markup from being injected into the message
  //   message = cleanInput(message);

  //   // if there is a non-empty message and a socket connection
  //     $inputMessage.val('');
  //     addChatMessage({
  //       username: username,
  //       message: message
  //     });
  //     // tell server to execute 'new message' and send along one parameter
  //     socket.emit('new message', message);
  // }


  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    var d = new Date();
    var timesince = lastmsgtime+5000;


    // if there is a non-empty message and a socket connection
    if (message && connected) {
      if(timesince<d.getTime()) {
        $inputMessage.val('');
        addChatMessage({
          username: username,
          message: message
        });
        // tell server to execute 'new message' and send along one parameter
        lastmsgtime = d.getTime();
        socket.emit('new message', message, lastmsgtime);
        
      } else {
        log("You must wait 5 seconds between messages");
        buzzsound.play();
      }
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('notification').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    
    var $avatarDiv = $('<img class="avatar" />')
      .attr("src", "https://avatars.io/twitter/"+data.username);

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username);
    var $messageBodyDiv = $('<span class="msg">')
      .text(data.message);

    var $messageDiv = $('<li />')
      .data('username', data.username)
      .append($avatarDiv, $usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
    msgsound.play();
  }


  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $chatPage[0].scrollTop = $chatPage[0].scrollHeight;
  }

  function scrollthefuck() {
    var objDiv = document.getElementById("chatwindow");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        
        sendMessage();
      } else {
        setUsername();
      }
    }
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message    
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
    joinsound.play(); // Play login sound for others
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });
});
