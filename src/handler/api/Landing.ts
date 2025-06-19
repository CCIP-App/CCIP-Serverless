import { DatabaseConnector } from "@/infra/DatabaseConnector";
import { DoAttendeeRepository } from "@/repository/DoAttendeeRepository";
import { OpenAPIRoute, OpenAPIRouteSchema } from "chanfana";
import { env } from "cloudflare:workers";
import { Context, Env } from "hono";
import { z } from "zod";

export class LandingController extends OpenAPIRoute {
  schema = {
    summary: "Get attendee display name",
    tags: ["Attendee"],
    request: {
      query: z.object({
        token: z.string().describe("The attendee token"),
      }),
    },
    responses: {
      "200": {
        description: "Returns the attendee display name",
        content: {
          "application/json": {
            schema: z.object({
              nickname: z.string().describe("The attendee display name"),
            }),
          },
        },
      },
      "400": {
        description: "Missing or invalid token",
      },
    },
  } as OpenAPIRouteSchema;

  async handle(c: Context<Env>) {
    const data = await this.getValidatedData<typeof this.schema>();
    const query = data.query as unknown as { token: string };

    const conn = DatabaseConnector.build(env.EVENT_DATABASE, "ccip-serverless");
    const repository = new DoAttendeeRepository(conn);
    const attendee = await repository.findAttendeeByToken(query.token);

    return c.json({
      nickname: attendee?.display_name || "Unknown Attendee",
    });
  }
}
