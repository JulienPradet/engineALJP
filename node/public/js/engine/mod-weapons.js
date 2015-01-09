/**
 * Module de gestion de caractère
 */

engineALJP.weaponery = {};

engineALJP.weaponery.Bullet = function(x, y, height, width, color) {
    var _this = this;

    (function() {
        if(typeof height === "undefined")
            height = 4;
        if(typeof width === "undefined")
            width = 4;
        if(typeof color === "undefined")
            color = "#000000";

        _this.bloc = new engineALJP.map.Bloc({
            x: x,
            y: y,
            height: height,
            width: width,
            background: color
        });
    })();
};

engineALJP.weaponery.Bullet.prototype.draw = function(ctx, offsetX, offsetY) {
    engineALJP.canvasExtension.drawRotatedRectangle(this.bloc.x - offsetX, this.bloc.y - offsetY, 4, 4, 0, "#000000");
};

engineALJP.weaponery.WeaponeryManager = function() {
    var _this = this;

    (function() {
        _this.bullets = [];
    })();
};

engineALJP.weaponery.WeaponeryManager.prototype.draw = function(ctx, offsetX, offsetY) {
    var i = 0,
        length = this.bullets.length;
    var bullets = this.bullets;
    for(; i < length; i++) {
        if(typeof bullets[i] !== "undefined") {
            bullets[i].draw(ctx, offsetX, offsetY);
        }
    }

};