/**
 * Module de gestion de joueur
 */

engineALJP.Gamer = function(id, nickname, lastMove, char) {
    var _this = this;

    (function() {
        _this.id = id;
        _this.nickname = nickname;
        _this.lastMove = lastMove;
        _this.char = char;
    })();
};