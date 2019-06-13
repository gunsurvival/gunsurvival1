function AWM() {

    this.bullet = [];

    this.attack = function(angle, x, y, id) {
        this.bullet.push({
            frame: 200,
            a: angle,
            x: x,
            y: y,
            id: id
        });
    }

    this.drawBullet = function() {
        for (let i in this.bullet)
            if (this.bullet[i].frame > 0) {
                this.bullet[i].frame -= 4;

                let x = this.bullet[i].x;
                let y = this.bullet[i].y;
                let a = this.bullet[i].a;
                let frame = this.bullet[i].frame;

                let xx = x + 5 * cos(a) * (200 + 5 - frame);
                let yy = y + 5 * sin(a) * (200 + 5 - frame);
                image(images.awmBullet, xx, yy);
                socket.emit('private.checkColide', { x: xx, y: yy, i: i }, 'awm', this.bullet[i].id);
                // console.log(frame);
            } else {
                this.bullet.splice(i, 1);
            }
    }
}