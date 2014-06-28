/* On permet à l'utilisateur de configurer ses touches */
engineALJP.controls.initForm();

window.treeGame = {};

/* Création de la map */
treeGame.currentMap = new engineALJP.map.map([], []);

/* Ajout de blocs pour les tests */
treeGame.currentMap.addBlocs(new engineALJP.map.bloc({x: 30, y: 20}));
treeGame.currentMap.addBlocs(new engineALJP.map.bloc({x:60, y: 20}));

/* On affiche la carte */
engineALJP.init();
treeGame.currentMap.draw(engineALJP.ctx);