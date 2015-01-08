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

engineALJP.Gamer.prototype.setPosition = function(position) {
    this.char.setPosition(position);
};

engineALJP.Gamer.prototype.draw = function(ctx, offsetX, offsetY) {
    this.char.draw(ctx, offsetX, offsetY);
};

engineALJP.GamerManager = function(gamers) {
    var _this = this;

    (function() {
        _this.gamers = gamers;
    })();
};

engineALJP.GamerManager.prototype.draw = function(ctx, offsetX, offsetY) {
    for(var id in this.gamers) {
        if(typeof this.gamers[id] !== "undefined") {
            this.gamers[id].draw(ctx, offsetX, offsetY);
        }
    }
};

engineALJP.GamerManager.prototype.addGamer = function(gamer) {
    if(gamer instanceof engineALJP.Gamer) {
        this.gamers[gamer.id] = gamer;
    } else {
        this.gamers[gamer.id] = new engineALJP.Gamer(
            gamer.id,
            gamer.nickname,
            gamer.lastMove,
            new engineALJP.char.Character(
                gamer.id,
                gamer.char.pos_x,
                gamer.char.pos_y,
                gamer.char.color
            )
        );
    }
};

engineALJP.GamerManager.prototype.deleteGamer = function(id) {
    if(typeof this.gamers[id] !== "undefined") {
        delete this.gamers[id];
    }
};

engineALJP.GamerManager.prototype.update = function(id, position) {
    this.gamers[id].setPosition(position);
};