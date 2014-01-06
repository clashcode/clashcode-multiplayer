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
  def gameIntervalMs = 200
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
    //case move: Move => handleMove(move)
    case value: JsValue =>
      val date = (value \ "date").as[Long]
      val delay = (commands.length + 1) * gameIntervalMs - DateTime.now().getMillis + lastTick
      Logger.info(value.toString + " " + delay)
      val correctedDate = date + delay
      (value \ "move").asOpt[String] match {
        case Some("left") => handleMove(Move(-1, 0, correctedDate))
        case Some("right") => handleMove(Move(1, 0, correctedDate))
        case Some("down") => handleMove(Move(0, 1, correctedDate))
      }
  }

  var gameState = GameStateHelper.getInitialGameState
  val commands = mutable.Queue.empty[Move]
  var lastTick = DateTime.now().getMillis

  def handleMove(move: Move) {
    // keep last 2 commands
    if (commands.length <= 1) commands.enqueue(move)
    //while (commands.length > 2) commands.dequeue()
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
