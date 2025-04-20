package controllers

import javax.inject._
import play.api.mvc._

@Singleton
class ProductsController @Inject() (controllerComponents: ControllerComponents) extends AbstractController(controllerComponents) {

    def index: Action[AnyContent] = Action {
        Ok("Products controller is alive!")
    }

}