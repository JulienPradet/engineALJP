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

engineALJP.Gamer.GamerManager = function(gamers, gamerView) {
    var _this = this;

    (function() {
        _this.initialized = false;
        _this.gamers = gamers;
        _this.gamerView = gamerView;
    })();
};

engineALJP.Gamer.GamerManager.prototype.init = function(gamers) {
    this.initialized = true;

    for (var i=0; i<gamers.length; ++i) {
        var gamer = gamers[i];

        if (typeof gamer === 'undefined' || gamer == null)  {
            continue;
        }

        treeGame.gamerManager.addGamer(gamer);
    }
};

engineALJP.Gamer.GamerManager.prototype.draw = function(ctx, offsetX, offsetY) {
    if (!this.initialized)
        return;

    for(var id in this.gamers) {
        if(typeof this.gamers[id] !== "undefined") {
            this.gamers[id].draw(ctx, offsetX, offsetY);
        }
    }
};

engineALJP.Gamer.GamerManager.prototype.addGamer = function(gamer) {
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

    treeGame.gamerManager.gamerView.addGamer(gamer);
};

engineALJP.Gamer.GamerManager.prototype.deleteGamer = function(id) {
    if (!this.initialized)
        return;

    if(typeof this.gamers[id] !== "undefined") {
        delete this.gamers[id];
    }

    treeGame.gamerManager.gamerView.deleteGamer(id);
};

engineALJP.Gamer.GamerManager.prototype.update = function(id, position) {
    if (!this.initialized)
        return;

    this.gamers[id].setPosition(position);
};

engineALJP.Gamer.GamerManager.prototype.setGamerNickname = function(id, newNickname) {
    treeGame.gamerManager.gamers[id].nickname = newNickname;
    treeGame.gamerManager.gamerView.setGamerNickname(id, newNickname);
};





/* GamerView */

engineALJP.Gamer.GamerView = function() {
    var _this = this;

    (function() {
        _this.initialized = false;
        _this.mainGamer = document.getElementById('mainGamer');
        _this.listGamers = document.getElementById('listGamers');
        _this.newNickname = document.changeNickname.newNickname;
        _this.newNicknameButton = document.changeNickname.button;
    })();
};

engineALJP.Gamer.GamerView.prototype.init = function() {
    this.initialized = true;

    this.mainGamer.style.color = treeGame.gamerManager.gamers[treeGame.mainId].char.color;
    this.mainGamer.innerHTML = treeGame.gamerManager.gamers[treeGame.mainId].nickname;

    var _this = this;
    document.getElementById('changeNicknameForm').addEventListener("submit", function(evt) {
        evt.preventDefault();

        var newNickname = _this.newNickname.value;

        if (typeof newNickname === 'undefined' || newNickname == '' || newNickname.length > 20)
            return;

        _this.mainGamer.innerHTML = newNickname;
        engineALJP.socket.emit('nickname', newNickname);
    });

    for (var i=0; i<treeGame.gamerManager.gamers.length; ++i) {
        if (typeof treeGame.gamerManager.gamers[i] === 'undefined' || treeGame.gamerManager.gamers[i] == null)
            continue;

        var gamer = treeGame.gamerManager.gamers[i];
        if (gamer.id == treeGame.mainId)
            continue;

        this.addGamer(gamer);
    }
};

engineALJP.Gamer.GamerView.prototype.addGamer = function(gamer) {
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

engineALJP.Gamer.GamerView.prototype.deleteGamer = function(id) {
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

engineALJP.Gamer.GamerView.prototype.setGamerNickname = function(id, newNickname) {
    if (!this.initialized)
        return;

    var gamers = this.listGamers.children;
    for (var i=0; i<gamers.length; ++i) {
        var gamer = gamers[i];
        var gamerId = gamer.getAttribute("data-gamer-id");

        if (gamerId == id) {
            gamer.innerHTML = newNickname;
        }
    }
};