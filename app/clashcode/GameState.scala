package clashcode.logic

case class Move(
                x: Int = 0,
                y: Int = 0,
                clientDate: Long = 0,
                delay: Long = 0) {
  def isEmpty = (x == 0 && y == 0)
}

case class MovingBlock(index: Int, x: Int, y: Int, speed: Int, nextFall: Int, nextMove: Int) {

  // move one piece
  def getNext(move: Move) : MovingBlock = {

    val newNextMove = clamp(nextMove - 1, 0, speed)

    val result = {
      if (nextFall <= 1) {
        if (y < GameStateHelper.FieldHeight - 1) // falling piece
          this.copy(y = y + 1, nextFall = speed, nextMove = newNextMove)
        else if (x < GameStateHelper.FieldWidth - 1) // new piece (left)
          this.copy(index = index + 1, x = x + 1, y = 0, nextFall = speed, nextMove = 0)
        else // new piece (right)
          this.copy(index = index + 1, x = 0, y = 0, nextFall = speed, nextMove = 0)
      }
      else
        this.copy(nextFall = nextFall - 1, nextMove = newNextMove)
    }

    if (result.nextFall == speed || newNextMove > 0 || (move.x == 0 && move.y == 0))
      result
    else
    {
      result.copy(
        nextMove = speed / 5,
        x = clamp(result.x + move.x, 0, GameStateHelper.FieldWidth - 1),
        y = clamp(result.y + move.y, 0, GameStateHelper.FieldHeight - 1))
    }

  }

  private def clamp(value: Int, min: Int, max: Int) : Int = {
    if (value < min) min
    else if (value > max) max
    else value
  }

}

case class GameState(
  index: Int,
  blocks: Seq[Int],
  movingBlocks: Seq[MovingBlock],
  maybeMove: Option[Move]
) {

  // move field ahead
  def getNext(moves: Seq[Move]) : GameState = {
    this.copy(
      index = index + 1,
      movingBlocks = movingBlocks.zip(moves).map { case (b, m) => b.getNext(m) },
      maybeMove = moves.headOption.filter(!_.isEmpty)
    )
  }

}

object GameStateHelper {

  val FieldWidth = 20;
  val FieldHeight = 24;

  def getInitialGameState : GameState = {
    GameState(
      0,
      Seq.empty,
      Seq(
        MovingBlock(0, x = 0, y = 0, 5, 5, 0),
        MovingBlock(0, x = 10, y = 0, 5, 5, 0)),
      None)
  }

}