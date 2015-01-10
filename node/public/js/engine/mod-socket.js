/**
 * Module de gestion de la socket pour communiquer avec le serveur
 */

engineALJP.socket = io();
engineALJP.lastUpdate = new Date() - 0;
engineALJP.socket.on('newPositions', function(update){
    if(update.timestamp > engineALJP.lastUpdate) {
        engineALJP.lastUpdate = update.timestamp;
        treeGame.moveManager.updatePositions(update.newPositions);
    }
});

engineALJP.socket.on('gamers', function(gamers) {
    treeGame.gamerManager = new engineALJP.Gamer.GamerManager([], new engineALJP.Gamer.GamerView());
    treeGame.gamerManager.init(gamers);
});

engineALJP.socket.on('id', function(id) {
    treeGame.mainId = id;
    engineALJP.startGame();
});

engineALJP.socket.on('addGamer', function(gamer) {
    console.log("add");
    treeGame.gamerManager.addGamer(gamer);
});

engineALJP.socket.on('deleteGamer', function(id) {
    treeGame.gamerManager.deleteGamer(id);
});

engineALJP.socket.on('setGamerNickname', function(infos) {
    treeGame.gamerManager.setGamerNickname(infos.id, infos.newNickname);
});

