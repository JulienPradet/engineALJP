/*
* Contenu général
* Initialisation du serveur
* Ecoute de nouvelles websockets
* */

/* Inclusions */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var actions = require('./actions.js');
var positions = require('./positions.js');
var charFactory = require('./charFactory.js');

/* Gestion de l'affichage de la page : port 8080  */

app.get('/', function(req, res){
    res.sendFile('/index.html', {root: 'public'});
});

app.get(/\/(js|css)\/(.*)/, function(req, res){
    var route = '/' + req.params[0] + '/' + req.params[1];
    if(route === "") route = "/index.html";

    res.sendFile(route, {root: 'public'});
});



/* Gestion des sockets */

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
