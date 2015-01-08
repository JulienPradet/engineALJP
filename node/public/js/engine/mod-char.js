/**
 * Module de gestion de caractère
 */

engineALJP.char = {};

engineALJP.char.width = 16;
engineALJP.char.height = 16;

engineALJP.char.Character = function(id, x, y, color) {
    var _this = this;

    (function() {
        _this.id = id;
        _this.color = color;
        _this.height = engineALJP.char.height;
        _this.width = engineALJP.char.width;
        _this.pos_x = x;
        _this.pos_y = y;
    })();
};

engineALJP.char.Character.prototype.getPosition = function() {
    return {
        pos_x: this.pos_x,
        pos_y: this.pos_y
    }
};

engineALJP.char.Character.prototype.setPosition = function(position) {
    this.pos_x = position.pos_x;
    this.pos_y = position.pos_y;
};

engineALJP.char.Character.prototype.draw = function(ctx, offsetX, offsetY) {
    engineALJP.canvasExtension.drawRotatedRectangle(this.pos_x - offsetX, this.pos_y - offsetY, 16, 16, 0, this.color);
};