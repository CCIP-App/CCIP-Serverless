import { HonoOpenAPIRouterType } from "chanfana";
import { LandingController } from "./Landing";

export function register(router: HonoOpenAPIRouterType<{ Bindings: Env }>) {
  router.get("/landing", LandingController);
}
