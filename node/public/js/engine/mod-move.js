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
engineALJP.move.Manager = function(map, gamerManager, weaponery) {
    var _this = this;

    (function() {
        _this.MAX_FRAME_RATE = 60; /* Maximum FPS */
        _this.fps = 0; /* FPS courant */
        _this.requestId = false; /* Le rafraichissement du jeu est en cours */
        _this.map = map; /* Map en cours pour le manager */
        _this.gamerManager = gamerManager; /* Personnage du joueur */
        _this.weaponery = weaponery;
        _this.currentHolding = [];
        _this.unstoppableAction = ["top"];
        _this.stepStoppableAction = {"top" : 16};
    })();
};

/**
 * Calcul de la nouvelle frame
 */
engineALJP.move.Manager.prototype.frame = function() {
    /* Maj de la carte */
    engineALJP.ctx.clearRect(0, 0, engineALJP.options.width, engineALJP.options.height);
    engineALJP.ctx.beginPath();

    var posMainCharX = this.gamerManager.gamers[treeGame.mainId].char.pos_x,
        posMainCharY = this.gamerManager.gamers[treeGame.mainId].char.pos_y;

    var offsetX = posMainCharX - (engineALJP.options.width - engineALJP.char.width)/2,
        offsetY = posMainCharY - (engineALJP.options.height - engineALJP.char.height)/2;

    this.map.draw(engineALJP.ctx, offsetX, offsetY);
    this.gamerManager.draw(engineALJP.ctx, offsetX, offsetY);
    this.weaponery.draw(engineALJP.ctx, offsetX, offsetY);

    return true;
};

engineALJP.move.Manager.prototype.drawLoop = function() {
    var _this = this;

    /* Affichage de la nouvelle frame */
    if(this.frame()) {
        /* Continue l'affichage dès qu'il peut (fonction optimisée par le navigateur) */
        requestAnimationFrame(function() {
            _this.drawLoop();
        });
    }
};

/**
 * Gestion des évènements sur les changements de controles
 */
engineALJP.move.Manager.prototype.initEventsListeners = function() {
    var _this = this;
    document.addEventListener("engineALJP_ActionChange", function() {
        _this.drawLoop();
    });
};

engineALJP.move.Manager.prototype.updatePositions = function(newPositions) {
    var bullets = [];

    for (var i=0; i<newPositions.length; ++i) {
        if (newPositions[i].type === "char") {
            this.gamerManager.update(newPositions[i].id, newPositions[i].position);
//            console.log("Je vais mettre à jour un character.");
        } else if (newPositions[i].type === "bullet") {
//            console.log("Je vais mettre à jour un bullet.");
            bullets.push(
                new engineALJP.weaponery.Bullet({
                    x: newPositions[i].bloc.x,
                    y: newPositions[i].bloc.y
                })
            );
        }
    }

    this.weaponery.bullets = bullets;
};