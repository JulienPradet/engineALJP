/*
* Contenu général
* Initialisation du serveur
* Ecoute de nouvelles websockets
* */

/* Gestion de l'affichage de la page : port 8080 */
var app = require('express')();
/* Gestion des sockets */
var http = require('http').Server(app);
var io = require('socket.io')(http);



app.get('/', function(req, res){
    console.log("route1");
    res.sendFile('/index.html', {root: 'public'});
});

app.get(/\/(js|css)\/(.*)/, function(req, res){
    var route = '/' + req.params[0] + '/' + req.params[1];
    if(route === "") route = "/index.html";

    console.log("route2"+route);

    res.sendFile(route, {root: 'public'});
});

io.on('connection', function(socket){
    /* On crée le personnage */


    /* On ecoute les actions de l'utilisateur */
    socket.on('action', function(lastActions) {

    });

    /* On gère la déconnexion */
    socket.on('disconnect', function() {

    });
});

var server = http.listen(8080, function(){

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)
});
