/**
 * Module de gestion de mouvement
 * Modules nécessaires :
 *      - mod-map.js
 *      - mod-controls.js
 */

engineALJP.move = {};

/* On écoute l'event "holdingUpdate" pour changer d'attitude à chaque fois qu'il y a un mouvement différent */
/**
 * Constructeur de l'objet Manager de mouvement
 * @param map utilisée dans l'animation
 * @constructor
 */
engineALJP.move.Manager = function(map, char, weaponery) {
    var _this = this;

    (function() {
        _this.MAX_FRAME_RATE = 60; /* Maximum FPS */
        _this.fps = 0; /* FPS courant */
        _this.ongoing = false; /* L'animation est en cours */
        _this.lastMove = 0;
        _this.requestId = false; /* Le rafraichissement du jeu est en cours */
        _this.map = map; /* Map en cours pour le manager */
        _this.char = char; /* Personnage du joueur */
        _this.increments = {};
        _this.useStep = true; /* L'animation en cours utilise-t-elle les steps pour calculer les increments ? - permet d'éviter de recalculer les increments à chaque fois */
        _this.currentHolding = [];
        _this.unstoppableAction = ["top"];
        _this.stepStoppableAction = {"top" : 16};
        _this.gravity = 9.81;

        _this.weaponery = weaponery;

        /**
         * Les fonctions à executer en fonction de l'action de l'utilisateur
         * Ces fonctions prennent en paramètre le manager, et renvoie un boolean selon si l'attribut step est utilisé
         * @type {Object.<string, function>}
         */
//        _this.actionToIncrement = {
//            "left": function(_this, time_diff, time_started, step) { _this.increments.map.velocity_x = 20; return true; },
//            "right": function(_this, time_diff, time_started, step) { _this.increments.map.velocity_x = -20; return true; },
//            "top": function(_this, time_diff, time_started, step) {
//                if(_this.increments.char.pos_y > 240) return false;
//                /* N'affecte que le character */
//                if(step == 0) {
//                    _this.increments.char.acceleration_y = -500;
//                } else {
//                    _this.increments.char.acceleration_y = 0;
//                }
//                return true;
//            },
//            "down": function(_this, time_diff, time_started) { _this.increments.char.velocity_y = 1; return true; },
//            "physicMove": function(_this, time_diff, time_started, step) {
//                var bloc,
//                    dir_y = (_this.increments.char.velocity_y > 0 ? "bottom" : "top"),
//                    dir_x = (_this.increments.map.velocity_x < 0 ? "right" : "left");
//                bloc = _this.getBlocHardness(_this.char.pos_x, _this.char.pos_y, _this.char.width, _this.char.height, dir_x, dir_y);
//
//                /* On calcul la nouvelle position à condition de ne pas être dans un bloc bloquant */
////                if(!bloc.hardness[dir_x]) {
//                    _this.increments.map.pos_x += _this.increments.map.velocity_x * time_diff;
////                } else {
////                    _this.increments.map.velocity_x = 0;
////                }
////                if(!bloc.hardness[dir_y]) {
//                    _this.increments.char.pos_y += (_this.increments.char.velocity_y * time_diff) + (_this.char.weight * _this.gravity * (time_diff * time_diff) / 2);
//                    _this.increments.char.velocity_y += _this.increments.char.acceleration_y + (_this.char.weight * _this.gravity * time_diff);
////                } else {
////                    _this.increments.char.velocity_y = 0;
////                    _this.increments.char.acceleration_y = 0;
////                }
//
//                /* On s'assure qu'on est pas rentré dans un bloc pas franchissable */
//                bloc = _this.getBloc(_this.increments.char.pos_x + _this.char.height / 2, _this.increments.char.pos_y + _this.char.height);
//                if(typeof bloc === "undefined") {
//                    bloc = {"hardness": {"top": false, "bottom": false, "left": false, "right": false}};
//                } else {
//                    console.log(Math.floor((_this.char.pos_y + _this.char.height) / 16));
//                    clearInterval(_this.ongoing);
//                }
//                dir_y = (_this.increments.char.velocity_y > 0 ? "bottom" : "top");
//                if(_this.increments.char.velocity_x !== 0 && bloc.hardness[dir_x]) {
//                    /* Je calcule la position pour toucher le bloc */
//                    if(dir_x === "left") {
//                        _this.increments.char.pos_x = bloc.x;
//                    } else {
//                        _this.increments.char.pos_x = bloc.x - _this.char.width;
//                    }
//                }
//                if(_this.increments.char.velocity_y !== 0 && bloc.hardness[dir_y]) {
//                    if(dir_x === "top") {
//                        _this.increments.char.pos_y = bloc.y + _this.char.height;
//                    } else {
//                        _this.increments.char.pos_y = bloc.y - _this.char.height;
//                    }
//                    _this.increments.char.velocity_y = 0;
//                    _this.increments.char.acceleration_y = 0;
//                }
//
//                /* Je remets les mouvements gauche/droite à 0 */
//                _this.increments.map.velocity_x = 0;
//            }
//        };


        _this.actionToIncrement = {
            "left": function(_this, time_diff, time_started, step) {
                _this.increments.char.velocity_x = -1;
                return true;
            },
            "right": function(_this, time_diff, time_started, step) {
                _this.increments.char.velocity_x = 1;
                return true;
            },
            "top": function(_this, time_diff, time_started, step) {
                _this.increments.char.velocity_y = -1;
                return true;
            },
            "down": function(_this, time_diff, time_started, step) {
                _this.increments.char.velocity_y = 1;
                return true;
            },
            "static": function(_this, time_diff, time_started, step) {
                _this.increments.char.velocity_x = 0; _this.increments.map.velocity_y = 0;
                return false;
            },
            "physicMove": function(_this, time_diff, time_started, step) {
                _this.increments.char.pos_x = _this.increments.char.pos_x + _this.increments.char.velocity_x * time_diff / 1000 * 60;
                _this.increments.char.pos_y = _this.increments.char.pos_y + _this.increments.char.velocity_y * time_diff / 1000 * 60;
            },
            "init": function(_this, time_diff, time_started, step) {
                _this.increments.char.velocity_x = 0;
                _this.increments.char.velocity_y = 0;
            },
            "action": function(_this, time_diff, time_started, step) {
                // On tire
                _this.weaponery.fire(
                    _this.char.pos_x + 8,
                    _this.char.pos_y + 8,
                    {
                        x: _this.increments.char.velocity_x,
                        y: _this.increments.char.velocity_y
                    }
                );
            }
        };
    })();
};

