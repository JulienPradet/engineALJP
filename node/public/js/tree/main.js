/* On crée le contexte */
window.treeGame = {};

/* On permet à l'utilisateur de configurer ses touches */
engineALJP.controls.initForm();

/* On affiche la carte */
engineALJP.init();

engineALJP.startGame = function() {
    if(typeof treeGame.mainId === "undefined"
        || typeof treeGame.gamerManager.gamers === "undefined"
        || typeof treeGame.gamerManager.gamers[treeGame.mainId] === "undefined") {
        setTimeout(engineALJP.startGame, 100);
    } else {
        /* Création de la map */
        treeGame.currentMap = new engineALJP.map.Map(0, 0, 0, [], []);

        /* Ajout de blocs pour les tests */
        for (var i = 0; i < 400 / 16; ++i) {
            treeGame.currentMap.addFixedBlocs(i, 14, new engineALJP.map.Bloc({x: i * 16, y: 14 * 16, angle: 0}));
            treeGame.currentMap.addFixedBlocs(i, 0, new engineALJP.map.Bloc({x: i * 16, y: 0 * 16, angle: 0}));
            //    treeGame.currentMap.addFixedBlocs(i, 9, new engineALJP.map.Bloc({x: i*16, y: 9*16, angle: 0}));


            treeGame.currentMap.addFixedBlocs(0, i, new engineALJP.map.Bloc({x: 0 * 16, y: i * 16, angle: 0}));
            treeGame.currentMap.addFixedBlocs(24, i, new engineALJP.map.Bloc({x: 24 * 16, y: i * 16, angle: 0}));
        }

        treeGame.weaponery = new engineALJP.weaponery.WeaponeryManager();

        /* On commence l'animation */
        treeGame.moveManager = new engineALJP.move.Manager(treeGame.currentMap, treeGame.gamerManager, treeGame.weaponery);
        treeGame.moveManager.initEventsListeners();

        /* On initialise la vue pour les informations sur les joueurs */
        treeGame.gamerManager.gamerView.init();
    }
};