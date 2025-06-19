import { HonoOpenAPIRouterType } from "chanfana";
import { LandingController } from "./Landing";
import { ListAnnouncementController } from "./ListAnnouncement";

export function register(router: HonoOpenAPIRouterType<{ Bindings: Env }>) {
  router.get("/landing", LandingController);
  router.get("/announcement", ListAnnouncementController);
}
