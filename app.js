//**********REQUIREMENTS************
var fs = require('fs');
var https = require('https');

var express = require('express');
var app = express();

var options = {
  key: fs.readFileSync(__dirname + '/key.pem'),
  cert: fs.readFileSync(__dirname + '/lauchmann_live.crt')
};
var serverPort = 443;

var server = https.createServer(options, app);
var io = require('socket.io')(server, {});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/client/favicon.ico'));

server.listen(serverPort, function() {
  console.log('server up and running at %s port', serverPort);
});

// set up plain http server
var http = express();

// set up a route to redirect http to https
http.all('*', function(req, res) {  
    res.redirect('https://' + req.headers.host + req.url);
})

// have it listen on 80
http.listen(80);

var players = [];
var ids = [];
var spyName;
var options = ["Casino", "Supermarkt", "Militärbasis", "Universität", "Bank", "Dampflokomotive", "Filmstudio", "Flugzeug", "Hotel", "Krankenhaus", "Kreuzfahrtschiff", "Piratenschiff", "Polarstation", "Polizeistation", "Restaurant", "Schule", "Strand", "Theater", "Wellness-Tempel"]
var place;

//**********GET RANDOM MEMBER IN SPECIFIC ROOM************

function getRandomInRoom(room) {
    var roomIds = [];
    for (var member in io.sockets.adapter.rooms[room].sockets) {
        roomIds.push(member);
    }
    var spyId = roomIds[Math.floor(Math.random() * roomIds.length)]
    return spyId;
}

//**********ON PLAYER CONNECT TO SERVER************
    io.sockets.on('connection', function (socket) {
    socket.join('/default');
    socket.room = "/default";
    //**********REGISTER NEW PLAYER NAME AND ID************
    socket.on('newPlayer', function (data) {
        io.to(socket.id).emit('msg', 'Willkommen ' + data.username);
        players.push(data.username);
        ids.push(socket.id);
        socket.username = data.username;
    });
    //**********ON CLICK START SELECT SPY************
    socket.on('tryStart', () => {
        var spy = getRandomInRoom(socket.room);
        io.to(spy).emit('spy');
    });
    //**********ON SPY IS READY SELECT WORKPLACE************
    socket.on('spyready', () => {
        var place = Math.floor(Math.random() * Math.floor(20));
        socket.to(socket.room).emit('startGame', place);
        io.sockets.adapter.rooms[socket.room].workPlace = place;
    });

    //**********ON PLAYER DISCONNECT REMOVE FROM ARRAY, NOTIFY ALL PLAYERS IN ROOM************
    socket.on('disconnect', () => {
        console.log('Player disconnecting: ' + socket.id + socket.username);
        console.log('ID: ' + socket.id + " Name: " + socket.username + " Room: " + socket.room);
        console.log('---------');

        players.splice(players.indexOf(socket.username), 1);
        ids.splice(ids.indexOf(socket.id), 1);
        if (io.sockets.adapter.rooms[socket.room] == "/default") {} else {
            if(io.in(socket.room) != undefined){
                io.in(socket.room).emit("refreshPlayers", getPlayersInRoom(socket.room));
            }
        }
    });
    //**********ON VERDACHT TELL EVERYONE************
    socket.on('verdaechtigen', () => {
        io.to(socket.room).emit('broadcast', socket.username + ' verdächtigt jemanden!');
    });
    //**********CHECK IF SPY GUESS IS CORRECT THEN NOTIFY OTHERS************
    socket.on('spyChoice', function (data) {
        spyName = socket.username;
        if (data == io.sockets.adapter.rooms[socket.room].workPlace) {
            io.to(socket.room).emit('broadcast', spyName + ' war der Spion und hat das Spiel gewonnen!')
        } else {
            io.to(socket.room).emit('broadcast', spyName + ' war der Spion und hat falsch geraten. Er dachte, ihr wärt in ' + options[data] + '!');
        }
    });
    //**********CREATE ROOM, GENERATE JOINCODE, SETNAME************
    socket.on('createGame', function (data) {
        let roomNum = data.code.toString();
        socket.join(roomNum);
        socket.room = roomNum;
        socket.emit('joinRoom', roomNum);
        io.to(data.code).emit('refreshPlayers', getPlayersInRoom(data.code));
    });
    //**********CHECK IF ROOM EXISTS, THEN JOIN, THEN NOTIFY EXISTING PLAYERS************
    socket.on('joinGameCheck', (code) => {
        if (io.sockets.adapter.rooms[code] == undefined) socket.emit('broadcast', "Der von dir gesuchte Raum konnte nicht gefunden werden");
        else {
            socket.join(code);
            socket.room = code;
            socket.emit('joinRoom', code);
            io.to(code).emit('refreshPlayers', getPlayersInRoom(code));
        }
    });
    //**********GET ALL PLAYERS IN SPECIFIC ROOM************
    function getPlayersInRoom(code) {
        var roomIds = [];
        var socketsArray = [];
        var playersInRoom = [];
        if(io.sockets.adapter.rooms[code] != undefined){
            for (var member in io.sockets.adapter.rooms[code].sockets) {
                roomIds.push(member);
            }
            for (i = 0; i < roomIds.length; i++) {
                socketsArray.push(io.sockets.connected[roomIds[i]]);
            }
            for (i = 0; i < socketsArray.length; i++) {
                playersInRoom.push(socketsArray[i].username);
            }
    
            return playersInRoom;
        }
    }
    //**********RETURN TO MAIN MENU************
    socket.on('toMain', () => {
        if(socket.room == "/default") {
            
        } else {
            let currPlayers = getPlayersInRoom(socket.room);
            let playerIn = currPlayers.indexOf(socket.username);
            if(playerIn > -1){
                currPlayers.splice(playerIn, 1);
                io.in(socket.room).emit("refreshPlayers", currPlayers);
                socket.leave(socket.room);
                socket.room = "/default";
            }
        }
    });

    socket.on('checkRoom', function(code){
        console.log(io.sockets.adapter.rooms[code]);
    })
});
