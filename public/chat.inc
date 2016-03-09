<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NodeChat</title>
    <link rel="stylesheet" href="css/foundation.css" />
    <link rel="stylesheet" href="css/app.css" />
  </head>
  <body id="body">

    <div class="hide">
      <h3>Who are you?</h3>
      <input class="usernamebox" maxlength="14" type="text" /><br>
      <small>Make sure your sound is on :D</small>
    </div>

    <div class="row">
      <div class="medium-12 columns header">
        <span class="notification">Welcome to NodeChat! <small>Powered by NodeJS</small></span>
        <span class="notification float-right">Designed and coded by <a href="http://adamblunt.me">Adam Blunt</a></small></span>
      </div>
    </div>

    <div class="row chatwindow">
      <ul id="msgs" class="msgs">
        <li></li>     
      </ul>
    </div>
    <div class="row textbox">
      <div class="medium-12 columns">
        <input class="msgbox" maxlength="120">
      </div>
    </div>

    <audio id="msgsound">
      <source src="sounds/msg.mp3" type="audio/mpeg">
    </audio>
    <audio id="joinsound">
      <source src="sounds/join.mp3" type="audio/mpeg">
    </audio>
    <audio id="buzzsound">
      <source src="sounds/buzz.mp3" type="audio/mpeg">
    </audio>

    <script src="/socket.io/socket.io.js"></script>
     <script src="http://code.jquery.com/jquery-1.11.1.js"></script>
     <script src="main.js"></script>
  </body>
</html>
