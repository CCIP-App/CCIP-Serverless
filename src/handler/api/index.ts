import { HonoOpenAPIRouterType } from "chanfana";
import { LandingController } from "./Landing";

export function register(router: HonoOpenAPIRouterType) {
  router.get("/landing", LandingController);
}
