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
    // For now, just return empty array for the first scenario
    return c.json([]);
  }
}
