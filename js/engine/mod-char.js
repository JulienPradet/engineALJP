/**
 * Module de gestion de caractère
 * Modules nécessaires :
 *      - mod-sprite.js
 */

engineALJP.char = {};

engineALJP.char.Character = function(x, y) {
    var _this = this;

    (function() {
        _this.x = x;
        _this.y = y;
        if(typeof state !== 'undefined')
            _this.state = state;
    })();
};

engineALJP.char.Character.prototype.update = function(x, y) {
    this.x = this.x + x;
    this.y = this.y + y;
}

engineALJP.char.Character.prototype.draw = function(ctx) {
    engineALJP.canvasExtension.drawRotatedRectangle(this.x, this.y, 10, 10, 0, '#000000');
};