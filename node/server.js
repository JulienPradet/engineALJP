/* Création de l'ensemble des objets communs à un serveur
* Il y a donc les characters, la map et la weaponery
* */

var mapFactory = require('./mapFactory.js'),
    weaponsFactory = require('./weaponsFactory.js'),
    charFactory = require('./charFactory.js');

var Game = function() {
    var _this = this;

    (function() {
        /* Gestion de la map */
        _this.map = new mapFactory.Map(0, 0, 0, [], []);

        /* Ajout de blocs pour les tests */
        for(var i = 0; i < 400 / 16; ++i) {
            _this.map.addFixedBlocs(i, 14, new mapFactory.Bloc({x: i*16, y: 14*16, angle: 0}));
            _this.map.addFixedBlocs(i, 0, new mapFactory.Bloc({x: i*16, y: 0*16, angle: 0}));
//            _this.map.addFixedBlocs(i, 9, new engineALJP.map.Bloc({x: i*16, y: 9*16, angle: 0}));

            _this.map.addFixedBlocs(0, i, new mapFactory.Bloc({x: 0*16, y: i*16, angle: 0}));
            _this.map.addFixedBlocs(24, i, new mapFactory.Bloc({x: 24*16, y: i*16, angle: 0}));
        }

        /* Gestion des armes */
        _this.weaponery = new weaponsFactory.WeaponeryManager();
        _this.weaponery.addWeapon(new weaponsFactory.Weapon(4, 4, 2, 100));

        /* Gestion des personnages */
        _this.chars = [];
    })();
};

Game.prototype.init = function() {

};

Game.prototype.close = function() {

};

Game.prototype.addCharacter = function() {
    var char = new charFactory.Character(this.chars.length - 1, 0, 0);
    this.chars.push(char);
    return char;
};

function initServer() {
    return new Game();
}

function closeServer() {

}

module.exports = {
    initServer: initServer,
    closeServer: closeServer,
    Game: Game
};