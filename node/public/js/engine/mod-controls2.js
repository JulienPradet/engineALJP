/**
 * Module de gestion de l'entrée utilisateur
 * Permet de configurer les touches de l'utilisateur et d'envoyer l'évènement à l'engine
 * L'intérêt est de faire un interfacage complet entre l'entrée utilisateur et le jeu
 * De ce fait un système d'action est pris en compte
 */

engineALJP.controls = {};

engineALJP.controls.doubleActionTime = 500;


/**
 * Classe des types d'action - permet d'interfacer les controls de manière plus propre
 * @param type
 * @constructor
 */
engineALJP.controls.Action = function(type) {
    var _this = this;

    (function() {
        _this.type = type;
        _this.started = new Date();
        _this.ongoing = false;
    })();
};/**/

/**
 * Lancement d'une action
 * @param type
 */
engineALJP.controls.Action.prototype.start = function(type) {
    this.type = type;
    this.started = new Date();
    this.ongoing = true;

    document.dispatchEvent(engineALJP.controls.actionStarted);
};

/**
 * Arrête une action en cours
 */
engineALJP.controls.Action.prototype.stop = function() {
    this.ongoing = false;
};

engineALJP.controls.actionStarted = new Event("engineALJP_ActionChange");

/**
 * Permet de connaître les touches qui sont actuellement pressées par l'utilisateur
 * @type {Array}
 */
engineALJP.controls.lastActions = {
    'left': new engineALJP.controls.Action('left'),
    'right': new engineALJP.controls.Action('right'),
    'top': new engineALJP.controls.Action('top'),
    'down': new engineALJP.controls.Action('down'),
    'action': new engineALJP.controls.Action('action')
};

/**
 * On récupère l'action effectuée il y a n étapes
 * 0 est l'étape courante
 * @param n
 */
engineALJP.controls.getAction = function (n) {
    return engineALJP.controls.lastActions.left;
};

engineALJP.controls.startNewAction = function(type) {
    if(!engineALJP.controls.lastActions[type].ongoing)
        engineALJP.controls.lastActions[type].start(type);
};

engineALJP.controls.getLastActionByType = function(type) {
    if(engineALJP.controls.lastActions[type].ongoing) {
        return engineALJP.controls.lastActions[type];
    } else {
        return false;
    }
};

engineALJP.controls.isOngoing = function(type) {
    var action, res = false;
    if(typeof type !== "undefined") {
        action = engineALJP.controls.lastActions[type];
        if(action.ongoing)
            return true;
    } else {
        var key;
        for(key in engineALJP.controls.lastActions) {
            if(engineALJP.controls.lastActions[key].ongoing)
                return true;
        }
    }
    return res;
};

/**
 * Si l'utilisateur lache une touche, en fonction de l'action on lache
 * @param e
 */
document.onkeyup = function(e) {
//    console.log(engineALJP.controls.codeToAction[e.keyCode]);
    if(typeof engineALJP.controls.codeToAction[e.keyCode] !== "undefined") {
        var action = engineALJP.controls.lastActions[engineALJP.controls.codeToAction[e.keyCode]];
        action.stop();

        /* On envoie les commandes mises à jour via la socket */
        engineALJP.socket.emit('action', {
            'id': treeGame.mainId,
            'actions': engineALJP.controls.lastActions
        });
    }
};

/**
 * Si l'utilisateur appuie sur une touche, on gère l'évènement pour ajouter une action
 * @param e
 */
document.onkeydown = function(e) {
    var action = engineALJP.controls.codeToAction[e.keyCode];
    if(typeof action !== "undefined") {
        e.preventDefault();
        if(false === engineALJP.controls.isOngoing(action)) {
            engineALJP.controls.startNewAction(action);

            /* On envoie les commandes mises à jour via la socket */
            engineALJP.socket.emit('action', {
                'id': treeGame.mainId,
                'actions': engineALJP.controls.lastActions
            });
        }
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
    action: 32
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
    32: "action"
};

/**
 * Type d'action : maintenir la touche (true) ou activer la touche (false)
 * @type {{left: boolean, right: boolean, top: boolean, down: boolean, action: boolean}}
 */
engineALJP.controls.actionHold = {
    left: true,
    right: true,
    top: true,
    down: true,
    action: true
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
