/**
 * Module de gestion de caractère
 */

var mapFactory = require('./mapFactory')

var Weapon = function(width, height, velocity, damage) {
    var _this = this;

    (function() {
        _this.height = height;
        _this.width = width;
        _this.velocity = velocity;
        _this.damage = damage;
        _this.life = 100;
    })();
};

Weapon.prototype.getBullet = function(x, y, velocity) {
    return {
        "velocity_x": velocity.x * 2,
        "velocity_y": velocity.y * 2,
        "damage": this.damage,
        "life": this.life,
        "bloc": new mapFactory.Bloc({
            x: x,
            y: y,
            height: this.height,
            width: this.width,
            color: "blue"
        })
    };
};

var WeaponeryManager = function() {
    var _this = this;

    (function() {
        _this.weapons = [];
        _this.currentWeapon = false;
        _this.bullets = [];
        _this.lastFire = 0;
    })();
};

WeaponeryManager.prototype.addWeapon = function(weapon) {
    if(weapon instanceof engineALJP.weaponery.Weapon) {
        this.weapons.push(weapon);
        this.currentWeapon = weapon;
    }
};

WeaponeryManager.prototype.fire = function(x, y, velocity) {
    if(new Date() - this.lastFire > 250 && this.currentWeapon !== false) {
        this.lastFire = new Date();
        var i, length, created = false;
        length = this.bullets.length;
        for(i = 0; i < length; i++) {
            if(this.bullets[i].life <= 0) {
                this.bullets[i] = this.currentWeapon.getBullet(x, y, velocity);
                created = true;
                break;
            }
        }
        if(!created)
            this.bullets.push(this.currentWeapon.getBullet(x, y, velocity));
    }
};

WeaponeryManager.prototype.update = function(time_diff) {
    var i = 0,
        length = this.bullets.length,
        bullet, position;

    var nbBullet = 0;

    for(; i < length; i++) {
        bullet = this.bullets[i];
        if(bullet.life > 0) {
            position = bullet.bloc.getPosition();
            bullet.bloc.setPosition({
                top: position.top + bullet.velocity_y * time_diff / 1000 * 60,
                left: position.left + bullet.velocity_x * time_diff / 1000 * 60
            });
            bullet.life--;
            nbBullet++;
        }
    }

    if(nbBullet == 0)
        this.bullets = [];
};

module.exports = {
    'Weapon': Weapon,
    'WeaponeryManager': WeaponeryManager
};