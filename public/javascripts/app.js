
$(function() {

    var FIELD_WIDTH = 20;
    var FIELD_HEIGHT = 24;
    var latency = 100;

    function update(data) {

        if (data.state) {

            var blocks = data.state.blocks;

            var movingBlocks = data.state.movingBlocks;

            // predict my moving block
            var myBlock = movingBlocks[0];

            // calculate latency
            if (data.state.maybeMove)
            {
                var delay = Date.now() - data.state.maybeMove.date;
                latency = Math.max(delay, 0)
            }


            var blockDivs = [];
            for (var y = 0; y < FIELD_HEIGHT; y++)
            {
                for (var x = 0; x < FIELD_WIDTH; x++)
                {
                    var index = x + y * FIELD_WIDTH;
                    if (movingBlocks.exists(function(b) { return b.y == y && b.x == x; }))
                        blockDivs.push($('<div class="block moving"></div>'))
                    else if (blocks[index])
                        blockDivs.push($('<div class="block fixed"></div>'))
                    else
                        blockDivs.push($('<div class="block"></div>'))
                }
            }

            var field = $('#game-field');
            field.empty();
            field.append(blockDivs);

            $('#output').text(JSON.stringify(movingBlocks))
        }
        else
            console.log(data)
    }

    $(document).keydown(function(e){
        if (e.keyCode == 37) { // left
            send({ move: 'left', date: Date.now() })
        } else if (e.keyCode == 39) { // right
            send({ move: 'right', date: Date.now() })
        } else if (e.keyCode == 40) { // down
            send({ move: 'down', date: Date.now() })
        }
        return false;
    });



    var websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) {
        update({ status: "Connected"})
        $('#connect-button').prop("disabled", true);
    };
    websocket.onclose = function(evt) {
        update({ status: "Disconnected"})
        $('#connect-button').prop("disabled", false);
    };

    websocket.onmessage = function(evt) { update(jQuery.parseJSON(evt.data)) };
    websocket.onerror = function(evt) { update({ status: evt.data}) };

    $('#reset-button').click(function() {
        //send({ action: "reset" });
    })

    $('#disconnect-button').click(function() {
        websocket.close();
    })

    function send(obj) {
        websocket.send(JSON.stringify(obj));
    }

})