var moveCameraTo = function(id) { // gán camera id (làm cái này cho đẹp code)

    cameras.id = id;
}

var moveCamera = function() { // di chuyển camera (vẽ)
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

var generateRandomId = function() { // Trả về mảng đảo của các id player

    var a = [];
    for (var i in users) {
        if (i == socket.id) continue;
        a.push(i);
    }

    return getRandomSortedArray(a);
}

var moveCameraToNextID = function(a) { // Di chuyển camera tới id tiếp theo trong mảng random đã tạo
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

var getRandomSortedArray = function(arr) { // thuật toán bogo-sort
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