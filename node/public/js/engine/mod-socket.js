/**
 * Module de gestion de la socket pour communiquer avec le serveur
 */

engineALJP.socket = io();

engineALJP.socket.on('newPositions', function(newPositions){
    treeGame.moveManager.updatePositions(newPositions);
});

engineALJP.socket.on('gamers', function(gamers) {
    treeGame.gamers = [];

    for (var i=0; i<gamers.length; ++i) {
        var gamer = gamers[i];

        if (typeof gamer === 'undefined' || gamer == null)  {
            continue;
        }

        treeGame.gamers[gamer.id] = new engineALJP.Gamer(
            gamer.id,
            gamer.nickname,
            gamer.lastMove,
            new engineALJP.char.Character(
                gamer.id,
                gamer.char.pos_x,
                gamer.char.pos_y,
                gamer.char.color));
        treeGame.gamers[gamer.id].char.draw();
    }
});

engineALJP.socket.on('id', function(id) {
    treeGame.mainId = id;
    engineALJP.startGame();
});

engineALJP.socket.on('addGamer', function(gamer) {
    treeGame.gamers[gamer.id] = gamer;
});

engineALJP.socket.on('deleteGamer', function(id) {
    delete treeGame.gamers[id];
});

