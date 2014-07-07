/**
 * Module d'extension des propriétés canvas
 * Permet notamment de gérer plus facilement les rotations
 */

engineALJP.canvasExtension = {};

engineALJP.canvasExtension.drawRotatedRectangle = function(x, y, width, height, angle, fillStyle) {
    var ctx = engineALJP.ctx;
    ctx.save();
    ctx.translate(x + width/2, y + height/2);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.rect(-width/2, -height/2, width, height);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.restore();
};