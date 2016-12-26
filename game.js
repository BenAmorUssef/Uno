var Utils = require("./utils.js");
var utils = new Utils();
//id, jeton, tableau de joueurs, passepas
var Card = require("./card.js");
var Player = require("./player.js");

function Game(gameID, num) {
    this.id = gameID;
    this.players = [];
    this.pack = this._shufflePack(this._createPack());
    this.heel = [];
    this.token = "";
    this.passStep = 0;
    this.status = "available";
    this.currentCardColor = "";
    this.playerLimit = num;
};
//Game id
Game.prototype.getID = function() {
        return this.id;
    }
    //game start point
    /**
     *
     * @function {[startGame]} the start point of the game
     * @param  {[socket io object]} io
     * @return {[void]}
     */
Game.prototype.startGame = function(io) {
        //this.packToString();
        this.setStatus("in game");
        this.drawInitialCards(io);
        //this.getCurrentPlayersHand(io);
        this.heel.push(this.playFirstCardToTable(this.pack, io));
        this.heelToString();
        for (var i = 0; i < this.players.length; i++) {
            this.playCard(this.players[i].hand, 0, 2, this.heel, false);
        }

        //this.getCurrentPlayersHand(io);
        //this.heelToString();
        //this.packToString();
    }
    //plays a card with specific index, from specific hand, and places the card on the table
    //draw one card from the pack of cards, initial T|F appends cards in hand
Game.prototype.playCard = function(hand, index, amount, heel, initial) {
        var cards = [];
        cards = hand.slice(index, amount);
        hand.splice(index, amount);
        if (!initial) {
            heel.push.apply(heel, cards);
        }
        return cards;
    }
    //draw one card from the pack of cards, initial T|F appends cards in hand
Game.prototype.drawCard = function(pack, amount, hand, initial) {
        var cards = [];
        cards = pack.slice(0, amount);
        pack.splice(0, amount);
        if (!initial) {
            hand.push.apply(hand, cards);
        }
        return cards;
    }
    //at the start of the game, we put one card to the table from the pack (top card of the deck)
Game.prototype.playFirstCardToTable = function(pack, io) {
        var c = pack.splice(0, 1);
        io.sockets.emit("logging", {
            First_Card_On_Heel: c.toString()
        });
        return c;
    }
    //returns the last card on the table
Game.prototype.lastCardOnTable = function(heel) {
        return utils.last(heel);
        /*Game.prototype.packToString = function () {
            console.log("Game : " + this.id + " .\n");
            if (this.pack.length > 0) {
                console.log("Pack : " + this.pack.length + " .\n");
                console.log(this.pack);
            }
            else {
                console.log("Empty pack.\n");
            }
        };
        */
    }
    //game initial settings
Game.prototype.drawInitialCards = function(io) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].hand.length == 0) {
            this.drawCard(this.pack, 7, this.players[i].hand, false);
        }
        io.to(this.players[i].getID()).emit('initial-cards', {
            Draw_Initial_Cards: this.players[i].handToString()
        });

    }
}

