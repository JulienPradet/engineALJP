/**
 * Module de gestion de caractère
 */

var width = 16;
var height = 16;

var getRandomColorComponent = function() {
    /* On génére un entier aléatoire compris entre 0 inclus et 256 exclus puis on convertit en hexadécimal */
    var rand = Math.floor(Math.random() * 256);
    var component = rand.toString(16);

    if (component.length < 2)
        component = '0' + component;

    return component;
};

var getRandomColor = function() {
    return "#" + getRandomColorComponent() + getRandomColorComponent() + getRandomColorComponent();
};

var Character = function(id, x, y, color) {
    var _this = this;

    (function() {
        _this.id = id;
        _this.height = height;
        _this.width = width;
        _this.pos_x = x;
        _this.pos_y = y;
        _this.velocity_x = 0;
        _this.velocity_y = 0;
        _this.acceleration_x = 0;
        _this.acceleration_y = 0;
        _this.weight = 200;
        if(typeof state !== 'undefined')
            _this.state = state;
        if(typeof color !== 'undefined') {
            _this.color = color;
        } else {
            _this.color = getRandomColor();
        }
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
};

Character.prototype.update = function(increments) {
    this.pos_x = increments.pos_x;
    this.pos_y = increments.pos_y;
    this.velocity_x = increments.velocity_x;
    this.velocity_y = increments.velocity_y;
    this.acceleration_x = increments.acceleration_x;
    this.acceleration_y = increments.acceleration_y;
};

Character.prototype.setPosition = function(position) {
    this.pos_x = position.pos_x;
    this.pos_y = position.pos_y;
};

module.exports = {
    width: width,
    height: height,
    Character: Character
};