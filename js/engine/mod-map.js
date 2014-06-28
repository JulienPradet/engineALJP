/**
 * Module de gestion de carte
 * Nécessite les modules :
 *     - mod-sprite.js
 *     - mod-NPC.js
 */


/**
 * Module pour créer une carte
 */
engineALJP.map = {};

/*
 * BLOCS
 */

/**
 * Bloc constituant la map
 * @param options
 *      - x Position latérale de l'objet
 *      - y Position verticale de l'objet
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
engineALJP.map.bloc = function(options) {
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

            if (typeof options.viscosity !== "undefined")
                _this.viscosity = {top: 0, left: 0, bottom: 0, right: 0};
            _this.viscosity = options.viscosity;

            if (typeof options.hardness !== "undefined")
                _this.hardness = {top: true, left: true, bottom: false, right: true};
            _this.hardness = options.hardness;

            if (typeof options.state !== "undefined")
                _this.hardness = 1;
            _this.state = options.state;
        }
    })();
};

/**
 * Getter de la position de l'objet
 * @returns {{top: Number, left: Number, angle: Number}} Position courante de l'objet
 */
engineALJP.map.bloc.prototype.getPosition = function() {
    return ({
        top: this.y,
        left: this.x,
        angle: this.angle
    });
};

/**
 * Setter de la position de l'objet
 * @param options {{top: Number, left: Number, angle: Number}} Paramètres à changer
 * @returns {{top: Number, left: Number, angle: Number}} Nouvelle position de l'objet
 */
engineALJP.map.bloc.prototype.setPosition = function(options) {
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
engineALJP.map.bloc.prototype.changeState = function(state) {
    this.state = state;
};

/**
 * Suppression du bloc entraine le changement d'état. On récupère la map pour pouvoir supprimer le bloc de la map une fois détruit
 * @param map map dans laquelle est inséré le bloc et où il faut l'enlever une fois la suppression terminée
 * @param index index du bloc dans la map
 */
engineALJP.map.bloc.prototype.deleteBloc = function(map, index) {
    this.changeState(0); /* Passe en état détruit */
    /* Par défaut, dès qu'un bloc est détruit, on l'enlève de la map : Comportement a modifier selon le jeu et le type de blocs */
    map.removeBloc(index);
};

/**
 * Fonction qui dessine le bloc en canvas
 * @param ctx Context du canvas où il faut pouvoir dessiner
 */
engineALJP.map.bloc.prototype.draw = function(ctx) {
    /* On s'assure que le bloc est dans la zone visible */
    if(this.x + this.width > 0
        && this.x - this.width < engineALJP.options.width
        && this.y + this.height > 0
        && this.y - this.height < engineALJP.options.height) {

        /* Si c'est une chaine de caractère décrivant une couleur hexadecimale */
        if(typeof this.background === "string" && !!this.background.match(/^#([0-9A-Fa-f]{3}){1,2}/)) {
            ctx.fillStyle = this.background;
            ctx.fillRect(this.x,this.y,this.width,this.height);

        /* Si c'est un sprite */
        } else if(this.background instanceof engineALJP.sprite.sprite) {

        } else {
            console.log("Le background renseigné n'est pas une couleur hexadécimale ni un sprite.");
        }
    }
};


/*
 * MAP
 */

/**
 * Map constituée de blocs, et de personnages non joueurs (PNJ (No-Player Caracter - NPC en anglais))
 * @param blocs {Array.<engineALJP.map.bloc>} Tableau de blocs
 * @param npcs {Array.<engineALJP.npc.npc>} Tableau de pnj
 */
engineALJP.map.map = function(argBlocs, npcs) {
    var _this = this;

    (function() {
        _this.blocs = argBlocs;
    })();
};

/**
 * Getter des blocs constituants la map
 * @returns {Array.<engineALJP.map.bloc>}
 */
engineALJP.map.map.prototype.getBlocs = function() {
    return this.blocs;
};

/**
 * Ajoute des blocs à la map
 * @param bloc
 * @returns {Array.<engineALJP.map.bloc>|engineALJP.map.bloc}
 */
engineALJP.map.map.prototype.addBlocs = function(bloc) {
    /* S'il s'agit d'un tableau de blocs */
    if(typeof bloc === "Array") {
        var key;
        for(key = 0; key < bloc.length; key = key + 1) {
            this.blocs.push(bloc[key]);
        }

    /* S'il s'agit d'un bloc unique */
    } else if(bloc instanceof engineALJP.map.bloc) {
        this.blocs.push(bloc);
    }
    return this.blocs;
};

/**
 * Supprime un bloc en lançant l'animation de destruction par exemple
 * @param {Number} index du bloc
 */
engineALJP.map.map.prototype.deleteBloc = function(index) {
    this.blocs[index].deleteBloc(this, index);
};

/**
 * Supprime un bloc du tableau des blocs (généralement après que l'animation de suppression soit faite
 * @param {Number} index
 */
engineALJP.map.map.prototype.removeBloc = function(index) {
    this.blocs.splice(index, 1);
};

engineALJP.map.map.prototype.draw = function(ctx) {
    /* On efface la surface concernée par la map */
    ctx.rect(0,0,engineALJP.options.width,engineALJP.options.height);
    ctx.fillStyle="#ffffff";
    ctx.fill();
//    ctx.clearRect(0,0, engineALJP.options.width, engineALJP.options.height);
    for(var i = 0; i < this.blocs.length; i++) {
        this.blocs[i].draw(ctx);
    }
};