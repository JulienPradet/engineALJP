/**
 * Module de gestion de joueur
 */

/* Gamer */

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





/* GamerManager */

engineALJP.GamerManager = function(gamers, gamerView) {
    var _this = this;

    (function() {
        _this.initialized = false;
        _this.gamers = gamers;
        _this.gamerView = gamerView;
    })();
};

engineALJP.GamerManager.prototype.init = function(gamers) {
    this.initialized = true;

    for (var i=0; i<gamers.length; ++i) {
        var gamer = gamers[i];

        if (typeof gamer === 'undefined' || gamer == null)  {
            continue;
        }

        treeGame.gamerManager.addGamer(gamer);
    }
};

engineALJP.GamerManager.prototype.draw = function(ctx, offsetX, offsetY) {
    if (!this.initialized)
        return;

    for(var id in this.gamers) {
        if(typeof this.gamers[id] !== "undefined") {
            this.gamers[id].draw(ctx, offsetX, offsetY);
        }
    }
};

engineALJP.GamerManager.prototype.addGamer = function(gamer) {
    if (!this.initialized)
        return;

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
    if (!this.initialized)
        return;

    if(typeof this.gamers[id] !== "undefined") {
        delete this.gamers[id];
    }
};

engineALJP.GamerManager.prototype.update = function(id, position) {
    if (!this.initialized)
        return;

    this.gamers[id].setPosition(position);
};





/* GamerView */

engineALJP.GamerView = function() {
    var _this = this;

    (function() {
        _this.initialized = false;
        _this.mainGamer = document.getElementById('mainGamer');
        _this.listGamers = document.getElementById('listGamers');
    })();
};

engineALJP.GamerView.prototype.init = function(id) {
    this.initialized = true;

    this.mainGamer.style.color = treeGame.gamerManager.gamers[id].char.color;
    this.mainGamer.innerHTML = treeGame.gamerManager.gamers[id].nickname;

    for (var i=0; i<treeGame.gamerManager.gamers.length; ++i) {
        if (typeof treeGame.gamerManager.gamers[i] === 'undefined' || treeGame.gamerManager.gamers[i] == null)
            continue;

        var gamer = treeGame.gamerManager.gamers[i];
        if (gamer.id == treeGame.mainId)
            continue;

        this.addGamer(gamer);
    }
};

engineALJP.GamerView.prototype.addGamer = function(gamer) {
    if (!this.initialized)
        return;

    var gamerListed = document.createElement("li");
    gamerListed.style.color = gamer.char.color;
    gamerListed.innerHTML = gamer.nickname;

    var gamerListedAtt = document.createAttribute("data-gamer-id");
    gamerListedAtt.value = gamer.id;
    gamerListed.setAttributeNode(gamerListedAtt);

    this.listGamers.appendChild(gamerListed);
};

engineALJP.GamerView.prototype.deleteGamer = function(id) {
    if (!this.initialized)
        return;

    var gamers = this.listGamers.children;
    for (var i=0; i<gamers.length; ++i) {
        var gamer = gamers[i];
        var gamerId = gamer.getAttribute("data-gamer-id");

        if (gamerId == id) {
            gamer.remove();
        }
    }
};