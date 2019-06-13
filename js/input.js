checkInput = function() { // kiểm tra nút được ấn
        socket.emit('public.angle', users[socket.id].getAngle());
        if (keyIsDown(49)) //1
            socket.emit('public.changeWeapon', 'button', 0);
        if (keyIsDown(50)) //2
            socket.emit('public.changeWeapon', 'button', 1);
        if (keyIsDown(51)) //3
            socket.emit('public.changeWeapon', 'button', 2);

        if (mouseIsPressed) {
            socket.emit('public.attack', users[socket.id].getAngle());
        }

        // if (keyIsDown(65))
        //     socket.emit('public.keydown', 'a');

        // if (keyIsDown(87))
        //     socket.emit('public.keydown', 'w');

        // if (keyIsDown(83))
        //     socket.emit('public.keydown', 's');

        // if (keyIsDown(68))
        //     socket.emit('public.keydown', 'd');


        if (keyIsDown(65))
            socket.emit('public.move', 'a');

        if (keyIsDown(87))
            socket.emit('public.move', 'w');

        if (keyIsDown(83))
            socket.emit('public.move', 's');

        if (keyIsDown(68))
            socket.emit('public.move', 'd');

    }

    function mouseWheel(event) {
    // if (event.delta > 0) onHand_i++;
    // if (event.delta < 0) onHand_i--;
    // if (onHand_i > 2) onHand_i = 0;
    // if (onHand_i < 0) onHand_i = 2

    socket.emit('public.changeWeapon','mouse', event.delta);
}

function windowResized() {

    resizeCanvas(window.innerWidth, window.innerHeight);
}