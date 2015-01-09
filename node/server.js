/* Création de l'ensemble des objets communs à un serveur
* Il y a donc les characters, la map et la weaponery
* */

var mapFactory = require('./mapFactory.js'),
    weaponsFactory = require('./weaponsFactory.js'),
    charFactory = require('./charFactory.js'),
    gamerFactory = require('./gamerFactory.js'),
    io;


/* ActionManager */

/* Gestion de la socket qui écoute les changements de position de l'utilisateur */
var ActionManager = function(weaponery) {
    var _this = this;

    (function() {
        _this.gamersToUpdate = {};
        _this.weaponery = weaponery;
        _this.positionChanged = false;
        _this.newPositions = [];
        _this.ongoing = false;

        _this.actionToIncrement = {
            "left": function(gamer, time_diff, increments) {
                increments.velocity_x = -1;
                increments.hasChanged = true;
                return increments;
            },
            "right": function(gamer, time_diff, increments) {
                increments.velocity_x = 1;
                increments.hasChanged = true;
                return increments;
            },
            "top": function(gamer, time_diff, increments) {
                increments.velocity_y = -1;
                increments.hasChanged = true;
                return increments;
            },
            "down": function(gamer, time_diff, increments) {
                increments.velocity_y = 1;
                increments.hasChanged = true;
                return increments;
            },
            "static": function(gamer, time_diff, increments) {
                increments.velocity_x = 0;
                increments.velocity_y = 0;
                increments.hasChanged = false;
                return increments;
            },
            "physicMove": function(gamer, time_diff, increments) {
                increments.pos_x = increments.pos_x + increments.velocity_x * time_diff / 1000 * 60;
                increments.pos_y = increments.pos_y + increments.velocity_y * time_diff / 1000 * 60;
                increments.hasChanged = true;
                return increments;
            },
            "init": function(gamer, time_diff, increments) {
                increments.velocity_x = 0;
                increments.velocity_y = 0;
                increments.hasChanged = false;
                increments.hasFired = false
                return increments
            },
            "action": function(gamer, time_diff, increments) {
                // On tire
                increments.hasFired = _this.weaponery.fire(
                    gamer.lastFire,
                    increments.pos_x + 6,
                    increments.pos_y + 6,
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
    var i, action;

    increments = this.actionToIncrement.init(this.gamersToUpdate[id], time_diff, increments);

    for(i in actions) {
        action = actions[i];
        if(action.ongoing) {
            increments = this.actionToIncrement[action.type](this.gamersToUpdate[id], time_diff, increments);
        }
    }

    if(increments.hasChanged) {
        increments = this.actionToIncrement.physicMove(this.gamersToUpdate[id], time_diff, increments);
    } else {
        increments = this.actionToIncrement.static(this.gamersToUpdate[id], time_diff, increments);
    }

    return increments;
};

ActionManager.prototype.updateGamer = function(id) {
    var increments = this.gamersToUpdate[id].character.getPosition();

    var timestamp = new Date(),
        time_diff = timestamp - this.gamersToUpdate[id].lastMove;
    this.gamersToUpdate[id].lastMove = timestamp;

    /* Déplacement du personnage */
    return this.getIncrements(id, this.gamersToUpdate[id].actions, time_diff, increments);
};

/* Définition de joueur à mettre a jour*/
ActionManager.prototype.setGamerToUpdate = function(id, actions, character) {
    var lastMove = new Date();
    if(typeof this.gamersToUpdate[id] !== "undefined") {
        if(new Date() - this.gamersToUpdate[id].lastMove > 1000/60) {
            lastMove = this.gamersToUpdate[id].lastMove;
        } else {
            lastMove = new Date() - 1000/60;
        }
    }
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
        this.ongoing = true;

        /* Etape d'update */
        var _this = this,
            start = new Date();

        function step(timestamp) {
            if(typeof start === "undefined")
                start = new Date();

            var time_diff = timestamp - start;
            start = timestamp;

            var positionChanged = false,
                newPositions = [];

            /* Mise a jour des personnages */
            var id, gamer;
            for(id in _this.gamersToUpdate) {
                gamer = _this.gamersToUpdate[id];
                var increments = _this.updateGamer(id);
                if(increments.hasChanged) {
                    positionChanged = true;
                    _this.gamersToUpdate[id].lastFire = (increments.hasFired ? new Date(): gamer.lastFire)
                    newPositions.push({
                        type: 'char',
                        id: id,
                        lastMove: timestamp,
                        lastFire: _this.gamersToUpdate[id].lastFire,
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
            positionChanged = _this.weaponery.update(time_diff) || positionChanged;

            var bloc;
            for(id in _this.weaponery.bullets) {
                bloc = _this.weaponery.bullets[id].bloc;
                newPositions.push({
                    type: 'bullet',
                    bloc: {
                        x: bloc.x,
                        y: bloc.y,
                        height: bloc.height,
                        width: bloc.width
                    }
                });
            }

            /* On fait affiche l'ensemble des modifs au sommet */
            _this.newPositions = newPositions;
            _this.positionChanged = positionChanged;

            if(positionChanged) {
                setTimeout(function() {
                    step(new Date());
                }, 1000 / 60);
            } else {
                _this.ongoing = false;
            }
        }

        step(new Date());
    }
};





/* GamerManager */

var GamerManager = function() {
    var _this = this;

    (function() {
        _this.gamers = [];
    })();
};

GamerManager.prototype.addGamer = function() {
    var gamer = new gamerFactory.Gamer(this.gamers.length);
    this.gamers.push(gamer);
    return gamer;
};

GamerManager.prototype.deleteGamer = function(id) {
    delete this.gamers[id];
};

GamerManager.prototype.updatePositions = function(newPositions) {
    for(var id in newPositions) {
        var change = newPositions[id];
        if(change.type === 'char') {
            this.gamers[change.id].setPosition(change.position);
            this.gamers[change.id].lastMove = change.lastMove;
            this.gamers[change.id].lastFire = change.lastFire;
        }
    }
};





/* BroadcastManager */

var BroadcastManager = function() {};

BroadcastManager.prototype.move = function(newPositions) {
    io.emit('newPositions', {
        timestamp: new Date() - 0,
        newPositions: newPositions
    });
};

BroadcastManager.prototype.addGamer = function(gamer) {
    io.emit('addGamer', gamer);
};

BroadcastManager.prototype.deleteGamer = function(id) {
    io.emit('deleteGamer', id);
};





/* Game */

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
        _this.gamerManager = new GamerManager();
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

    /* Toutes les 60ms on envoie les positions */
    setInterval(function() {
        if(_this.actionManager.positionChanged) {
            _this.broadcast.move(_this.actionManager.newPositions);

            /* On met à jour la position de l'ensemble des positions coté modèle du serveur */
            _this.gamerManager.updatePositions(_this.actionManager.newPositions);

            _this.actionManager.positionChanged = false;
        }
    }, 1000/60);

    io.on('connection', function(socket){
        /* On envoie le tableau des joueurs pré-existants au nouveau connecté */
        socket.emit('gamers', _this.gamerManager.gamers);
        /* On crée le joueur et on prévient tout le monde */
        var gamer = _this.gamerManager.addGamer();
        _this.broadcast.addGamer(gamer);
        /* On dit au nouveau connecté quel joueur il est */
        socket.emit('id', gamer.id);

        /* On écoute les actions de l'utilisateur */
        socket.on('action', function(charActions) {
            _this.actionManager.setGamerToUpdate(
                charActions.id,
                charActions.actions,
                _this.gamerManager.gamers[charActions.id].char
            );
            _this.actionManager.update();
        });

        /* On gère la déconnexion */
        socket.on('disconnect', function() {
            /* On supprime le joueur et on prévient tout le monde */
            _this.gamerManager.deleteGamer(gamer.id);
            _this.broadcast.deleteGamer(gamer.id);
        });
    });
};





/* Initialisation et export */

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