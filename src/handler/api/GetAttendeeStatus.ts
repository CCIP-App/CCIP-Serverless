import { JsonAttendeeStatusPresenter } from "@/presenter/JsonAttendeeStatusPresenter";
import { GetAttendeeStatusQuery } from "@/usecase/GetAttendeeStatusQuery";
import {
  AttendeeRepository,
  AttendeeRepositoryToken,
} from "@/usecase/interface";
import { OpenAPIRouteSchema } from "chanfana";
import { Context } from "hono";
import { container } from "tsyringe";
import { z } from "zod";
import { BaseController } from "./BaseController";

export class GetAttendeeStatusController extends BaseController {
  schema = {
    summary: "Get attendee status",
    tags: ["Attendee"],
    request: {
      query: z.object({
        token: z.string().describe("The attendee token"),
        StaffQuery: z.string().optional().describe("Staff query flag"),
      }),
    },
    responses: {
      "200": {
        description: "Returns attendee status",
        content: {
          "application/json": {
            schema: z.object({
              public_token: z.string().describe("Public token"),
              user_id: z.string().describe("User ID (display name)"),
              first_use: z.number().nullable().describe("First use timestamp"),
              role: z.string().describe("Attendee role"),
              scenario: z.record(z.unknown()).describe("Scenario data"),
              attr: z.record(z.unknown()).describe("Attributes"),
            }),
          },
        },
      },
    },
  } as OpenAPIRouteSchema;

  async handle(c: Context<{ Bindings: Env }>) {
    const data = await this.getValidatedData<typeof this.schema>();
    const query = data.query as unknown as {
      token: string;
      StaffQuery?: string;
    };

    const presenter = new JsonAttendeeStatusPresenter();
    const attendeeRepository = container.resolve<AttendeeRepository>(
      AttendeeRepositoryToken,
    );

    const getAttendeeStatusQuery = new GetAttendeeStatusQuery(
      attendeeRepository,
      presenter,
    );

    const isStaffQuery = query.StaffQuery === "true";
    await getAttendeeStatusQuery.execute(query.token, isStaffQuery);

    return c.json(presenter.toJson());
  }
}
