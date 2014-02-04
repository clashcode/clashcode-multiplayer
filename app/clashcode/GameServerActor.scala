package clashcode

import play.api.Logger
import akka.actor.{Actor, ActorRef, actorRef2Scala}
import com.clashcode.web.controllers.Application
import play.api.libs.concurrent.Execution.Implicits._
import clashcode.ImplicitConversions._
import clashcode.logic.{Move, GameStateHelper}
import play.api.libs.json.{JsValue, Json}
import scala.collection.mutable
import org.joda.time.DateTime

trait GameParameters {
  def gameIntervalMs = 100
  def timeOutSeconds = 5 * 60
}

case object GameTick

class GameServerActor extends Actor with GameParameters {

  val emptyMove = Move()

  // game ticks
  context.system.scheduler.schedule(
    initialDelay = gameIntervalMs milliseconds,
    interval = gameIntervalMs milliseconds) {
    self ! GameTick
  }

  def receive = {
    case GameTick => handleTick()

    case value: JsValue =>
      val rawMove = value.as[Move]
      val delay = gameIntervalMs - DateTime.now().getMillis + lastTick
      val move = rawMove.copy(delay = delay)
      //Logger.info(value.toString + " " + delay)
      handleMove(move)
  }

  var gameState = GameStateHelper.getInitialGameState
  val commands = mutable.Queue.empty[Move]
  var lastTick = DateTime.now().getMillis

  /** keep last received move */
  def handleMove(move: Move) {
    while (commands.length > 0) commands.dequeue()
    commands.enqueue(move)
  }

  def handleTick() {

    // take next input command
    lastTick = DateTime.now().getMillis
    val maybeMove = commands.headOption;
    val move = maybeMove.map(_ => commands.dequeue()).getOrElse(emptyMove)
    gameState = gameState.getNext(Seq(move, emptyMove))

    Application.push(Json.obj("state" -> gameState))
  }


}
