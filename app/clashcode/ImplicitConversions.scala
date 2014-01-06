package clashcode

import scala.concurrent.duration.FiniteDuration
import java.util.concurrent.TimeUnit
import play.api.Play
import play.api.libs.json.Json
import clashcode.logic.{Move, MovingBlock, GameState}

object ImplicitConversions {

  implicit val moveWriter = Json.format[Move]
  implicit val movingBlockWriter = Json.format[MovingBlock]
  implicit val gameStateWriter = Json.format[GameState]

  implicit class IntDuration(nr: Int) {
    def seconds = { FiniteDuration(nr, TimeUnit.SECONDS) }
    def second = seconds

    def milliseconds = { FiniteDuration(nr, TimeUnit.MILLISECONDS) }
    def millisecond = seconds
  }
  
}