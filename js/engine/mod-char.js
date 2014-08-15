/**
 * Module de gestion de caractère
 * Modules nécessaires :
 *      - mod-sprite.js
 */

engineALJP.char = {};

engineALJP.char.Character = function(x, y) {
    var _this = this;

    (function() {
        _this.height = 16;
        _this.width = 16;
        _this.pos_x = x;
        _this.pos_y = y;
        _this.velocity_x = 0;
        _this.velocity_y = 0;
        _this.acceleration_x = 0;
        _this.acceleration_y = 0;
        _this.weight = 200;
        if(typeof state !== 'undefined')
            _this.state = state;
    })();
};

engineALJP.char.Character.prototype.getPosition = function() {
    return {
        pos_x: this.pos_x,
        pos_y: this.pos_y,
        velocity_x: this.velocity_x,
        velocity_y: this.velocity_y,
        acceleration_x: this.acceleration_x,
        acceleration_y: this.acceleration_y
    }
}

engineALJP.char.Character.prototype.update = function(increments) {
    this.pos_x = increments.pos_x;
    this.pos_y = increments.pos_y;
    this.velocity_x = increments.velocity_x;
    this.velocity_y = increments.velocity_y;
    this.acceleration_x = increments.acceleration_x;
    this.acceleration_y = increments.acceleration_y;
};

engineALJP.char.Character.prototype.draw = function(ctx) {
    engineALJP.canvasExtension.drawRotatedRectangle(Math.floor(this.pos_x), Math.floor(this.pos_y), 16, 16, 0, '#000000');
};