function Player(data/*id, x, y, name, isDead*/) {

    this.name = data.name || console.log("Error when getting the name");
    this.id = data.id || console.log("Error when getting the ID");
    // this.onHand = data.onHand || 'first';
    this.gun = data.gun || 'hand';
    this.dead = data.dead || false;
    this.blood = data.blood || 100;
    this.hide = data.hide || false;  
    this.bullet = [];

    this.position = {
        x: data.x || 0,
        y: data.y || 0,
        angle: data.angle || 0
    }

    this.target = {
        x : data.x || 0,
        y : data.y || 0,
        angle: data.angle || 0
    }

    this.size = {
        w: 51,
        h: 51
    }

    if (this.dead) {
        this.img = images['playerDead'];
    } else
        this.img = images['player'];

    this.attack = function(angle, id) {
        weapons[this.gun].attack(angle, this.position.x, this.position.y,id);
    }

    this.draw = function() {
        fill(255);
        if (this.target.x)
            this.position.x = lerp(this.position.x,this.target.x,0.3);
        if (this.target.y)
            this.position.y = lerp(this.position.y,this.target.y,0.3);
        if (this.target.angle){
                this.position.angle = radians(lerp(degrees(this.position.angle),degrees(this.target.angle),1));
                // this.position.angle = this.target.angle;
        }
        //vẽ đường đạn	
        for (let i in weapons) {
            weapons[i].drawBullet();
        }
        if (!this.dead) {
            // vẽ player
            push();
            translate(this.position.x, this.position.y);
            rotate(this.position.angle);
            image(images[this.gun], 15, 25); //left hand
            pop();

            push();
            translate(this.position.x, this.position.y);
            rotate(this.position.angle);
            image(images[this.gun], 15, -25); //right hand
            pop();
        }

        push(); // lưu trạng thái hiện tại
        translate(this.position.x, this.position.y); // tạo trạng thái mới
        rotate(this.position.angle); // tính hướng từ mình tới chuột -> mũi tên từ mình tới chuột -> lấy đầu mũi tên trừ gốc mũi tên
        image(this.img, 0, 0);
        pop(); // trở về trạng thái cũ

    }

    this.getAngle = function() {
        // push();
        if (this.hide && this.id!=socket.id) return;
        let vecMouse = createVector(mouseX, mouseY);
        let vecPlayer = createVector(width / 2 - this.position.x + this.target.x, height / 2 - this.position.y + this.target.y);
        // let vecPlayer = createVector(width / 2 - cameras.x/cameras.scale+ this.target.x, height / 2 - cameras.y/cameras.scale + this.target.y);
        // translate(width / 2 - this.position.x + this.target.x, height / 2 - this.position.y + this.target.y)
        // ellipse(0, 0, 30);
        // fill(255,0,0);
        // translate(mouseX, mouseY);
        // ellipse(0, 0,30);
        let direction = p5.Vector.sub(vecMouse, vecPlayer); // vector chỉ hướng từ player tới chuột
        let angle = direction.heading(); // chuyển vector chỉ hướng thành góc
        // pop();
        return angle;
    }
}