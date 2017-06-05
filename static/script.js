var websoc, X, Y;

    function onLoad() {
        //page load, web socket creation, processing answer from server
        websoc = new WebSocket("ws://"+location.host+"/websocket");
        var coordinates = document.getElementById('coordinates');
        var moving_icon = document.getElementById('moving_icon');

        websoc.onmessage = function(e) {
           var error = JSON.parse(e.data)['error'];
           if (error) {
                alert(error);
           }
           else {
                X = JSON.parse(e.data)['X'];
                Y = JSON.parse(e.data)['Y'];

                move(document.documentElement.clientWidth*X*0.01, document.documentElement.clientHeight*Y*0.01);
                coordinates.placeholder = X + ";" + Y;
           }
        }
        coordinates.focus();

        setInterval(function() {
        //keep connection alive, for HEROKU
            websoc.send("PING");
            }, 50000);
        }

    function coordinatesKeyUp(event) {
        //processing Enter key in coordinates input
        event = event || window.event;
        if (event.keyCode == 13) {
            if (checkCoordinates(coordinates.value)) {
                websoc.send(coordinates.value);
            }
            else {
                alert("Нарушен формат значений: X;Y")
            }
            coordinates.value="";
        }
    }

    function checkCoordinates(value) {
        //check coordinates for matching regex
        var re = /^\d{1,3};\d{1,3}$/;
        return re.test(value);
    }

    function move(left, top) {
        //move icon without crossing the borders
        if (left + moving_icon.width > document.documentElement.clientWidth)
            left = document.documentElement.clientWidth - moving_icon.width;
        if (top + moving_icon.height > document.documentElement.clientHeight)
            top = document.documentElement.clientHeight - moving_icon.height;
        if (top < 35)
            top = 35;

        moving_icon.style.left = (left/document.documentElement.clientWidth)*100+"%";
        moving_icon.style.top = (top/document.documentElement.clientHeight)*100+"%";
    }

    function resize() {
        //save icon position after resize
        move(document.documentElement.clientWidth*X*0.01, document.documentElement.clientHeight*Y*0.01);
    }

    window.onclick = function(e) {
        //move icon by mouse click
        if (e.target != "[object HTMLInputElement]")
            websoc.send(Math.ceil((event.clientX/document.documentElement.clientWidth)*100)+";"+Math.ceil((event.clientY/document.documentElement.clientHeight)*100));
    }