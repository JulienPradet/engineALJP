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
    console.log("drawBullet");
//    this.bloc.draw(ctx, offsetX, offsetY);
    var x = this.bloc.x - offsetX;
    var y = this.bloc.y - offsetY;

    ctx.rect(100, 100, 4, 4);
    ctx.fillStyle = "#000000";
    ctx.fill();

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
    for(; i < length; i++) {
        if(typeof this.bullets[i] !== "undefined") {
            this.bullets[i].draw(ctx, offsetX, offsetY);
        }
    }
    this.bullets = [];
};