function Player(playerID, name) {
	this.id = playerID;
	this.name = name;
	this.tableID = "";
	this.hand = [];
	this.status = "";
	this.turnFinished = "";
};


Player.prototype.getID = function() {
	return this.id;
};

Player.prototype.setName = function(name) {
	this.name = name;
};

Player.prototype.getName = function() {
	return this.name;
};

Player.prototype.setTableID = function(tableID) {
	this.tableID = tableID;
};

Player.prototype.getTableID = function() {
	return this.tableID;
};

Player.prototype.setHand = function(cards) {
	this.hand.push(cards);
};

Player.prototype.spliceFromHand = function(index, amount) {
	var cards = [];
    cards = this.hand.slice(index, amount);
    this.hand.splice(index,amount);
    return cards;
};

Player.prototype.getHand = function() {
	return this.hand;
};

Player.prototype.handToString = function() {
    var s = "";
    this.hand.forEach(function (card) {
        s += card.toString()+",";
    });
    console.log(this.name +" ("+this.hand.length+" cards) : " + s);
	s = s.substring(0, s.length-1);
    return s;
};

Player.prototype.setStatus = function(status){
	this.status = status;
};

Player.prototype.isAvailable = function(){
	return this.status === "available";
};

Player.prototype.isInTable = function(){
	return this.status === "intable";
};

Player.prototype.isPlaying = function(){
	return this.status === "playing";
};

module.exports = Player;
