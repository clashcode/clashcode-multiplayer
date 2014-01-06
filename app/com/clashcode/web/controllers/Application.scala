package com.clashcode.web.controllers

import play.api.mvc._
import com.clashcode.web.views
import play.api.libs.iteratee.{ Iteratee, Concurrent }
import play.api.libs.concurrent.Execution.Implicits._
import play.api.Logger
import play.api.libs.json.{JsObject, Json, JsValue}
import akka.actor.ActorRef

object Application extends Controller {

  private val (out, channel) = Concurrent.broadcast[JsValue]

  var maybeHostingActor = Option.empty[ActorRef]

  def push(obj: JsObject) = channel.push(obj)
  def push(message: String) = channel.push(Json.obj("status" -> message))

  def index = Action { implicit request =>
    val url = routes.Application.status().webSocketURL()
    Ok(views.html.index(url))
  }

  def status = WebSocket.using[JsValue] { request =>
    Logger.info("new listener")
    // ignore incoming websocket traffic
    val in = Iteratee.foreach[JsValue] {
      msg =>
        //Logger.debug(msg.toString)
        maybeHostingActor.foreach(actor => actor ! msg)
    } map {
      _ => Logger.info("removed listener")
    }
    (in, out)
  }

}


