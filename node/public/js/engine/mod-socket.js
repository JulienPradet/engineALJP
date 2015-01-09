/**
 * Module de gestion de la socket pour communiquer avec le serveur
 */

engineALJP.socket = io();

engineALJP.socket.on('newPositions', function(newPositions){
    treeGame.moveManager.updatePositions(newPositions);
});

engineALJP.socket.on('gamers', function(gamers) {
    treeGame.gameManager = new engineALJP.GamerManager([]);

    for (var i=0; i<gamers.length; ++i) {
        var gamer = gamers[i];

        if (typeof gamer === 'undefined' || gamer == null)  {
            continue;
        }

        treeGame.gameManager.addGamer(gamer);
    }
});

engineALJP.socket.on('id', function(id) {
    treeGame.mainId = id;
    engineALJP.startGame();

    var gamersInfo = document.getElementById('gamersInfo');
    var mainGamer = document.createElement("p");
    mainGamer.style.color = treeGame.gameManager.gamers[id].char.color;
    mainGamer.innerHTML = treeGame.gameManager.gamers[id].nickname;
    gamersInfo.appendChild(mainGamer);

    var listGamers = document.createElement("ul");
    for (var i=0; i<treeGame.gameManager.gamers.length; ++i) {
        if (typeof treeGame.gameManager.gamers[i] === 'undefined' || treeGame.gameManager.gamers[i] == null)
            continue;

        var gamer = treeGame.gameManager.gamers[i];
        if (gamer.id == treeGame.mainId)
            continue;

        var gamerListed = document.createElement("li");
        gamerListed.style.color = gamer.char.color;
        gamerListed.innerHTML = gamer.nickname;
        listGamers.appendChild(gamerListed);
    }
    gamersInfo.appendChild(listGamers);
});

engineALJP.socket.on('addGamer', function(gamer) {
    treeGame.gameManager.addGamer(gamer);
});

engineALJP.socket.on('deleteGamer', function(id) {
    treeGame.gameManager.deleteGamer(id);
});

