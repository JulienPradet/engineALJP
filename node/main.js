/*
* Contenu général
* Initialisation du serveur
* Ecoute de nouvelles websockets
* */

/* Inclusions */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mapFactory = require('./mapFactory.js');
var charFactory = require('./charFactory.js');
var gameServer = require('./server.js')(io);

/* Gestion de l'affichage de la page : port 8080  */

app.get('/', function(req, res){
    res.sendFile('/index.html', {root: 'public'});
});

app.get(/\/(js|css)\/(.*)/, function(req, res){
    var route = '/' + req.params[0] + '/' + req.params[1];
    if(route === "") route = "/index.html";

    res.sendFile(route, {root: 'public'});
});

gameServer.initServer();

var server = http.listen(8080, function(){

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)
});
