// "use strict";

var users = {},
    socket = io(),
    map,
    index = -1,
    ids = [],
    background_color,
    weapons,
    _scale = {},
    // onHand_i = 0, //index onHand
    mapWidth,
    mapHeight;



function preload() {

    noLoop();

    frameRate(60);
    images = {
        ak47:  loadImage('pic/ak47.png'),
        ak47Bullet: loadImage('pic/ak47Bullet.png'),
        awm: loadImage('pic/awm.png'),
        awmBullet: loadImage('pic/awmBullet.png'),
        hand: loadImage('pic/hand.png'),
        player: loadImage('pic/player.png'),
        playerDead: loadImage('pic/playerDead.png'),
        tree3: loadImage('pic/tree.png'),
        stone: loadImage('pic/stone.png'),
        noshoot: loadImage('pic/noshoot.png')
    }

    document.addEventListener('keyup', (e) => { // di chuyển
        if (e.key == "w" || e.key == "a" || e.key == "s" || e.key == "d") {
            socket.emit('public.keyup', e.key);
        }
    })

    socket.on('debug', (type, data) => {
        if (type == 'circle') {
            ellipse(data.x, data.y, 50);
            noLoop();
        }
    })

    socket.on('public.hide', (hide, id) => {
        users[id].hide = hide;
        // console.log(hide);
    })

    socket.on('public.map', (data, mWidth, mHeight) => { // gửi sơ đồ map
        map = createGraphics(mWidth, mHeight);
        // for (var x = 0; x<=width; x++){
        //     for (var y = 0; y<=height; y++)
        //         for (var i in data)
        //             if (data[i].x == x && data[i].y == y)
        //                 map.image(images[data[i].type], data[i].x, data[i].y);            
        // }

        mapWidth = mWidth;
        mapHeight = mHeight;
        map.rectMode(CENTER);
        map.imageMode(CENTER);
        for (var i = data.length - 1; i >= 0; i--) {
            map.image(images[data[i].type], data[i].x, data[i].y);
        }
    })

    socket.on('public.delete', id => { // xoá player
        if (id == cameras.id) {
            moveCameraToNextID(index);
        }

        delete users[id];
    })

    // socket.on('public.position', data => { // {x: .. , y: ..}
    //     if (!users[data.id]) {
    //         users[data.id] = new Player(data);
    //     }

    //     users[data.id].position = {
    //         x: data.pos.x,
    //         y: data.pos.y,
    //         angle: users[data.id].position.angle
    //     }
    // })

    socket.on('public.add', data => { // tạo player

        users[data.id] = new Player(data);
        if (data.id == socket.id) {
            cameras = {
                x: data.x,
                y: data.y,
                scale: 0.8,
                top: 100,
                id: data.id
            }
            loop();
            $('#menu').fadeOut(1000, 'linear', () => {
                $('#defaultCanvas0').fadeIn();
                $('#backtomenu').slideDown();
            })
        }
        if (data.id != socket.id)
            ids.push(data.id);
    })

    socket.on('public.angle', (a, id) => { // góc quay của player
        if (!users[id]) return;
        users[id].target.angle = a;
        // console.log(a);
    })

    socket.on('public.attack', data => {
        users[data.id].attack(data.angle, data.id);
    })

    socket.on('private.watch', () => {
        moveCameraToNextID(index);
    })

    socket.on('public.changeWeapon', data => {
        if (data.id == socket.id)
            switch (data.gun) {
                case 'ak47':
                    cameras.scale = 0.8;
                    break;
                case 'awm':
                    cameras.scale = 0.6;
                    break;
                case 'hand':
                    cameras.scale = 1;
                    break;
            }
        users[data.id].gun = data.gun;

    })

    socket.on('public.hit', (blood, id) => {
        users[id].blood = blood;

    })

    socket.on('public.deleteBullet', (gun, i) => {
        weapons[gun].bullet.splice(i, 1);
    })

    socket.on('public.dead', id => {
        users[id].dead = true;
        users[id].blood = 0;
        users[id].img = images['playerDead'];
        if (id == socket.id) {
            moveCameraToNextID(index);
        }
    })

    socket.on('public.move', data => {
        if (!users[data.id]) {
            users[data.id] = new Player(data);
        }

        users[data.id].target.x = data.x;
        users[data.id].target.y = data.y;

    })

    socket.on('private.ping', time => {
        let ping = Date.now() - time;
        $('#ping').html(ping + 'ms');
        socket.emit('private.ping', Date.now(), frameRate());
    })
}

