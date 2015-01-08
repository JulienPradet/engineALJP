/**
 * Fabrique de joueurs sur le serveur
 */

var charFactory = require('./charFactory.js');

var Gamer = function(id) {
    var _this = this;

    (function() {
        _this.id = id;
        _this.nickname = "Guest"+(Math.floor(Math.random()*1000));
        _this.lastMove = new Date();
        _this.char = new charFactory.Character(id, 0, 0);
    })();
};

module.exports = {
        Gamer: Gamer
};
