// "use strict";

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 3000;
var collide = require('p5.collide.js');
var requires = require('require_crafting.js');
var users = {},
    map = {},
    speed = {};

var canvasWidth = 6000;
var canvasHeight = 3000;

app.get('/', function(req, res) {
    var express = require('express');
    app.use(express.static(path.join(__dirname)));
    res.sendFile(path.join(__dirname, 'index.html'));
});

http.listen(port, () => {

    let arr = ['bush1', 'bush2', 'bush3', 'bush4', 'tree', 'grass'];
    arr = ['tree3', 'stone'];

    map.all = [];

    for (var i = 1; i <= 90; i++) {
        let x = Math.floor(Math.random() * (canvasWidth - 200)) + 100;
        let y = Math.floor(Math.random() * (canvasHeight - 200)) + 100;
        let type = arr[Math.floor(Math.random() * arr.length)];
        map.all.push({
            x: x,
            y: y,
            type: type
        });
        if (!map[type])
            map[type] = [];
        map[type].push({ x: x, y: y });
    }

    console.log('Server started on port:  *' + port);
})

//================MAIN=================

delayLeftClick = function(id) {

    let a = users[id].stat.delay;
    switch (users[id].bag[users[id].stat.onHand]) {
        case 'ak47':
            time = 200;
            break;
        case 'awm':
            time = 1500;
            break;
        case 'hand':
            time = 1000;
            break;
    }

    if (!users[id].stat.delay) {
        users[id].stat.delay = true;

        setTimeout(() => {
            if (users[id])
                users[id].stat.delay = false;
        }, time);
    }

    return a;
}

scanVision = function(id) {

}

giveTousersAfter = function(thing, id) {
    //delete some need thing to craft thing--done
    for (var i in requires[thing]) {
        users[id].bag[i] -= requires[thing][i];
    }

    users[id].onCrafting = true;

    setTimeout(() => {
        users[id].onCrafting = false;
        users[id].bag[thing]++;
        socket.emit('private.addGun', thing);
    }, require[thing].time);
}

addNewConnected = function(id, name) {

    users[id] = {
        name: name,

        position: {
            // x: Math.random() * 500 + canvasWidth / 2 - 250,
            // y: Math.random() * 500 + canvasHeight / 2 - 250,
            x: 0,
            y: 0,
            atan2: 0
        },

        stat: {
            blood: 100,
            hunger: 100,
            water: 100,
            temperature: 100,
            bleeding: 0,
            breath: 100,
            onCrafting: false,
            delay: false,
            speed: 4,
            defense: 0,
            onHand: 0,
            hide: { boo: false, id: -1 },
            dead: false,
            delay: false
        },

        keydown: {
            'w': false,
            'a': false,
            's': false,
            'd': false
        },

        bag: [
            'ak47',
            'awm',
            'hand'
        ]
    }


}