function setup() {

    (function setting() { // options
        createCanvas(window.innerWidth, window.innerHeight);
        imageMode(CENTER);
        rectMode(CENTER);

        background_color = "#668D39";
    })()

    socket.emit('private.ping', Date.now());

    weapons = new Weapon();

    

    drawMap = function() { // vẽ bản đồ
        push();
        image(map, mapWidth / 2, mapHeight / 2);
        pop();
    }

    drawPositionDetail = function() {
        textFont('Georgia', 30/cameras.top);
        let a = Math.floor(users[cameras.id].position.x) + '     ' + Math.floor(users[cameras.id].position.y);
        text(a, (cameras.x - a.length * 5)/cameras.top, (cameras.y + height / 2 - 20)/cameras.top); // draw position
    }

    drawMeIfHiding = function() {
        if (users[socket.id].hide) {
            tint(255, 127);
            users[socket.id].draw();
            noTint();
        }
    }

    drawNames = function() {
        for (let i in users) {
            try {
                if (users[i].hide && i != socket.id) continue;
                let t;
                if (users[i].blood > 0)
                    t = users[i].name + ' - ' + Math.floor(users[i].blood);
                else
                    t = users[i].name + ' - DEAD';
                textFont('Georgia', 25);
                text(t, users[i].position.x - t.length * 5, users[i].position.y - 40);
            } catch (e) { console.log(e) }
        }

    }

    drawCharacters = function() { // vẽ player  
        for (let i in users) {
            if (!users[i].hide)
                users[i].draw();
        }

    }

    moveCameraTo = function(id) { // gán camera id (làm cái này cho đẹp code)

        cameras.id = id;
    }

    moveCamera = function() { // di chuyển camera (vẽ)
        cameras.top = lerp(cameras.top, cameras.scale, 0.1);
        cameras.x = lerp(cameras.x, users[cameras.id].position.x * cameras.scale, 0.1);
        cameras.y = lerp(cameras.y, users[cameras.id].position.y * cameras.scale, 0.1);
        // translate(width / 2 - cameras.x, height / 2 - cameras.y);
        translate(width / 2 - cameras.x, height / 2 - cameras.y);
        if (cameras.id != socket.id) {
            let t = 'You are watching ' + users[cameras.id].name;
            // alert(t.length)
            textFont('Georgia', 20);
            text(t, cameras.x - t.length * 5, cameras.y - 200);
        }
    }

    getRandomSortedArray = function(arr) { // thuật toán bogo-sort
        var count = arr.length,
            temp, index;

        while (count > 0) {
            index = Math.floor(Math.random() * count);
            count--;
            temp = arr[count];
            arr[count] = arr[index];
            arr[index] = temp;
        }

        return arr; //Bogosort with no điều kiện dừng
    }

    generateRandomId = function() { // Trả về mảng đảo của các id player

        var a = [];
        for (var i in users) {
            if (i == socket.id) continue;
            a.push(i);
        }

        return getRandomSortedArray(a);
    }

    moveCameraToNextID = function(a) { // Di chuyển camera tới id tiếp theo trong mảng random đã tạo
        var ok = false;

        for (var i = a + 1; i < ids.length; i++) {
            if (ids[i] && users[ids[i]]) {
                ok = true;
                break;
            }
        }

        if (ok) {
            index = i;
            moveCameraTo(ids[i]);
        } else {
            ids = generateRandomId();
            index = -1;
            moveCameraTo(socket.id);
        }
    }
}

function keyPressed() {
    if (keyCode == 32) {
        socket.emit('private.watch');
    }
}

function draw() {
    // if (!focused) {return}
    if (!cameras) return; // lâu lâu client mạng lag chưa load kịp nên có thể xảy ra lỗi undefine

    $('#fps').html('FPS: ' + Math.floor(frameRate()));

    background('#73a37e');
    moveCamera();
    scale(cameras.top);
    image(images.noshoot, mapWidth / 2, mapHeight / 2);
    drawCharacters();
    drawMap();
    drawMeIfHiding();
    drawNames();
    checkInput();
    drawPositionDetail();

}