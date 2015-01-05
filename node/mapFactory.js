/*
 * Blocs
 */
/**
 * Bloc constituant la map
 * @param options
 *      - x Position latérale de l'objet dans la map
 *      - y Position verticale de l'objet dans la map
 *      - angle Orientation de l'objet
 *      - width largeur
 *      - height hauteur
 *      - zoom coefficient de grossissement
 *      - color : {(string|engineALJP.sprite)}
 *      - viscosity : degré de viscosité : objet cardinal (possède 4 valeurs top, bottom, left et right
 *      - hardness :  : objet cardinal (possède 4 valeurs top, bottom, left et right) booleens
 *      - state : Etat du bloc (normal, branlant, entrain de se détruire, en feu, etc. - Cet état est décrit selon le jeu qui crée ses propres types d'états)
 *              Par défaut, on a 0 - supprimé, 1 - normal
 */
var Bloc = function(options) {
    var _this = this; /* Permet d'avoir acces au this dans les fonctions */
    /* Constructeur */
    (function() {
        if(typeof options === "object") {
            if(typeof options.x === "undefined")
                options.x = 0;
            _this.x = options.x;

            if(typeof options.y === "undefined")
                options.y = 0;
            _this.y = options.y;

            if(typeof options.angle === "undefined")
                options.angle = 0;
            _this.angle = options.angle;

            if(typeof options.width === "undefined")
                options.width = 16;
            _this.width = options.width;

            if(typeof options.height === "undefined")
                options.height = 16;
            _this.height = options.height;

            if(typeof options.zoom === "undefined")
                options.zoom = 1;
            _this.zoom = options.zoom;

            if(typeof options.background === "undefined")
                options.background = "#79f";
            _this.background = options.background;

            if (typeof options.viscosity === "undefined")
                options.viscosity = {top: 0, left: 0, bottom: 0, right: 0};
            _this.viscosity = options.viscosity;

            if (typeof options.hardness === "undefined")
                options.hardness = {top: true, left: false, bottom: true, right: false};
            _this.hardness = options.hardness;

            if (typeof options.state === "undefined")
                options.state = 1;
            _this.state = options.state;
        }
    })();
};

/**
 * Getter de la position de l'objet
 * @returns {{top: Number, left: Number, angle: Number}} Position courante de l'objet
 */
Bloc.prototype.getPosition = function() {
    return {
        top: this.y,
        left: this.x,
        angle: this.angle
    };
};

/**
 * Setter de la position de l'objet
 * @param options {{top: Number, left: Number, angle: Number}} Paramètres à changer
 * @returns {{top: Number, left: Number, angle: Number}} Nouvelle position de l'objet
 */
Bloc.prototype.setPosition = function(options) {
    if(typeof options.top !== "undefined")
        this.y = options.top;

    if(typeof options.left !== "undefined")
        this.x = options.left;

    if(typeof options.angle !== "undefined")
        this.angle = options.angle;

    return ({
        top: this.y,
        left: this.x,
        angle: this.angle
    });
};

/**
 * Fonction qui change l'état du bloc - Modifiee dans le cas de blocs complexes
 * @param state
 */
Bloc.prototype.changeState = function(state) {
    this.state = state;
};

/**
 * Suppression du bloc entraine le changement d'état. On récupère la map pour pouvoir supprimer le bloc de la map une fois détruit
 * @param map map dans laquelle est inséré le bloc et où il faut l'enlever une fois la suppression terminée
 * @param index index du bloc dans la map
 */
Bloc.prototype.deleteBloc = function(map, index) {
    this.changeState(0); /* Passe en état détruit */
    /* Par défaut, dès qu'un bloc est détruit, on l'enlève de la map : Comportement a modifier selon le jeu et le type de blocs */
    map.removeBloc(index);
};


/*
 * MAP
 */
/**
 * Map constituée de blocs, et de personnages non joueurs (PNJ (No-Player Caracter - NPC en anglais))
 * @param x position latérale
 * @param y position verticale
 * @param angle angle de rotation
 * @param argBlocs {Array.<engineALJP.map.Bloc>} Tableau de blocs
 * @param npcs {Array.<engineALJP.npc.npc>} Tableau de pnj
 */
var Map = function(x, y, angle, argBlocs, npcs) {
    var _this = this;

    (function() {
        _this.pos_x = x;
        _this.pos_y = y;
        _this.angle = angle;
        _this.blocs = argBlocs;
        _this.npcs = npcs;
    })();
};

Map.prototype.getPosition = function() {
    return ({
        pos_x: this.pos_x,
        pos_y: this.pos_y,
        angle: this.angle
    });
}

/**
 * Getter des blocs constituants la map
 * @returns {Array.<engineALJP.map.Bloc>}
 */
Map.prototype.getBlocs = function() {
    return this.blocs;
};

Map.prototype.getBloc = function(i, j) {
    if(typeof this.blocs[i] === "undefined") return;
    return this.blocs[i][j];
};

Map.prototype.readFromCSV = function(src) {

};

/**
 * Ajoute des blocs à la map
 * @param bloc
 * @returns {Array.<engineALJP.map.Bloc>|engineALJP.map.Bloc}
 */
Map.prototype.addFixedBlocs = function(x, y, bloc) {
    /* S'il s'agit d'un bloc unique */
    if(bloc instanceof engineALJP.map.Bloc) {
        if(typeof this.blocs[x] === "undefined")
            this.blocs[x] = [];
        this.blocs[x][y] = bloc;
    }
    return this.blocs;
};

/**
 * Supprime un bloc en lançant l'animation de destruction par exemple
 * @param {Number} index du bloc
 */
Map.prototype.deleteFixedBloc = function(x, y) {
    this.blocs[x][y].deleteBloc(this, x, y);
};

/**
 * Supprime un bloc du tableau des blocs (généralement après que l'animation de suppression soit faite
 * @param {Number} index
 */
Map.prototype.removeBloc = function(index) {
    this.blocs.splice(index, 1);
};

/**
 * Ajoute des incréments de position à la map
 * @param increments
 */
Map.prototype.update = function(increments) {
    this.pos_x = increments.pos_x;
    this.pos_y = increments.pos_y;
    this.angle = increments.angle;
};

module.exports = {
    'Bloc': Bloc,
    'Map': Map
};