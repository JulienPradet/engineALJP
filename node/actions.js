/* Gestion de la socket qui écoute les changements de position de l'utilisateur */

var update = function(charActions) {
    var id = charActions.id,
        actions = charActions.actions;

    console.log(id);
};

module.exports = {
    'update': update
};