io.on('connection', socket => {

    socket.on('new connect', name => {

        addNewConnected(socket.id, name);

        for (var i in users) { // gửi toạ độ các client đang online
            if (i != socket.id) {
                socket.emit('public.add', { // gửi cho mình dữ liệu các người chơi đang trên server
                    id: i,
                    x: users[i].position.x,
                    y: users[i].position.y,
                    angle: users[i].position.angle,
                    name: users[i].name,
                    dead: users[i].stat.dead,
                    blood: users[i].stat.blood,
                    gun: users[i].bag[users[i].stat.onHand],
                    hide: users[i].stat.hide.boo
                });
            }
        }
        socket.emit('public.map', map.all, canvasWidth, canvasHeight);

        io.emit('public.add', { // gửi cho mình dữ liệu các người chơi đang trên server
            id: socket.id,
            x: users[socket.id].position.x,
            y: users[socket.id].position.y,
            angle: users[socket.id].position.angle,
            name: users[socket.id].name,
            dead: users[socket.id].stat.dead,
            blood: users[socket.id].stat.blood,
            gun: users[socket.id].bag[users[socket.id].stat.onHand],
            hide: users[socket.id].stat.hide.boo
        });
    })

    // socket.on('public.keydown', c => {
    //     if (!users[socket.id] || users[socket.id].dead) return; // kiểm tra tồn tại của 1 socket
    //     users[socket.id].keydown[c] = true;
    //     io.emit('public.position', {
    //          x: users[i].position.x,
    //          y: users[i].position.y,
    //          id: i
    //     });
    // });

    // socket.on('public.keyup', c => {
    //     if (!users[socket.id] || users[socket.id].dead) return;
    //     users[socket.id].keydown[c] = false;
    // })

    socket.on('public.angle', a => {
        if (!users[socket.id]) return;
        if (users[socket.id].stat.dead) a = 0;
        io.emit('public.angle', a, socket.id);
    })

    socket.on('private.watch', () => {
        if (!users[socket.id]) return;
        socket.emit('private.watch');
    })

    socket.on('public.attack', (angle) => {
        if (!users[socket.id] || users[socket.id].stat.dead) return;
        if (!delayLeftClick(socket.id)) {
            if (users[socket.id].stat.hide.boo) {
                io.emit('public.move', {
                    x: users[socket.id].position.x,
                    y: users[socket.id].position.y,
                    id: socket.id
                });

                io.emit('public.hide', false, socket.id);
                users[socket.id].stat.hide.boo = false;
                users[socket.id].stat.hide.id = -1;
            }

            io.emit('public.attack', {
                angle: angle,
                // gun: users[socket.id].bag[users[socket.id].stat.onHand],
                id: socket.id
            });

            // users[socket.id].bullet.push({ angle: atan2, onHand: users[socket.id].onHand });

            // switch (users[socket.id].equipment[users[socket.id].onHand]) {
            //     case 'ak47':
            //         users[socket.id].bullet.push({
            //             distance: 150,
            //             frame: 150,
            //             xx: users[socket.id].position.x,
            //             yy: users[socket.id].position.y,
            //             x: 0,
            //             y: 0
            //         })
            //         break;
            //     case 'usp':
            //         users[socket.id].bullet.push({
            //             distance: 100,
            //             frame: 100,
            //             xx: users[socket.id].position.x,
            //             yy: users[socket.id].position.y,
            //             x: 0,
            //             y: 0
            //         })
            //         break;
            //     case 'hand':
            //         users[socket.id].bullet.push({
            //             distance: 0,
            //             frame: 0,
            //             xx: users[socket.id].position.x,
            //             yy: users[socket.id].position.y,
            //             x: 0,
            //             y: 0
            //         })
            //         break;
            // }
        }
    })

    socket.on('public.changeWeapon', (type, data) => {
        if (!users[socket.id] || users[socket.id].stat.dead) return;
        if (type == 'mouse') {
            if (data > 0) users[socket.id].stat.onHand++;
            if (data < 0) users[socket.id].stat.onHand--;
            if (users[socket.id].stat.onHand > 2) users[socket.id].stat.onHand = 0;
            if (users[socket.id].stat.onHand < 0) users[socket.id].stat.onHand = 2;
        } else {
            users[socket.id].stat.onHand = data;
        }

        // console.log(users[socket.id].bag[users[socket.id].stat.onHand]);

        io.emit('public.changeWeapon', {
            gun: users[socket.id].bag[users[socket.id].stat.onHand],
            id: socket.id
        });
    })

    socket.on('private.checkColide', (data, gun, id) => { //Check va chạm socket.id với đạn
        if (!users[socket.id] || id == socket.id) return;
        let hitPeople = false;
        let dame = 0;
        switch (gun) {
            case 'ak47':
                hitPeople = collide.collideCircleCircle(data.x, data.y, 10, users[socket.id].position.x, users[socket.id].position.y, 52);
                dame = Math.random() * 3 + 5;
                break;
            case 'awm':
                hitPeople = collide.collideCircleCircle(data.x, data.y, 8, users[socket.id].position.x, users[socket.id].position.y, 52);
                dame = Math.random() * 5 + 10;
                break;
        }
        // dame = 0;
        // console.log('checkcollide'+Math.random());
        if (hitPeople) {
            io.emit('public.hit', users[socket.id].stat.blood - dame, socket.id);
            io.emit('public.deleteBullet', gun, data.i);
            users[socket.id].stat.blood -= dame;
            if (users[socket.id].stat.blood <= 0 && !users[socket.id].stat.dead) {
                users[socket.id].stat.dead = true;
                io.emit('public.dead', socket.id);
            }
        } else {
            for (var iStone in map.stone) {
                hitStone = collide.collideCircleCircle(data.x, data.y, 10, map.stone[iStone].x, map.stone[iStone].y, 140);
                if (hitStone) {
                    io.emit('public.deleteBullet', gun, data.i);
                    return;
                }
            }
            for (var iTree in map.tree3) {
                hitTree = collide.collideCircleCircle(data.x, data.y, 10, map.tree3[iTree].x, map.tree3[iTree].y, 30);
                if (hitTree) {
                    io.emit('public.deleteBullet', gun, data.i);
                    return;
                }
            }
        }
    })

    socket.on('public.backtomenu', () => {
        if (!users[socket.id]) return;
        users[socket.id].stat.dead = true;
        socket.broadcast.emit('public.dead', socket.id);
    })

    socket.on('private.ping', (time, fps) => {
        if (users[socket.id]) {
            users[socket.id].stat.speed = 4 / (fps / 60);
            switch (users[socket.id].bag[users[socket.id].stat.onHand]) {
                case 'ak47':
                    users[socket.id].stat.speed *= 0.8;
                    break;
                case 'awm':
                    users[socket.id].stat.speed *= 0.5;
                case 'hand':
                    users[socket.id].stat.speed *= 1;
            }
        }
        // console.log(speed[socket.id]);
        socket.emit('private.ping', time);
    })

    socket.on('public.move', c => {
        // console.log(1);
        let x = users[socket.id].position.x;
        let y = users[socket.id].position.y;
        switch (c) {
            case 'w':
                users[socket.id].position.y -= users[socket.id].stat.speed;
                if (users[socket.id].position.y < 0) {
                    users[socket.id].position.y = 0;
                }
                break;
            case 'a':
                users[socket.id].position.x -= users[socket.id].stat.speed;
                if (users[socket.id].position.x < 0) {
                    users[socket.id].position.x = 0;
                }
                break;
            case 's':
                users[socket.id].position.y += users[socket.id].stat.speed;
                if (users[socket.id].position.y > canvasHeight) {
                    users[socket.id].position.y = canvasHeight;
                }
                break;
            case 'd':
                users[socket.id].position.x += users[socket.id].stat.speed;
                if (users[socket.id].position.x > canvasWidth) {
                    users[socket.id].position.x = canvasWidth;
                }
                break;
        }

        for (let i in map.stone) {
            if (collide.collideCircleCircle(users[socket.id].position.x, users[socket.id].position.y, 51, map.stone[i].x, map.stone[i].y, 200 - 64)) {
                users[socket.id].position.x = x;
                users[socket.id].position.y = y;
                // socket.emit('debug', 'circle', {x:map.stone[i].x,y :map.stone[i].y});
            }
        }

        var last = users[socket.id].stat.hide.boo;

        for (let i in map.tree3) {
            if (collide.collideCircleCircle(users[socket.id].position.x, users[socket.id].position.y, 51, map.tree3[i].x, map.tree3[i].y, 30)) {
                users[socket.id].position.x = x;
                users[socket.id].position.y = y;
            }
            if (!collide.collideCircleCircle(users[socket.id].position.x, users[socket.id].position.y, 51, map.tree3[i].x, map.tree3[i].y, 140)) {
                if (i != users[socket.id].stat.hide.id && users[socket.id].stat.hide.boo) {
                    users[socket.id].stat.hide.boo = false;
                    users[socket.id].stat.hide.id = -1;
                }
            } else {
                    users[socket.id].stat.hide.boo = true;
                    users[socket.id].stat.hide.id = i;
                    break;
            }
        }

        if (users[socket.id].stat.hide.boo != last) {
            // console.log(users[socket.id].hide.boo + ' ' + Math.random());
            io.emit('public.hide', users[socket.id].stat.hide.boo, socket.id);
        }

        if (!users[socket.id].stat.hide.boo)
            io.emit('public.move', {
                x: users[socket.id].position.x,
                y: users[socket.id].position.y,
                id: socket.id
            });
        else
            socket.emit('public.move', {
                x: users[socket.id].position.x,
                y: users[socket.id].position.y,
                id: socket.id
            });
    })

    socket.on('disconnect', () => {
        if (!users[socket.id]) return;
        io.emit('public.delete', socket.id);
        delete users[socket.id];
    })
})

