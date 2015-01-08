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
        _this.ongoing = false;

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
                increments.velocity_y = 0;
                increments.hasChanged = false;
                return increments;
            },
            "physicMove": function(_this, time_diff, increments) {
                increments.pos_x = increments.pos_x + increments.velocity_x * time_diff / 1000 * 60;
                increments.pos_y = increments.pos_y + increments.velocity_y * time_diff / 1000 * 60;
                increments.hasChanged = true;
                return increments;
            },
            "init": function(_this, time_diff, increments) {
                increments.velocity_x = 0;
                increments.velocity_y = 0;
                increments.hasChanged = false;
                return increments
            },
            "action": function(_this, time_diff, increments) {
                // On tire
                _this.weaponery.fire(
                    increments.pos_x + 8,
                    increments.pos_y + 8,
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
        var _this = this,
            start;

        function step(timestamp) {
            console.log("new step!");

            if(typeof start === "undefined")
                start = new Date();

            var positionChanged = false,
                newPositions = [];

            /* Mise a jour des personnages */
            var id, gamer;
            for(id in _this.gamersToUpdate) {
                gamer = _this.gamersToUpdate[id];
                var increments = _this.updateGamer(id);
                if(increments.hasChanged) {
                    positionChanged = true;
                    newPositions.push({
                        type: 'char',
                        id: id,
                        lastMove: timestamp,
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
            var time_diff = timestamp - start;
            positionChanged = _this.weaponery.update(time_diff) || positionChanged;

//            var bloc, bulletsToSend = [];
//            for(id in _this.weaponery.bullets) {
//                bloc = _this.weaponery.bullets[id];
//                bulletsToSend.push({
//                    type: 'bullet',
//                    bloc: {
//                        pos_x: bloc.x,
//                        pos_y: bloc.y,
//                        height: bloc.height,
//                        width: bloc.width,
//                        color: bloc.color
//                    }
//                });
//            }
            start = timestamp;

            /* On fait affiche l'ensemble des modifs au sommet */
            _this.positionChanged = positionChanged;
            _this.newPositions = newPositions;

            if(positionChanged) {
                setTimeout(function() {
                    step(new Date());
                }, Math.max(0, 1000/60 - time_diff));
            } else {
                _this.ongoing = false;
            }
        }

        this.ongoing = true;
        step(new Date());
    }
};

var BroadcastManager = function() {};

BroadcastManager.prototype.move = function(newPositions) {
    /* On le dit à l'ensemble des personnes connectées */
    io.emit('newPositions', newPositions);
};

BroadcastManager.prototype.addGamer = function(gamer) {
    io.emit('addGamer', gamer);
};

BroadcastManager.prototype.deleteGamer = function(id) {
    io.emit('deleteGamer', id);
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

    /* Toutes les 60ms on envoie les positions */
    setInterval(function() {
        if(_this.actionManager.positionChanged) {
            _this.broadcast.move(_this.actionManager.newPositions);

//            Mettre a jour la position de l'ensemble des positions coté modele du serveur
//            _this.gamerManager.updatePositions(_this.actionManager.newPositions);

            var id, gamer;
            for(id in _this.actionManager.newPositions) {
                var change = _this.actionManager.newPositions[id];
                if(change.type === 'char') {
                    _this.gamers[change.id].pos_x = change.position.pos_x;
                    _this.gamers[change.id].pos_y = change.position.pos_y;
                    _this.gamers[change.id].lastMove = change.lastMove;
                }
            }
        }
    }, 1000/60);

    io.on('connection', function(socket){
        /* On envoie le tableau des joueurs pré-existants au nouveau connecté */
        socket.emit('gamers', _this.gamers);
        /* On crée le joueur et on prévient tout le monde */
        var gamer = _this.addGamer();
        _this.broadcast.addGamer(gamer);
        /* On dit au nouveau connecté quel joueur il est */
        socket.emit('id', gamer.id);

        /* On écoute les actions de l'utilisateur */
        socket.on('action', function(charActions) {
            console.log("idmove"+charActions.id);
            _this.actionManager.setGamerToUpdate(
                charActions.id,
                charActions.actions,
                _this.gamers[charActions.id].lastMove,
                _this.gamers[charActions.id].char
            );
            _this.actionManager.update();
        });

        /* On gère la déconnexion */
        socket.on('disconnect', function() {
            /* On supprime le joueur et on prévient tout le monde */
            _this.deleteGamer(gamer.id);
            _this.broadcast.deleteGamer(gamer.id);
        });
    });
};

Game.prototype.addGamer = function() {
    console.log("gamers"+this.gamers);
    console.log("length"+this.gamers.length);
    var gamer = new gamerFactory.Gamer(this.gamers.length);
    this.gamers.push(gamer);
    console.log("id"+gamer.id);
    return gamer;
};

Game.prototype.deleteGamer = function(id) {
    delete this.gamers[id];
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