/* On permet à l'utilisateur de configurer ses touches */
engineALJP.controls.initForm();

window.treeGame = {};

/* Création de la map */
treeGame.currentMap = new engineALJP.map.Map(0, 0, 0, [], []);

/* Ajout de blocs pour les tests */
for(var i = 0; i < 400 / 16; ++i) {
    treeGame.currentMap.addFixedBlocs(i, 14, new engineALJP.map.Bloc({x: i*16, y: 14*16, angle: 0}));
    treeGame.currentMap.addFixedBlocs(i, 0, new engineALJP.map.Bloc({x: i*16, y: 0*16, angle: 0}));
//    treeGame.currentMap.addFixedBlocs(i, 9, new engineALJP.map.Bloc({x: i*16, y: 9*16, angle: 0}));


    treeGame.currentMap.addFixedBlocs(0, i, new engineALJP.map.Bloc({x: 0*16, y: i*16, angle: 0}));
    treeGame.currentMap.addFixedBlocs(24, i, new engineALJP.map.Bloc({x: 24*16, y: i*16, angle: 0}));
}

treeGame.mainChar = new engineALJP.char.Character((engineALJP.options.width - engineALJP.char.width)/2, (engineALJP.options.height - engineALJP.char.width)/2, '#000000');

treeGame.weaponery = new engineALJP.weaponery.WeaponeryManager();
treeGame.weaponery.addWeapon(new engineALJP.weaponery.Weapon(4, 4, 2, 100));

/* On affiche la carte */
engineALJP.init();

/* On commence l'animation */
treeGame.moveManager = new engineALJP.move.Manager(treeGame.currentMap, treeGame.mainChar, treeGame.weaponery);
treeGame.moveManager.initEventsListeners();