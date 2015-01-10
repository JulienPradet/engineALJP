var express = require('express'),
    http = require('http'),
    path = require('path'),
    rabbit = require('rabbit.js');

var app = express(),
    sub,
    pub;

http.createServer(app).listen(3000, function(){
    console.log("RabbitMQ + Node.js app running on AppFog!");

    var context = rabbit.createContext();
    console.log("Context created.");

    context.on('ready', function() {
        sub = context.socket('SUBSCRIBE', {routing: 'direct'});
        sub.connect('events', 'game.envoi', function() {
            sub.on('data', function(data) {
                console.log(data+"");
            });
        });

        pub = context.socket('PUBLISH', {routing: 'direct'});
        pub.connect('events');
    });
});

app.get('/', function(req, res) {
    pub.publish('game.envoi', JSON.stringify({topic: "game.envoi"}));
    pub.publish('game.bla', JSON.stringify({topic: "game.bla"}));
    res.send('envoyé');
});