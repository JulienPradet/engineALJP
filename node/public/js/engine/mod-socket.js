/**
 * Module de gestion de la socket pour communiquer avec le serveur
 */

engineALJP.socket = io();

engineALJP.socket.on('newPositions', function(newPositions){
    treeGame.moveManager.updatePositions(newPositions);
});

engineALJP.socket.on('gamers', function(gamers) {
    treeGame.gamers = new engineALJP.GamerManager([]);

    for (var i=0; i<gamers.length; ++i) {
        var gamer = gamers[i];

        if (typeof gamer === 'undefined' || gamer == null)  {
            continue;
        }

        treeGame.gamers.addGamer(gamer);
    }
});

engineALJP.socket.on('id', function(id) {
    treeGame.mainId = id;
    engineALJP.startGame();
});

engineALJP.socket.on('addGamer', function(gamer) {
    treeGame.gamers.addGamer(gamer);
});

engineALJP.socket.on('deleteGamer', function(id) {
    treeGame.gamers.deleteGamer(id);
});

