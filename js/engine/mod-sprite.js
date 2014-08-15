/**
 * Module de gestion de sprite sheet (une seule image contenant plusieurs états d'un même objet surlaquelle on se positionne selon l'étape de l'animation)
 * Nécessaire pour l'animation de personnages mais aussi des blocs en fond (ex: cascade d'eau, torche, lave, etc.)
 */

engineALJP.sprite = {};

engineALJP.sprite.Sheet = function(src) {
    var _this = this;

    (function() {
        _this.src = src;
    })();
};
