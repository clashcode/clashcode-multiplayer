
var GameHandler = new function() {

    var self = this;
    this.TICK_LENGTH = 100;

    this.baseGameState = null;
    this.renderGameState = null;

    this.localMoves = [];

    this.latency = 50;
    this.lastServerTick = Date.now();

    /** receive updates from server */
    this.updateBase = function(gameState) {
        this.baseGameState = gameState;

        // remove server handled moves
        if (gameState.maybeMove) {

            var move = gameState.maybeMove;
            this.localMoves = this.localMoves.filter(function(m) { return m.clientDate > move.clientDate; })

            // refresh latency
            var latency = (Date.now() - move.clientDate - move.delay) / 2;
            this.latency = this.latency * 0.9 + 0.1 * latency; // smooth latency
            this.lastServerTick = move.clientDate + move.delay + this.latency;
            console.log("latency: " + this.latency + ", local:" + this.localMoves.length);
        }

        this.predict();
    }

    /** handle local move */
    this.handleMove = function(move) {

        // predicted server tick for this move
        var newTick = this.predictTick(move);

        // remove overwritten moves
        this.localMoves = this.localMoves.filter(function(m) { return self.predictTick(m) != newTick })

        this.localMoves.push(move);
        this.predict();
    }

    /** returns predicted server tick date for given move */
    this.predictTick = function(move) {
        var predictedArrival = move.clientDate + this.latency;
        return Math.floor((predictedArrival - this.lastServerTick) / this.TICK_LENGTH);
    }

    /** predict render state */
    this.predict = function() {

        var renderState = this.baseGameState;

        // predict all local moves
        this.localMoves.foreach(function(move) {
            renderState = Game.getNext(renderState, [ move ]);
        })
        this.renderGameState = renderState;

        if (!this.running) this.render();
    }

    /** render the renderGameState */
    this.running = false;
    this.render = function() {
        this.running = true;

        var blockDivs = [];
        var movingBlocks = this.renderGameState.movingBlocks;
        var blocks = this.renderGameState.blocks;
        for (var y = 0; y < Game.FIELD_HEIGHT; y++)
        {
            for (var x = 0; x < Game.FIELD_WIDTH; x++)
            {
                var index = x + y * Game.FIELD_WIDTH;
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

        setTimeout(function() { self.render() }, 50);
    }

}

$(function() {

    /** handle network messages */
    function update(data) {

        if (data.state) {
            GameHandler.updateBase(data.state);
            // calculate latency
            /*
            if (data.state.maybeMove)
            {
                var delay = Date.now() - data.state.maybeMove.date;
                latency = Math.max(delay, 0)
            }
            */
        }
        else
            console.log(data)
    }

    /** handle keys */
    $(document).keydown(function(e){
        var move = { clientDate: Date.now(), delay: 0 }
        if (e.keyCode == 37) { // left
            move.x = -1; move.y = 0;
            GameHandler.handleMove(move)
            send(move)
        } else if (e.keyCode == 39) { // right
            move.x = +1; move.y = 0;
            GameHandler.handleMove(move)
            send(move)
        } else if (e.keyCode == 40) { // down
            move.x = 0; move.y = +1;
            GameHandler.handleMove(move)
            send(move)
        }
        return false;
    });

    /** handle networking */
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