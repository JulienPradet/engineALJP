/* Création de l'ensemble des objets communs à un serveur
* Il y a donc les characters, la map et la weaponery
* */

var mapFactory = require('./mapFactory.js'),
    weaponsFactory = require('./weaponsFactory.js'),
    charFactory = require('./charFactory.js'),
    gamerFactory = require('./gamerFactory.js'),
    io;

/* Gestion de la socket qui écoute les changements de position de l'utilisateur */
var ActionManager = function(weaponery) {
    var _this = this;

    (function() {
        _this.gamersToUpdate = {};
        _this.weaponery = weaponery;
        _this.positionChanged = false;
        _this.newPositions = [];

        _this.actionToIncrement = {
            "left": function(_this, time_diff, increments) {
                increments.velocity_x = -1;
                increments.hasChanged = true;
                return increments;
            },
            "right": function(_this, time_diff, increments) {
                increments.velocity_x = 1;
                increments.hasChanged = true;
                return increments;
            },
            "top": function(_this, time_diff, increments) {
                increments.velocity_y = -1;
                increments.hasChanged = true;
                return increments;
            },
            "down": function(_this, time_diff, increments) {
                increments.velocity_y = 1;
                increments.hasChanged = true;
                return increments;
            },
            "static": function(_this, time_diff, increments) {
                increments.velocity_x = 0;
                increments.hasChanged = true;
                return increments;
            },
            "physicMove": function(_this, time_diff, increments) {
                increments.pos_x = increments.pos_x + increments.velocity_x * time_diff / 1000 * 60;
                increments.pos_y = increments.pos_y + increments.velocity_y * time_diff / 1000 * 60;
                increments.hasChanged = true;
            },
            "init": function(_this, time_diff, increments) {
                increments.velocity_x = 0;
                increments.velocity_y = 0;
                return increments
            },
            "action": function(_this, time_diff, increments) {
                // On tire
                this.weaponery.fire(
                    increments.pos_x + 8,
                    increments.character.pos_y + 8,
                    {
                        x: increments.velocity_x,
                        y: increments.velocity_y
                    }
                );
                increments.hasChanged = true;
                return increments
            }
        };
    })();
};

ActionManager.prototype.getIncrements = function(id, actions, time_diff, increments) {
    /* On les calcule pour un jeu de plateforme */
    var useStep = false,
        i, action;

    increments = this.actionToIncrement.init(this, time_diff, increments);

    for(i in actions) {
        action = actions[i];
        if(action.ongoing) {
            increments = this.actionToIncrement[action.type](this, time_diff, increments);
        }
    }

    if(increments.hasChanged) {
        increments = this.actionToIncrement.physicMove(this, time_diff, increments);
        this.newPositions.push({
            'type': 'char',
            'id': id,
            'position': {
                'pos_x': increments.pos_x,
                'pos_y': increments.pos_y
            }
        });
    } else {
        this.actionToIncrement.static(this, time_diff, increments);
    }

    return increments;
};

ActionManager.prototype.updateGamer = function(id) {
    var increments = this.gamersToUpdate[id].character.getPosition();

    var timestamp = new Date(),
        time_diff = timestamp - this.gamersToUpdate[id].lastMove;

    /* Déplacement du personnage */
    return this.getIncrements(id, this.gamersToUpdate[id].actions, time_diff, increments);
};

/* Définition de joueur à mettre a jour*/
ActionManager.prototype.setGamerToUpdate = function(id, actions, lastMove, character) {
    this.gamersToUpdate[id] = {
        id: id,
        actions: actions,
        lastMove: lastMove,
        character: character
    };
};

/* Fin de mise a jour de joueur */
ActionManager.prototype.removeGamerToUpdate = function(id) {
    if(typeof this.gamersToUpdate[id] !== "undefined") {
        delete this.gamersToUpdate[id];
    }
};

/* Mise a jour des positions en continu */
ActionManager.prototype.update = function() {
    if(this.ongoing !== true) {
        /* Etape d'update */
        var start,
            useStep = false,
            _this = this;

        function step(timestamp) {
            var positionChanged = false,
                newPositions = [];

            /* Mise a jour des personnages */
            var id, gamer;
            for(id in _this.gamersToUpdate) {
                gamer = _this.gamersToUpdate[id];
                var increments = this.updateGamer(id);
                if(increments.hasChanged) {
                    positionChanged = true;
                    newPositions.push({
                        type: 'char',
                        id: id,
                        position: {
                            pos_x: increments.pos_x,
                            pos_y: increments.pos_y
                        }
                    });
                } else {
                    _this.removeGamerToUpdate(id);
                }
            }

            /* Mise a jour des tirs */
//            for(id in )

            /* On fait affiche l'ensemble des modifs au sommet */
            this.positionChanged = positionChanged;
            this.newPositions = newPositions;
        }
    }
};

var BroadcastManager = function() {
    var _this = this;
};

BroadcastManager.prototype.move = function(positionChanged, newPositions) {
    if(positionChanged) {
        io.emit('newPositions', newPositions);
        positionChanged = false;
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
    this.actionManager = new ActionManager(this.weaponery);
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
    var gamer = new gamerFactory.Gamer(this.gamers.length);
    this.gamers.push(gamer);
    return gamer;
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