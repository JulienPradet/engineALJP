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
engineALJP.move.Manager = function(map, char) {
    var _this = this;

    /**
     * Les fonctions à executer en fonction de l'action de l'utilisateur
     * Ces fonctions prennent en paramètre le manager, et renvoie un boolean selon si l'attribut step est utilisé
     * @type {Object.<string, function>}
     */
    _this.actionToIncrement = {
        "left": function(_this) { _this.increments.map.x = _this.increments.map.x + 1; return false; },
        "right": function(_this) { _this.increments.map.x = _this.increments.map.x - 1; return false; },
        "top": function(_this) {
            if(_this.step > _this.stepStoppableAction.top) {
                _this.currentHolding.splice(_this.currentHolding.indexOf("top"),1);
                return false;
            }

            var speed = 1.2;
            var nbStep = 8;
            var current;
            if(_this.step > nbStep) {
                current = _this.step - nbStep;
            } else {
                current = nbStep - _this.step;
            }
            _this.increments.char.y = Math.pow(current, speed) | 0;
            _this.increments.char.y = (_this.step < nbStep) ? 0 - _this.increments.char.y : 0 + _this.increments.char.y;
            return true;
        },
        "down": function(_this) { _this.increments.char.y = _this.increments.char.y - 1; return false; }
    };

    (function() {
        _this.MAX_FRAME_RATE = 60; /* Maximum FPS */
        _this.fps = 0; /* FPS courant */
        _this.ongoing = false; /* L'animation est en cours */
        _this.requestId = false; /* Le rafraichissement du jeu est en cours */
        _this.step = 0; /* L'étape de l'animation courante (utile pour gérer les increments en fonction de la duree de l'animation) */
        _this.map = map; /* Map en cours pour le manager */
        _this.char = char; /* Personnage du joueur */
        _this.useStep = true; /* L'animation en cours utilise-t-elle les steps pour calculer les increments ? - permet d'éviter de recalculer les increments à chaque fois */
        _this.increments = {x: 0, y: 0, angle: 0}; /* Increment pour la prochaine frame */
        _this.currentHolding = [];
        _this.unstoppableAction = ["top"];
        _this.stepStoppableAction = {"top" : 16}
    })();
};


/**
 * Calcul des increments pour l'étape de l'animation
 * @param holding action en cours
 */
engineALJP.move.Manager.prototype.getIncrements = function() {
    /* On les calcule pour un jeu de plateforme */
    this.increments = { map: {x: 0, y: 0, angle: 0}, char: {x: 0, y: 0}};
    var useStep = true;
    if(this.currentHolding.indexOf("left") >= 0) {
        useStep = this.actionToIncrement.left(this) && useStep;
    }

    if(this.currentHolding.indexOf("right") >= 0) {
        useStep = this.actionToIncrement.right(this) && useStep;
    }

    if(this.currentHolding.indexOf("top") >= 0) {
        useStep = this.actionToIncrement.top(this) && useStep;
    } else if(this.currentHolding.indexOf("down") >= 0) {
        this.actionToIncrement.down(this);
        useStep = true;
    }

    return useStep;
};

/**
 * Calcul de la nouvelle frame
 * @param increments update du mouvement
 */
engineALJP.move.Manager.prototype.frame = function() {
    /* Maj de la carte */
    engineALJP.ctx.clearRect(0, 0, engineALJP.options.width, engineALJP.options.height);
    engineALJP.ctx.beginPath();
    this.map.draw(engineALJP.ctx);
    this.char.draw(engineALJP.ctx);
};

/**
 * Réalise l'animation
 */
engineALJP.move.Manager.prototype.animate = function() {
    var _this = this;
    this.ongoing = setInterval(function(){
        /* Calcul des mouvements à faire en fonction de l'action (si on n'utilise pas le step, on ne recalcule pas l'increments) */
        _this.useStep = _this.getIncrements();

        /* On déplace la carte en conséquence */
        _this.map.update(_this.increments.map.x, _this.increments.map.y, _this.increments.map.angle);
        _this.char.update(_this.increments.char.x, _this.increments.char.y);

        /* On a fait un step en plus dans l'animation */
        _this.step = _this.step + 1;

        if(_this.useStep === false) {
            if(_this.stoppable()) {
                _this.currentHolding = engineALJP.controls.holding.slice();
                if(_this.currentHolding.length === 0) {
                    clearInterval(_this.ongoing);
                    _this.ongoing = false;
                } else {
                    this.step = 0;
                }
            }
        }
    }, 1000/60);
};

engineALJP.move.Manager.prototype.drawLoop = function() {
    var _this = this;
    requestAnimationFrame(function() {
        _this.drawLoop();
    });

    /* Affichage de la nouvelle frame */
    this.frame();
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

    requestAnimationFrame(function() {
        _this.drawLoop();
    });

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

engineALJP.move.Manager.prototype.stoppable = function() {
    for(var i = 0; i < this.currentHolding.length; i = i + 1) {
        if(this.unstoppableAction.indexOf(this.currentHolding[i]) > -1) {
            if(this.stepStoppableAction[this.currentHolding[i]] >= this.step) {
                return false;
            }
        }
    }
    return true;
};

/**
 * Gestion des évènements sur les changements de controles
 */
engineALJP.move.Manager.prototype.initEventsListeners = function() {
    var _this = this;
    document.addEventListener("engineALJP_holdingChange", function() {
        if(_this.ongoing === false || _this.stoppable()) {
            if(engineALJP.controls.holding.length > 0) {
                _this.currentHolding = engineALJP.controls.holding.slice();
                _this.begin();
            } else {
                _this.end();
            }
        }
    });
}
