var drawMap = function() { // vẽ bản đồ
    push();
    image(_map, mapWidth / 2, mapHeight / 2);
    pop();
}

var drawPositionDetail = function() {
    textFont('Georgia', 30 / cameras.top);
    let a = Math.floor(users[cameras.id].position.x) + '     ' + Math.floor(users[cameras.id].position.y);
    text(a, (cameras.x - a.length * 5) / cameras.top, (cameras.y + height / 2 - 20) / cameras.top); // draw position
}

var drawMeIfHiding = function() {
    if (users[socket.id].hide) {
        tint(255, 127);
        users[socket.id].draw();
        noTint();
    }
}

var drawNames = function() {
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

var drawCharacters = function() { // vẽ player  
    for (let i in users) {
        // if (users[i].position.x < cameras.x - width / 2 - users[i].size.w ||
        //     users[i].position.x > cameras.x + width / 2 + users[i].size.w ||
        //     users[i].position.y > cameras.y + height / 2 + users[i].size.h ||
        //     users[i].position.y < cameras.y - height / 2 - users[i].size.h) {

        // } else
        //     users[i].draw();
        if (!users[i].hide)
            users[i].draw();
    }
}