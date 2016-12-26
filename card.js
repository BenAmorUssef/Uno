//ID ,Couleur, type, signe
function Card(cardID) {
	this.id = cardID;
	this.color = "";
	this.type = "";
	this.signe = "";
};

Card.prototype.setColor = function(color) {
	this.color = color;
};

Card.prototype.getColor = function() {
	return this.color;
};

Card.prototype.getID = function() {
	return this.id;
};
//Spetial or not (numbers are not spetial) they give you the chance to change the color.
Card.prototype.setType = function(type) {
	this.type = type;
};

Card.prototype.getType = function() {
	return this.type;
};

Card.prototype.setSigne = function(signe) {
	this.type = signe;
};
// Num , +2 , INV, BLOCK : Card value
Card.prototype.getSigne = function() {
	return this.signe;
};
Card.prototype.toString = function() {
	return this.id.toString();
};

module.exports = Card;