// setInterval(function() {
//     for (let i in users) {
//         if (users[i].dead) continue;
//         for (let c in users[i].keydown) { // di chuyển
//             if (users[i].keydown[c])
//                 switch (c) {
//                     case 'w':
//                         users[i].position.y -= 2 / 10;
//                         if (users[i].position.y < -canvasHeight / 2) {
//                             users[i].position.y = -canvasHeight / 2;
//                         }
//                         break;
//                     case 'a':
//                         users[i].position.x -= 2 / 10;
//                         if (users[i].position.x < -canvasWidth / 2) {
//                             users[i].position.x = -canvasWidth / 2;
//                         }
//                         break;
//                     case 's':
//                         users[i].position.y += 2 / 10;
//                         if (users[i].position.y > canvasHeight / 2 + 250) {
//                             users[i].position.y = canvasHeight / 2 + 250;
//                         }
//                         break;
//                     case 'd':
//                         users[i].position.x += 2 / 10;
//                         if (users[i].position.x > canvasWidth / 2 + 250) {
//                             users[i].position.x = canvasWidth / 2 + 250;
//                         }
//                         break;
//                 }
//         }
//         // for (let j in users[i].bullet) {
//         //     let data = users[i].bullet[j];
//         //     users[i].bullet[j].frame--;
//         //     users[i].bullet[j].x = data.xx + 5 * Math.cos(data.angle) * (data.distance - (users[i].bullet[j].frame));
//         //     users[i].bullet[j].y = data.yy + 5 * Math.sin(data.angle) * (data.distance - (users[i].bullet[j].frame));
//         //     if (users[i].bullet[j].frame < 0) {
//         //         users[i].bullet.splice(j, 1);
//         //         continue;
//         //     }
//         //     console.log(users[i].bullet[j].frame);

//         // }
//     }

// }, 1000 / 60 - users.length);