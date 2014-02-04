
var Game = new function() {

    this.FIELD_WIDTH = 20;
    this.FIELD_HEIGHT = 24;

    var self = this;

    // move field ahead, GameState, Seq[Move] => GameState
    // returns copy of given game state
    this.getNext = function(gameState, moves) {
        var result = $.extend(true, {}, gameState);
        result.index++;
        var zipped = result.movingBlocks.zip(moves)
        zipped.foreach(function(tuple) { self.getNextMovingBlock(tuple[0], tuple[1]); });
        return result;
    }

    // modify movingBlock according to given move
    this.getNextMovingBlock = function(movingBlock, move) {

        var newNextMove = Math.min(Math.max(movingBlock.nextMove - 1, 0), movingBlock.speed);

        // handle falling move now
        if (movingBlock.nextFall <= 1) {
            movingBlock.nextFall = movingBlock.speed;
            movingBlock.nextMove = 0;

            if (movingBlock.y < this.FIELD_HEIGHT - 1) // falling piece
            {
                movingBlock.y++;
                movingBlock.nextMove = newNextMove;
            }
            else // new piece
            {
                movingBlock.index++;
                movingBlock.y = 0;
                movingBlock.nextMove = 0;
                if (movingBlock.x < this.FIELD_WIDTH - 1) // new piece (left)
                    movingBlock.x++;
                else // new piece (right)
                    movingBlock.x = 0;
            }
        }
        else // wait with falling
        {
            movingBlock.nextFall--;
            movingBlock.nextMove = newNextMove;
        }

        // handle player move
        if (!(movingBlock.nextFall == movingBlock.speed || newNextMove > 0 || (move.x == 0 && move.y == 0)))
        {
            movingBlock.nextMove = Math.floor(movingBlock.speed / 5);
            movingBlock.x = Math.min(Math.max(movingBlock.x + move.x, 0), this.FIELD_WIDTH - 1);
            movingBlock.y = Math.min(Math.max(movingBlock.y + move.y, 0), this.FIELD_HEIGHT - 1);
        }
    }

}