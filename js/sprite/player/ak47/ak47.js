function AK47() {

    this.bullet = [];
    
    this.attack = function(angle, x, y, id) {
        this.bullet.push({
            frame: 150,
            a: angle,
            x: x,
            y: y,
            id: id
        });
    }

    this.drawBullet = function() {
        for (let i in this.bullet)
            if (this.bullet[i].frame > 0) {
                this.bullet[i].frame -= 3;

                let x = this.bullet[i].x;
                let y = this.bullet[i].y;
                let a = this.bullet[i].a;
                let frame = this.bullet[i].frame;

                let xx = x + 5 * cos(a) * (150 + 5 - frame);
                let yy = y + 5 * sin(a) * (150 + 5 - frame);
                image(images.ak47Bullet, xx, yy);
                socket.emit('private.checkColide', { x: xx, y: yy, i: i }, 'ak47', this.bullet[i].id);
                // console.log(frame);
            } else {
                this.bullet.splice(i, 1);
            }
    }
}