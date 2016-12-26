var socket = require('socket.io');
var Game = require('./game.js');
var Player = require("./player.js");
var Messaging = require('./messaging.js');

var firstRound = 1;
//setup an Express server to serve the content
var http = require("http");
var express = require("express");
var app = express();
var server = http.createServer(app);
var port = 3000;
server.listen(port);
var io = socket.listen(server);
var games = new Array();
var gamesCounter;
app.use("/", express.static(__dirname + "/"));
app.use("/resources", express.static(__dirname + "/resources"));
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});


var sem = require('semaphore')(1);

var messaging = new Messaging();

console.log("Uno Server listening on port : " + port);

//starting the socket and awaiting connections
io.sockets.on('connection', function(socket) {
    /*
    When a player connects to the server,  we immediately create the player object.
      - the Player's name comes from frontend.
      - the player ID is the socket.ID
      - every player by default will be added to a Game ("lounge")
    Message is shown in the logging board
    */
    socket.on('connectToServer', function(data) {
        //Semaphore 
        sem.take(function() {
            var m_player = new Player(socket.id, data.name);
            var numOfPlayer = data.numplayer;
            var agid = availableGame(numOfPlayer);
            console.log("New Connection from : " + m_player.getName());
            if (agid === "") {
                games.push(new Game(games.length, numOfPlayer));
                //wait until the new player enter the number of players in the same game
                var currentGameId = games.length - 1;

                games[currentGameId].addPlayer(m_player);
                console.log(currentGameId + "•" + games[currentGameId].getPlayersName());
                startGameIfAllSet(currentGameId);
            } else {
                if (games[agid] != null) {
                    games[agid].addPlayer(m_player);
                    console.log(agid + "\n" + games[agid].getPlayersName());
                    startGameIfAllSet(agid);
                } else {
                    console.log("Backend (socket on ConnectToServer) : games n° " + agid + " undefined.");
                }
            }
            sem.leave();
        });
    });
    socket.on("disconnect", function() {
        var gameid = searchPlayerInGames(socket.id);
        if (games[gameid] != null) {
            var player = games[gameid].getPlayer(socket.id);
            if (player) { //make sure that player either exists or if player was in table (we don't want to remove players)
                games[gameid].removePlayer(player);
                console.log("Player : " + player.getName() + " disconnected from Game " + gameid + ".");
                games[gameid].heelToString();
                messaging.sendEventToAllPlayersButPlayer("player-out",
                                                         "Player " + player.getName() + " has quit the game.",
                                                         io,
                                                         games[gameid].getPlayersId(),
                                                         player);

            }
        } else {
            console.log("Player : " + socket.id + " disconnected.");
        }
    });
    socket.on('end', function() {
        console.log("Backend : " + socket.name + " disconnected.");
    });
});

function availableGame(numOfPlayer) {
    var availableGameId = "";
    if (games != null) {
        games.some(function(game) {
            if (game.getPlayerLimit() === numOfPlayer && game.isGameAvailable()) {
                availableGameId = game.getID();
                console.log("Game with id " + availableGameId + " is available (" + game.getPlayerLimit() + " players).");
                return availableGameId;
            }
        });
    }
    return availableGameId;
};

function startGameIfAllSet(index) {

    //add to game -- all players go to a game first
    if (typeof games[index] !== "undefined") {
        if (games[index].isGameReady()) {
            //lancer partie
            var title, message;
            title = "start-game";
            message = "Game " + index + " has been started";
            messaging.sendEventToAllPlayers(title, message, io, games[index].getPlayersId());
            games[index].startGame(io);
        }
    } else {
        console.log("Backend (Start Game If All Set) : games n° " + index + " undefined.");
    }
}

function searchPlayerInGames(player_id) {
    var gid = "";
    if (games != null) {
        games.some(function(game) {
            gid = game.isPlayerInGame(player_id);
            if (gid != null) {
                console.log("Player " + player_id + " is the " + gid + " th game");
                return gid;
            }
        });
    }
    return gid;
}
