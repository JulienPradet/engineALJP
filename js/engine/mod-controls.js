/**
 * Module de gestion de l'entrée utilisateur
 * Permet de configurer les touches de l'utilisateur et d'envoyer l'évènement à l'engine
 */

engineALJP.controls = {};

engineALJP.controls.changeHoldingEvent = new Event("engineALJP_holdingChange");

/**
 * Permet de connaître les touches qui sont actuellement pressées par l'utilisateur
 * @type {Array}
 */
engineALJP.controls.holding = [];

/**
 * Préviens le reste de l'applicaiton que le jeu doit se comporter différemment en conséquence des choix de l'utilisateur
 */
engineALJP.controls.updateHolding = function() {
    var devInfo = document.getElementById("devInfo");
    devInfo.innerHTML = engineALJP.controls.holding.toString();
    document.dispatchEvent(engineALJP.controls.changeHoldingEvent);
};

/**
 * Si l'utilisateur lache une touche, on l'enlève du tableau des touches en cours
 * @param e
 */
document.onkeyup = function(e) {
    engineALJP.controls.holding.splice(engineALJP.controls.holding.indexOf(engineALJP.controls.codeToAction[e.keyCode]), 1);
    engineALJP.controls.updateHolding();
};

/**
 * Si l'utilisateur appuie sur une touche, on l'ajoute au tableau des touches en cours
 * @param e
 */
document.onkeydown = function(e) {
    if(typeof engineALJP.controls.codeToAction[e.keyCode] !== "undefined"
        && engineALJP.controls.holding.indexOf(engineALJP.controls.codeToAction[e.keyCode]) === -1) {
        engineALJP.controls.holding.push(engineALJP.controls.codeToAction[e.keyCode]);
        engineALJP.controls.updateHolding();
    }
};

/**
 * Label des champs du formulaire pour permettre de modifier la configuration des touches
 * @type {Object.<string, string>}
 */
engineALJP.controls.labelAction = {
    left: "Move left",
    right: "Move right",
    top: "Move top",
    down: "Move down",
    action: "Action key"
};

/**
 * Code des actions
 * @type {Object.<string, number>}
 */
engineALJP.controls.actionToCode = {
    left: 37,
    right: 39,
    top: 38,
    down: 40,
    action: 65
};

/**
 * Action des codes
 * @type {Object.<number, string>}
 */
engineALJP.controls.codeToAction = {
    37: "left",
    39: "right",
    38: "top",
    40: "down",
    65: "action"
};

/**
 * Mets à jour engineALJP.controls.codeToAction, suite à un update de la configuration des touches
 */
engineALJP.controls.updateCodeToAction = function() {
    var action;
    var keyCode;
    engineALJP.controls.codeToAction = {};
    for(action in engineALJP.controls.actionToCode) {
        keyCode = engineALJP.controls.actionToCode[action];
        engineALJP.controls.codeToAction[keyCode] = action;
    }
};

/**
 * Initialisation du formulaire de configuration des touches
 */
engineALJP.controls.initForm = function() {
    var action,
        input,
        label,
        span,
        div,
        form = document.createElement("form");
    /* On cree un formulaire où l'utilisateur peut configurer chaque touche */
    for(action in engineALJP.controls.actionToCode) {
        /* On cree un input qui se met a jour et met à jour la liste des clés à chaque fois que l'utilisateur écrit dedans */
        input = document.createElement("input");
        input.setAttribute("id", action);
        input.setAttribute("value", keyboardMap[engineALJP.controls.actionToCode[action]]);
        input.addEventListener("keyup", function(e) {
            this.setAttribute("value", keyboardMap[e.keyCode]);
            engineALJP.controls.actionToCode[this.getAttribute("id")] = e.keyCode;
            engineALJP.controls.updateCodeToAction();
        });
        input.addEventListener("keydown", function(e) {
            e.preventDefault();
        });

        /* On cree le form-group */
        div = document.createElement("div");
        div.setAttribute("class", "form-group");

        /* On ajoute l'input */
        span = document.createElement("span");
        span.setAttribute("class", "form-cell right");
        span.appendChild(input);
        div.appendChild(span);

        /* On ajoute le label */
        label = document.createElement("label");
        label.innerHTML = engineALJP.controls.labelAction[action];

        span = document.createElement("span");
        span.setAttribute("class", "form-cell left");
        span.appendChild(label);
        div.appendChild(span);

        /* On ajoute le groupe au formulaire */
        form.appendChild(div);
    }
    /* Ajout du formulaire à la div de controls */
    document.getElementById("controls").appendChild(form);
};
