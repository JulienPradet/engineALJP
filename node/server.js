/* Création de l'ensemble des objets communs à un serveur
* Il y a donc les characters, la map et la weaponery
* */

var mapFactory = require('./mapFactory.js'),
    weaponsFactory = require('./weaponsFactory.js'),
    charFactory = require('./charFactory.js'),
    gamerFactory = require('./gamerFactory.js'),
    rabbit = require('rabbit.js'),
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

GamerManager.prototype.addGamer = function(gamer) {
    if(typeof gamer === "undefined") {
        gamer = new gamerFactory.Gamer(this.gamers.length);
    } else if(!(gamer instanceof gamerFactory.Gamer)) {
        var _gamer = new gamerFactory.Gamer(gamer.id);
        _gamer.lastMove = gamer.lastMove;
        _gamer.nickname = gamer.nickname;
        _gamer.char.height = gamer.char.height;
        _gamer.char.width = gamer.char.width;
        _gamer.char.pos_x = gamer.char.pos_x;
        _gamer.char.pos_y = gamer.char.pos_y;
        _gamer.char.velocity_x = gamer.char.velocity_x;
        _gamer.char.velocity_y = gamer.char.velocity_y;
        _gamer.char.acceleration_x = gamer.char.acceleration_x;
        _gamer.char.acceleration_y = gamer.char.acceleration_y;
        _gamer.char.weight = gamer.char.weight;
        _gamer.char.color = gamer.char.color;

        gamer = _gamer;
    }
    console.log("addGamer:"+gamer.id);

    this.gamers[gamer.id] = gamer;
    return gamer;
};

GamerManager.prototype.deleteGamer = function(id) {
    delete this.gamers[id];
};

GamerManager.prototype.move = function(newPositions) {
    for(var id in newPositions) {
        var change = newPositions[id];
        if(change.type === 'char') {
            this.gamers[change.id].setPosition(change.position);
            this.gamers[change.id].lastMove = change.lastMove;
            this.gamers[change.id].lastFire = change.lastFire;
        }
    }
};

GamerManager.prototype.setGamerNickname = function(data) {
    this.gamers[data.id].nickname = data.newNickname;
};





/* Communication mutli-serveurs */

var MultiServerManager = function(gamerManager) {
    var _this = this;

    (function() {
        _this.broadcastManager = new BroadcastManager();
        _this.gamerManager = gamerManager;


        var context = rabbit.createContext();
        context.on('ready', function() {
            _this.sub = context.socket('SUBSCRIBE');

            _this.sub.connect('gameALJP', function() {
                _this.sub.on('data', function(msg) {
                    var msg = JSON.parse(msg);
                    _this.broadcastManager[msg.functionName](msg.data);
                    if(['move', 'addGamer', 'deleteGamer', 'setGamerNickname'].indexOf(msg.functionName) >= 0) {
                        _this.gamerManager[msg.functionName](msg.data);
                    }
                });
            });

            _this.pub = context.socket('PUBLISH');
            _this.pub.connect('gameALJP');
        });
    })();
};

MultiServerManager.prototype.move = function(newPositions) {
    this.pub.publish('move', JSON.stringify({functionName: 'move', data: newPositions}));
};

MultiServerManager.prototype.addGamer = function(gamer) {
    this.pub.publish('addGamer', JSON.stringify({functionName: 'addGamer', data: gamer}));
};

MultiServerManager.prototype.deleteGamer = function(id) {
    this.pub.publish('deleteGamer', JSON.stringify({functionName: 'deleteGamer', data: id}));
};

MultiServerManager.prototype.setGamerNickname = function(data) {
    this.pub.publish('setGamerNickname', JSON.stringify({functionName: 'setGamerNickname', data: data}));
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

BroadcastManager.prototype.setGamerNickname = function(data) {
    io.emit('setGamerNickname', data)
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
    /* Le broadcast est différent selon si on a un ou plusieurs serveurs qui font tourner le jeu.
    S'il n'y a qu'un seul serveur on instancie BroadcastManager qui enverra directement les messages aux clients.
    S'il y a plusieurs serveurs, on instancie MultiServerManager qui comportera une instance de BroadcastManager.
     */
    this.broadcast = new MultiServerManager(this.gamerManager);
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
            _this.gamerManager.move(_this.actionManager.newPositions);

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
            console.log("gamerToUpdate Char");
            console.log(_this.gamerManager.gamers[charActions.id].char);
            _this.actionManager.setGamerToUpdate(
                charActions.id,
                charActions.actions,
                _this.gamerManager.gamers[charActions.id].char
            );
            _this.actionManager.update();
        });

        socket.on('nickname', function(newNickname) {
            _this.gamerManager.setGamerNickname({id: gamer.id, newNickname: newNickname});
            _this.broadcast.setGamerNickname({id: gamer.id, newNickname: newNickname});
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