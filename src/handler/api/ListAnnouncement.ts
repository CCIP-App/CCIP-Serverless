import { JsonAnnouncementListPresenter } from "@/presenter/JsonAnnouncementListPresenter";
import { AllAnnouncementQuery } from "@/usecase/AllAnnouncementQuery";
import {
  AnnouncementRepository,
  AnnouncementRepositoryToken,
  AttendeeRepository,
  AttendeeRepositoryToken,
} from "@/usecase/interface";
import { OpenAPIRouteSchema } from "chanfana";
import { Context } from "hono";
import { container } from "tsyringe";
import { z } from "zod";
import { BaseController } from "./BaseController";

export class ListAnnouncementController extends BaseController {
  schema = {
    summary: "List announcements",
    tags: ["Announcement"],
    request: {
      query: z.object({
        token: z.string().optional().describe("The attendee token (optional)"),
      }),
    },
    responses: {
      "200": {
        description: "Returns list of announcements",
        content: {
          "application/json": {
            schema: z.array(
              z.object({
                datetime: z.number().describe("Unix timestamp"),
                msgEn: z.string().describe("English message"),
                msgZh: z.string().describe("Chinese message"),
                uri: z.string().describe("Announcement URI"),
              }),
            ),
          },
        },
      },
    },
  } as OpenAPIRouteSchema;

  async handle(c: Context<{ Bindings: Env }>) {
    const data = await this.getValidatedData<typeof this.schema>();
    const query = data.query as unknown as { token?: string };

    const presenter = new JsonAnnouncementListPresenter();
    const announcementRepository = container.resolve<AnnouncementRepository>(
      AnnouncementRepositoryToken,
    );
    const attendeeRepository = container.resolve<AttendeeRepository>(
      AttendeeRepositoryToken,
    );

    const allAnnouncementQuery = new AllAnnouncementQuery(
      presenter,
      announcementRepository,
      attendeeRepository,
    );
    await allAnnouncementQuery.execute(query.token);

    return c.json(presenter.toJson());
  }
}
