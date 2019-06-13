// var socket = io();

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
    _map = createGraphics(mWidth, mHeight);
    // for (var x = 0; x<=width; x++){
    //     for (var y = 0; y<=height; y++)
    //         for (var i in data)
    //             if (data[i].x == x && data[i].y == y)
    //                 map.image(images[data[i].type], data[i].x, data[i].y);            
    // }

    // map.translate(cWidth/2,cHeight/2);
    mapWidth = mWidth;
    mapHeight = mHeight;
    _map.rectMode(CENTER);
    _map.imageMode(CENTER);
    for (var i = data.length - 1; i >= 0; i--) {
        _map.image(images[data[i].type], data[i].x, data[i].y);
    }
    // console.log(map);
})

socket.on('public.delete', id => { // xoá player

    console.log(id);

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
    console.log(data.id);
    if (data.id == socket.id) {
        cameras = {
            x: data.x,
            y: data.y,
            scale: 1,
            top: 1,
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
        switch (users[data.id].gun) {
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
/*
document.addEventListener('keyup', (e) => { // di chuyển
    if (e.key == "w" || e.key == "a" || e.key == "s" || e.key == "d") {
        socket.emit('public.keyup', e.key);
    }
})*/