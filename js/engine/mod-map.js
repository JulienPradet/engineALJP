
/**
 * Module pour créer une carte
 */
engineALJP.map = {};

/**
 * Bloc constituant la map
 * @param x Position latérale de l'objet
 * @param y Position verticale de l'objet
 * @param width largeur
 * @param height hauteur
 * @param zoom coefficient de grossissement
 * @param options
 *      - viscosity : degré de viscosité : objet cardinal (possède 4 valeurs top, bottom, left et right
 *      - hardness :  : objet cardinal (possède 4 valeurs top, bottom, left et right
 */
engineALJP.map.bloc = function(x, y, width, height, zoom, options) {
    var _this = this; /* Permet d'avoir acces au this dans les fonctions */
    /* Constructeur */
    (function() {
        _this.x = x;
        _this.y = y;
        _this.width = width;
        _this.height = height;
        if(typeof zoom === "undefined")
            zoom = 1;
        _this.zoom = zoom;
        if(typeof options === "object") {
            if (typeof options.viscosity !== "undefined")
                _this.viscosity = options.viscosity;
        }
    })();

    this.update = function () {

    };
}