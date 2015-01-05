/**
 * Module de gestion de caractère
 */

var width = 16;
var height = 16;

var Character = function(x, y, color) {
    var _this = this;

    (function() {
        _this.color = color;
        _this.height = char.height;
        _this.width = char.width;
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

Character.prototype.getPosition = function() {
    return {
        pos_x: this.pos_x,
        pos_y: this.pos_y,
        velocity_x: this.velocity_x,
        velocity_y: this.velocity_y,
        acceleration_x: this.acceleration_x,
        acceleration_y: this.acceleration_y
    }
}

Character.prototype.update = function(increments) {
    this.pos_x = increments.pos_x;
    this.pos_y = increments.pos_y;
    this.velocity_x = increments.velocity_x;
    this.velocity_y = increments.velocity_y;
    this.acceleration_x = increments.acceleration_x;
    this.acceleration_y = increments.acceleration_y;
};

module.exports = {
    'width': width,
    'height': height,
    'Character': Character
};