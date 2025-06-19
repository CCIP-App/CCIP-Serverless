import { AllAnnouncementQuery } from "@/usecase/AllAnnouncementQuery";
import { JsonAnnouncementListPresenter } from "@/presenter/JsonAnnouncementListPresenter";
import { DoAnnouncementRepository } from "@/repository/DoAnnouncementRepository";
import { DoAttendeeRepository } from "@/repository/DoAttendeeRepository";
import { DatabaseConnector } from "@/infra/DatabaseConnector";
import { OpenAPIRouteSchema } from "chanfana";
import { Context } from "hono";
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
    const connection = DatabaseConnector.build(c.env.EVENT_DATABASE, "ccip-serverless");
    const announcementRepository = new DoAnnouncementRepository(connection);
    const attendeeRepository = new DoAttendeeRepository(connection);
    
    const allAnnouncementQuery = new AllAnnouncementQuery(
      presenter,
      announcementRepository,
      attendeeRepository
    );
    await allAnnouncementQuery.execute(query.token);

    return c.json(presenter.toJson());
  }
}