//game pack and heel methods
Game.prototype._createPack = function() {
    var colors = ["R", "Y", "G", "B"];
    var pack = [];
    var n = 108; //Total number of cards
    var index = 10; //numbers [0 .. 9]
    //Fill pack with card with numbers.
    for (var i = 0; i < 4; i++) {
        var card = new Card(colors[i] + '-block-1', i, false, 'block');
        pack.push(card);
        card = new Card(colors[i] + '-reverse-1', i, false, 'reverse');
        pack.push(card);
        card = new Card(colors[i] + '-plus2-1', i, false, 'plus2');
        pack.push(card);
        card = new Card(colors[i] + '-block-2', i, false, 'block');
        pack.push(card);
        card = new Card(colors[i] + '-reverse-2', i, false, 'reverse');
        pack.push(card);
        card = new Card(colors[i] + '-plus2-2', i, false, 'plus2');
        pack.push(card);
        card = new Card('multi-color', '-', true, 'multi-color');
        pack.push(card);
        card = new Card('plus4', '-', true, 'plus4');
        pack.push(card);
        for (var j = 0; j < index; j++) {
            card = new Card('' + colors[i] + j + '-1', i, false, j);
            pack.push(card);
            // Card number zero one time others two times
            if (j != 0) {
                card = new Card('' + colors[i] + j + '-2', i, false, j);
                pack.push(card);
            }
        }
    }
    return pack;
};
//shuffles the pack - based on the Fisher-Yates algorithm
Game.prototype._shufflePack = function(pack) {
    var i = pack.length,
        j, tempi, tempj;
    if (i === 0) return false;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        tempi = pack[i];
        tempj = pack[j];
        pack[i] = tempj;
        pack[j] = tempi;
    }
    return pack;
}
Game.prototype.heelToString = function() {
    var s = "";
    if (this.heel.length > 0) {
        this.heel.forEach(function(card) {
            s += card.toString() + "  ";
        });
        console.log("Heel (" + this.heel.length + " cards) : " + s + "\n");
    } else {
        console.log("Empty heel.\n");
    }
};
Game.prototype.packToString = function() {
    var s = "";
    var i = 0;
    if (this.pack.length > 0) {
        this.pack.forEach(function(card) {
            i = i + 1;
            s += i + " - " + card.toString() + "\n";
        });
        console.log("Pack (" + this.pack.length + " cards) : " + s + "\n");
    } else {
        console.log("Empty heel.\n");
    }
};

//game players methods
Game.prototype.getNumPlayer = function() {
    return this.players.length;
};
Game.prototype.getPlayerLimit = function() {
    return this.playerLimit;
};
Game.prototype.setPlayersLimit = function(limit) {
    this.playerLimit = limit;
};
Game.prototype.getPlayer = function(playerId) {
    var player = null;
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].id == playerId) {
            player = this.players[i];
            break;
        }
    }
    return player;
};
Game.prototype.getPlayersId = function() {
    var player = [];
    this.players.some(function(p) {
        player.push(p.getID());
    });
    return player;
};
Game.prototype.getPlayersName = function() {
    var player = [];
    for (var i = 0; i < this.players.length; i++) {
        player[i] = this.players[i].getName();
    }
    return player;
};

Game.prototype.isPlayerInGame = function(player_id) {
    var found = "";
    for (var i = 0; i < this.players.length; i++) {
        if (player_id == this.players[i].getID()) {
            found = this.getID();
        }
    }
    return found;
};


Game.prototype.addPlayer = function(player) {
    if (this.status === "available") {
        var found = false;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].id == player.id) {
                found = true;
                break;
            }
        }
        if (!found) {
            this.players[this.players.length] = player;
            if (this.players.length == this.playerLimit) {
                //this.status = "playing";
                for (var i = 0; i < this.players.length; i++) {
                    this.players[i].status = "intable";
                }
            }
            return true;
        }
    }
    return false;
};
Game.prototype.removePlayer = function(player) {
    var index = -1;
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].getID() === player.getID()) {
            index = i;
            break;
        }
    }
    if (index != -1) {
        this.heel.push.apply(this.heel, this.players[index].hand);
        this.players.splice(index, 1);
        //this.players.remove(index);
        this.setStatus("available");
    }
};
Game.prototype.getCurrentPlayersHand = function(io) {
    for (var i = 0; i < this.players.length; i++) {
        io.sockets.emit("logging", {
            message: this.players[i].getName() + " Cards \n " + this.players[i].handToString()
        });
    }
}

//game status methods
Game.prototype.setStatus = function(status) {
    this.status = status;
};
Game.prototype.isGameAvailable = function() {
    if ((this.getPlayerLimit() > this.getNumPlayer()) && (this.status === "available")) {
        return true;
    } else {
        return false;
    }
};

Game.prototype.isGameReady = function() {
    if ((this.getPlayerLimit() == this.getNumPlayer()) && (this.status === "available")) {
        return true;
    } else {
        return false;
    }
};
Game.prototype.isFull = function() {
    return this.status === "full";
};
Game.prototype.isPlaying = function() {
    return this.status === "playing";
};

//players win the game or not
Game.prototype.isWinning = function(hand) {
    if (hand.length == 0) {
        return true;
    } else {
        return false;
    }
}

module.exports = Game;
