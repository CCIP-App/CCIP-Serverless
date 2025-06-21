import { HonoOpenAPIRouterType } from "chanfana";
import { CreateAnnouncementController } from "./CreateAnnouncement";
import { GetAttendeeStatusController } from "./GetAttendeeStatus";
import { LandingController } from "./Landing";
import { ListAnnouncementController } from "./ListAnnouncement";

export function register(router: HonoOpenAPIRouterType<{ Bindings: Env }>) {
  router.get("/landing", LandingController);
  router.get("/announcement", ListAnnouncementController);
  router.post("/announcement", CreateAnnouncementController);
  router.get("/status", GetAttendeeStatusController);
}
