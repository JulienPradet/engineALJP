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
engineALJP.move.Manager = function(map) {
    var _this = this;

    /**
     * Les fonctions à executer en fonction de l'action de l'utilisateur
     * Ces fonctions prennent en paramètre le manager, et renvoie un boolean selon si l'attribut step est utilisé
     * @type {Object.<string, function>}
     */
    _this.actionToIncrement = {
        "left": function(_this) { _this.increments.x = _this.increments.x + 1; return false; },
        "right": function(_this) { _this.increments.x = _this.increments.x - 1; return false; },
        "top": function(_this) { _this.increments.y = _this.increments.y + 1; return false; },
        "down": function(_this) { _this.increments.y = _this.increments.y - 1; return false; }
    };

    (function() {
        _this.MAX_FRAME_RATE = 60; /* Maximum FPS */
        _this.fps = 0; /* FPS courant */
        _this.ongoing = false; /* L'animation est en cours */
        _this.step = 0; /* L'étape de l'animation courante (utile pour gérer les increments en fonction de la duree de l'animation) */
        _this.map = map; /* Map en cours pour le manager */
        _this.useStep = true; /* L'animation en cours utilise-t-elle les steps pour calculer les increments ? - permet d'éviter de recalculer les increments à chaque fois */
        _this.increments = {x: 0, y: 0, angle: 0}; /* Increment pour la prochaine frame */
    })();
};


/**
 * Calcul des increments pour l'étape de l'animation
 * @param holding action en cours
 */
engineALJP.move.Manager.prototype.getIncrements = function(holding) {
    /* On réinitialise les increments */
    this.increments = {x: 0, y: 0, angle: 0};
    var i;
    for(i = 0; i < holding.length; ++i) {
        /* On calcule pour chaque action et on indique si on utilise le step ou pas */
        this.useStep = this.actionToIncrement[holding[i]](this) && this.useStep;
    }
};

/**
 * Calcul de la nouvelle frame
 * @param increments update du mouvement
 */
engineALJP.move.Manager.prototype.frame = function() {
    /* Maj de la carte */
    this.map.update(this.increments.x, this.increments.y, this.increments.angle);
    this.map.draw(engineALJP.ctx);
};

/**
 * Réalise l'animation
 */
engineALJP.move.Manager.prototype.animate = function() {
    this.ongoing = true;
    var _this = this;
    var maxStep = 200;
    this.ongoing = setInterval(function(){
        /* Calcul des mouvements à faire en fonction de l'action (si on n'utilise pas le step, on ne recalcule pas l'increments) */
        if(_this.useStep)
            _this.getIncrements(engineALJP.controls.holding);

        /* Affichage de la nouvelle frame */
        _this.frame();

        _this.step = _this.step + 1;

        /* L'animation s'arrête au dela d'un nombre max de step : test @TODO retirer cette chose */
        if(_this.step > maxStep)
            _this.end();
    }, 1000/60);
};

/**
 * Lance l'animation en remettant les paramètres aux valuers par défaut
 * @param step {(number|)} s'il existe, définit le début de l'animation
 */
engineALJP.move.Manager.prototype.begin = function(step) {
    this.ongoing = true;
    this.useStep = true;
    if(typeof step === "undefined")
        step = 0;
    this.step = step;
    this.animate();
};

/**
 * Arrête l'animation
 */
engineALJP.move.Manager.prototype.end = function() {
    clearInterval(this.ongoing);
};


engineALJP.move.Manager.prototype.initEventsListeners = function() {
    var _this = this;
    document.addEventListener("engineALJP_holdingChange", function(event) {
        _this.end();
        if(engineALJP.controls.holding.length > 0)
            _this.begin();
    });
}