engineALJP.move.Manager.prototype.getBloc = function(x, y) {
    var i = Math.floor(x / 16), j = Math.floor(y / 16);
    return this.map.getBloc(i, j);
};

engineALJP.move.Manager.prototype.getBlocHardness = function(pos_x, pos_y, width, height, dir_x, dir_y) {
    /* retourne un objet de type {dir_x: boolean, dir-y: boolean} qui indique s'il a le droit de se déplacer dans ce sens si pas le droit, retourne aussi position en x et en y de l'objet */
    return {hardness:{top: false, bottom: false, left: false, right:false}};
};

/**
 * Calcul des increments pour l'étape de l'animation
 * @param holding action en cours
 */
engineALJP.move.Manager.prototype.getIncrements = function(time_diff) {
    /* On les calcule pour un jeu de plateforme */
    var useStep = false,
        i, action;
    this.actionToIncrement.init(this, time_diff);
    for(i in engineALJP.controls.lastActions) {
        action = engineALJP.controls.lastActions[i];
        if(action.ongoing) {
            useStep = this.actionToIncrement[action.type](this, time_diff, action.started, this.step) || useStep;
        }
    }

    if(useStep) {
        this.actionToIncrement.physicMove(this, time_diff, action.started);
    } else {
        this.actionToIncrement.static(this, time_diff);
    }

    return useStep;
};

