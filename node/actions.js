/* Gestion de la socket qui écoute les changements de position de l'utilisateur */
var ActionManager = function() {
    var _this = this;
    
    (function() {
        _this.positionChanged = false;
        _this.newPositions = [];
        _this.increments = {
            character: {}
        };

        _this.actionToIncrement = {
            "left": function(_this, time_diff) {
                _this.increments.character.velocity_x = -1;
                return true;
            },
            "right": function(_this, time_diff) {
                _this.increments.character.velocity_x = 1;
                return true;
            },
            "top": function(_this, time_diff) {
                _this.increments.character.velocity_y = -1;
                return true;
            },
            "down": function(_this, time_diff) {
                _this.increments.character.velocity_y = 1;
                return true;
            },
            "static": function(_this, time_diff) {
                _this.increments.character.velocity_x = 0;
                return false;
            },
            "physicMove": function(_this, time_diff) {
                _this.increments.character.pos_x = _this.increments.character.pos_x + _this.increments.character.velocity_x * time_diff / 1000 * 60;
                _this.increments.character.pos_y = _this.increments.character.pos_y + _this.increments.character.velocity_y * time_diff / 1000 * 60;
            },
            "init": function(_this, time_diff) {
                _this.increments.character.velocity_x = 0;
                _this.increments.character.velocity_y = 0;
            },
            "action": function(_this, time_diff) {
                /* On tire */
                weaponery.fire(
                    _this.increments.character.pos_x + 8,
                    _this.increments.character.pos_y + 8,
                    {
                        x: _this.increments.character.velocity_x,
                        y: _this.increments.character.velocity_y
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
    this.actionToIncrement.init(time_diff);
    for(i in actions) {
        action = actions[i];
        if(action.ongoing) {
            useStep = this.actionToIncrement[action.type](time_diff) || useStep;
        }
    }

    if(useStep) {
        this.actionToIncrement.physicMove(time_diff);
        this.positionChanged = true;
        if(this.positionChanged) {
            this.newPositions.push({
                'type': 'char',
                'id': id,
                'position': {
                    'pos_x': increments.character.pos_x,
                    'pos_y': increments.character.pos_y
                }
            });
        }
    } else {
        this.actionToIncrement.static(time_diff);
    }

    return useStep;
};

ActionManager.prototype.updateGamer = function(id, actions) {
    this.increments = {
        character: gamers[id].char.getPosition()
    };

    var timestamp = new Date(),
        time_diff = timestamp - gamers[id].lastMove;

    /* Déplacement du personnage */
    this.getIncrements(id, actions, time_diff);

    return {
        position: this.increments.character,
        lastMove: timestamp
    };
};

var broadcastManager = function() {
    var _this = this;
};

broadcastManager.prototype.move = function() {
    if(positionChanged) {
        io.emit('newPositions', newPositions);
    }
};
