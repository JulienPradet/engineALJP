/**
 * Module de gestion de la socket pour communiquer avec le serveur
 */

engineALJP.socket = io();
console.log(engineALJP.socket);

engineALJP.socket.on('newPositions', function(newPositions){
    treeGame.moveManager.updatePositions(newPositions);
});
