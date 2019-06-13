function Hand() {

    this.punch = [];

    this.attack = function(angle, x, y) {
        this.punch.push({
            frame: 80,
            a: angle,
            x: x,
            y: y
        });
    }

    this.attack = function() {
        return;
    }

    this.drawBullet = function() {
        return;
    }


}