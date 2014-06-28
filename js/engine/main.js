
/**
 * @file Fichier parent du game engine
 * @author	Aurélie Lorgeoux : aurelie@nom-du-jeu.fr
 * @author Julien Pradet : julien@nom-du-jeu.fr
 *
 * @description Fichier de l'engine :
 *   - se veut générique et ne dépend pas du jeu
 *   - contient les initialisations
 *   - les types d'objets qui peuvent entrer en jeu
 *   - les fonctions de mise à jour du canvas
 */

window.engineALJP = { "initialized": false };

/**
 * Options de l'engine
 * @type {{idSelector: string, width: number, height: number}}
 * idSelector : id du canvas selectionné pour mettre en place le jeu
 * width : largeur du canvas
 * height: hauteur du canvas
 */
engineALJP.options = {
	"idSelector": "engineALJP",
	"width": 400,
	"height": 240
};

/**
 * Choisir les options génériques de l'engine
 * @param argOptions {engineALJP.options}
 */
engineALJP.setOptions = function(argOptions) {
	if(typeof argOptions.idSelector !== "undefined")
		engineALJP.idSelector = argOptions.idSelector;

	if(typeof argOptions.width !== "undefined")
		engineALJP.width = argOptions.width;

	if(typeof argOptions.height !== "undefined")
		engineALJP.height = argOptions.height;
}

/**
 * Initialiser le canvas
 * Récupère le canvas, et intialise le context qui est disponible via engineALJP.ctx
 */
engineALJP.init = function() {
    /* On récupère le contexte du canvas */
	var ctx;
	engineALJP.canvas = document.getElementById(engineALJP.options.idSelector);
    engineALJP.canvas.width  = engineALJP.options.width;
    engineALJP.canvas.height = engineALJP.options.height;
	if(typeof engineALJP.canvas !== "undefined")
		ctx = engineALJP.canvas.getContext('2d');
	engineALJP.ctx = ctx;

    /* On fait un espace blanc */
	ctx.rect(0,0,engineALJP.options.width,engineALJP.options.height);
	ctx.fillStyle="#ffffff";
	ctx.fill();
};
