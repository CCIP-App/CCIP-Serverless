import { JsonProfilePresenter } from "@/presenter/JsonProfilePresenter";
import { GetProfile } from "@/usecase/GetProfile";
import {
  AttendeeRepository,
  AttendeeRepositoryToken,
} from "@/usecase/interface";
import { OpenAPIRouteSchema } from "chanfana";
import { Context } from "hono";
import { container } from "tsyringe";
import { z } from "zod";
import { BaseController } from "./BaseController";

export class LandingController extends BaseController {
  schema = {
    summary: "Get attendee display name",
    tags: ["Attendee"],
    request: {
      query: z.object({
        token: z
          .string({ message: "token required" })
          .describe("The attendee token"),
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
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().describe("Error message"),
            }),
          },
        },
      },
    },
  } as OpenAPIRouteSchema;

  async handle(c: Context<{ Bindings: Env }>) {
    const data = await this.getValidatedData<typeof this.schema>();
    const query = data.query as unknown as { token: string };

    try {
      const presenter = new JsonProfilePresenter();
      const attendeeRepository = container.resolve<AttendeeRepository>(
        AttendeeRepositoryToken,
      );
      const getProfile = new GetProfile(attendeeRepository, presenter);
      await getProfile.execute(query.token);

      return c.json(presenter.toJson());
    } catch (error) {
      return c.json({ message: (error as Error).message }, 400);
    }
  }
}
