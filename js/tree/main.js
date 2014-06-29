/* On permet à l'utilisateur de configurer ses touches */
engineALJP.controls.initForm();

window.treeGame = {};

/* Création de la map */
treeGame.currentMap = new engineALJP.map.Map(0, 0, 0.1, [], []);

/* Ajout de blocs pour les tests */
treeGame.currentMap.addBlocs(new engineALJP.map.Bloc({x: 30, y: 20, angle: 0}));
treeGame.currentMap.addBlocs(new engineALJP.map.Bloc({x:60, y: 20, angle: 0}));

/* On affiche la carte */
engineALJP.init();

/* On commence l'animation */
treeGame.moveManager = new engineALJP.move.Manager(treeGame.currentMap);
treeGame.moveManager.initEventsListeners();