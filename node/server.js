/* Création de l'ensemble des objets communs à un serveur
* Il y a donc les characters, la map et la weaponery
* */

var mapFactory = require('./mapFactory.js'),
    weaponsFactory = require('./weaponsFactory.js'),
    charFactory = require('./charFactory.js'),
    io;

/* Gestion de la socket qui écoute les changements de position de l'utilisateur */
var ActionManager = function() {
    var _this = this;

    (function() {
        _this.positionChanged = false;
        _this.newPositions = [];
        _this.increments = {};

        _this.actionToIncrement = {
            "left": function(_this, time_diff) {
                _this.increments.velocity_x = -1;
                return true;
            },
            "right": function(_this, time_diff) {
                _this.increments.velocity_x = 1;
                return true;
            },
            "top": function(_this, time_diff) {
                _this.increments.velocity_y = -1;
                return true;
            },
            "down": function(_this, time_diff) {
                _this.increments.velocity_y = 1;
                return true;
            },
            "static": function(_this, time_diff) {
                _this.increments.velocity_x = 0;
                return false;
            },
            "physicMove": function(_this, time_diff) {
                _this.increments.pos_x = _this.increments.pos_x + _this.increments.velocity_x * time_diff / 1000 * 60;
                _this.increments.pos_y = _this.increments.pos_y + _this.increments.velocity_y * time_diff / 1000 * 60;
            },
            "init": function(_this, time_diff) {
                _this.increments.velocity_x = 0;
                _this.increments.velocity_y = 0;
            },
            "action": function(_this, time_diff) {
                // On tire
                weaponery.fire(
                    _this.increments.pos_x + 8,
                    _this.increments.character.pos_y + 8,
                    {
                        x: _this.increments.velocity_x,
                        y: _this.increments.velocity_y
                    }
                );
            }
        };
    })();
};

ActionManager.prototype.getIncrements = function(id, actions, time_diff) {
    this.positionChanged = false;
    /* On les calcule pour un jeu de plateforme */
    var useStep = false,
        i, action;
    this.actionToIncrement.init(this, time_diff);
    for(i in actions) {
        action = actions[i];
        if(action.ongoing) {
            useStep = this.actionToIncrement[action.type](this, time_diff) || useStep;
        }
    }

    if(useStep) {
        this.actionToIncrement.physicMove(this, time_diff);
        this.positionChanged = true;

        if(this.positionChanged) {
            this.newPositions.push({
                'type': 'char',
                'id': id,
                'position': {
                    'pos_x': this.increments.pos_x,
                    'pos_y': this.increments.pos_y
                }
            });
        }
    } else {
        this.actionToIncrement.static(this, time_diff);
    }

    return useStep;
};

ActionManager.prototype.updateGamer = function(id, actions, lastMove, character) {
    this.increments = character.getPosition();

    var timestamp = new Date(),
        time_diff = timestamp - lastMove;

    /* Déplacement du personnage */
    this.getIncrements(id, actions, time_diff);

    return {
        position: this.increments,
        lastMove: timestamp
    };
};

var BroadcastManager = function() {
    var _this = this;
};

BroadcastManager.prototype.move = function(positionChanged, newPositions) {
    if(positionChanged) {
        io.emit('newPositions', newPositions);
    }
};


var Game = function() {
    var _this = this;

    (function() {
        /* Gestion de la map */
        _this.map = new mapFactory.Map(0, 0, 0, [], []);

        /* Ajout de blocs pour les tests */
        for(var i = 0; i < 400 / 16; ++i) {
            _this.map.addFixedBlocs(i, 14, new mapFactory.Bloc({x: i*16, y: 14*16, angle: 0}));
            _this.map.addFixedBlocs(i, 0, new mapFactory.Bloc({x: i*16, y: 0*16, angle: 0}));
//            _this.map.addFixedBlocs(i, 9, new engineALJP.map.Bloc({x: i*16, y: 9*16, angle: 0}));

            _this.map.addFixedBlocs(0, i, new mapFactory.Bloc({x: 0*16, y: i*16, angle: 0}));
            _this.map.addFixedBlocs(24, i, new mapFactory.Bloc({x: 24*16, y: i*16, angle: 0}));
        }

        /* Gestion des armes */
        _this.weaponery = new weaponsFactory.WeaponeryManager();
        _this.weaponery.addWeapon(new weaponsFactory.Weapon(4, 4, 2, 100));

        /* Gestion des joueurs */
        _this.gamers = [];
    })();
};

Game.prototype.init = function() {
    this.broadcast = new BroadcastManager();
    this.actionManager = new ActionManager();
};

Game.prototype.close = function() {

};

Game.prototype.update = function() {
    var _this = this;
    setInterval(function() {
        _this.broadcast.move(_this.actionManager.positionChanged, _this.actionManager.newPositions);
    }, 1000/60);

    io.on('connection', function(socket){
        /* On crée le personnage */
        var gamer = _this.addGamer();
        socket.emit('id', gamer.id);

        /* On ecoute les actions de l'utilisateur */
        socket.on('action', function(charActions) {
            var increments = _this.actionManager.updateGamer(
                charActions.id,
                charActions.actions,
                _this.gamers[charActions.id].lastMove,
                _this.gamers[charActions.id].char
            );
            _this.gamers[charActions.id].char.update(increments.position);
            _this.gamers[charActions.id].lastMove = increments.lastMove;
        });

        /* On gère la déconnexion */
        socket.on('disconnect', function() {

        });
    });
};

Game.prototype.addGamer = function() {
    var gamer = new Gamer(this.gamers.length);
    this.gamers.push(gamer);
    return gamer;
};

var Gamer = function(id) {
    var _this = this;

    (function() {
        _this.id = id;
        _this.nickname = "Guest"+(Math.floor(Math.random()*1000));
        _this.lastMove = new Date();
        _this.char = new charFactory.Character(id, 0, 0);
    })();
};

function initServer() {
    var game = new Game();
    game.init();
    game.update();

    return game;
}

module.exports = function(_io) {
    io = _io;

    return {
        initServer: initServer
    }
};