/**
 * Réalise l'animation
 */
engineALJP.move.Manager.prototype.animate = function() {
    var _this = this;
    this.step = 0;

    this.increments = {
            map: this.map.getPosition(),
            char: this.char.getPosition()
        };

    this.time_lastMove = new Date();
    this.numberFrame = 0;
    this.totalTime = 0;
    var devInfo = document.getElementById("devInfo");
    var moveStep = function(timestamp) {
        var time_diff = (timestamp - _this.time_lastMove);
        _this.numberFrame++;
        _this.totalTime += time_diff;
        devInfo.innerHTML = "FPS : "+ (_this.numberFrame / _this.totalTime * 1000);
//        console.log("animateFPS"+_this.animateFPS);

        /* Calcul des mouvements à faire en fonction de l'action (si on n'utilise pas le step, on ne recalcule pas l'increment) */
        _this.useStep = _this.getIncrements(time_diff);

        /* On déplace la carte en conséquence */
        _this.map.update(_this.increments.map, time_diff);
        _this.weaponery.update(time_diff);
        _this.char.update(_this.increments.char, time_diff);

        /* On a fait un step en plus dans l'animation */
        _this.step = _this.step + 1;
        if(_this.step > 1000)
            clearInterval(_this.ongoing);

        _this.time_lastMove = timestamp;
    };

    this.ongoing = setInterval(function() {
        moveStep(new Date())
    }, 1000/60);
};

/**
 * Calcul de la nouvelle frame
 */
engineALJP.move.Manager.prototype.frame = function() {
    /* Maj de la carte */
    engineALJP.ctx.clearRect(0, 0, engineALJP.options.width, engineALJP.options.height);
    engineALJP.ctx.beginPath();
    var offsetX = this.char.pos_x - (engineALJP.options.width - engineALJP.char.width)/2,
        offsetY = this.char.pos_y - (engineALJP.options.height - engineALJP.char.height)/2;

    this.map.draw(engineALJP.ctx, offsetX, offsetY);
    this.weaponery.draw(engineALJP.ctx, offsetX, offsetY);
    this.char.draw(engineALJP.ctx, offsetX, offsetY);
};

engineALJP.move.Manager.prototype.drawLoop = function() {
    var _this = this;

    /* Affichage de la nouvelle frame */
    this.frame();

    /* Continue l'affichage dès qu'il peut (fonction optimisée par le navigateur) */
    requestAnimationFrame(function() {
        _this.drawLoop();
    });
};

/**
 * Lance l'animation en remettant les paramètres aux valuers par défaut
 * @param step {(number|)} s'il existe, définit le début de l'animation
 */
engineALJP.move.Manager.prototype.begin = function(step) {
    var _this = this;

    this.end();

    /* Gestion des steps */
    this.useStep = true;
    if(typeof step === "undefined")
        step = 0;
    this.step = step;

    /* Affichage */
    this.drawLoop();

    this.animate();
};

/**
 * Arrête l'animation
 */
engineALJP.move.Manager.prototype.end = function() {
    /* On arrete l'action en cours */
    if(this.ongoing !== false) {
        clearInterval(this.ongoing);
        this.ongoing = false;
    }
};

/**
 * Gestion des évènements sur les changements de controles
 */
engineALJP.move.Manager.prototype.initEventsListeners = function() {
    var _this = this;
    document.addEventListener("engineALJP_ActionChange", function() {
        _this.begin();
    });
};

engineALJP.move.Manager.prototype.updatePositions = function(newPositions) {
    for (var i=0; i<newPositions.length; ++i) {
        if (newPositions[i].type === "char") {
            console.log("Je vais mettre à jour un character.");
            //TODO
        }
        if (newPositions[i].type === "bullet") {
            console.log("Je vais mettre à jour un bullet.");
            //TODO
        }
    }
};