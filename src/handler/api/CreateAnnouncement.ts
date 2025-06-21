import { CreateAnnouncementCommand } from "@/usecase/CreateAnnouncementCommand";
import {
  AnnouncementRepository,
  AnnouncementRepositoryToken,
  DatetimeServiceToken,
  IDatetimeService,
} from "@/usecase/interface";
import { OpenAPIRouteSchema } from "chanfana";
import { Context } from "hono";
import { container } from "tsyringe";
import { z } from "zod";
import { BaseController } from "./BaseController";

export class CreateAnnouncementController extends BaseController {
  schema = {
    summary: "Create a new announcement",
    tags: ["Announcement"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              msg_en: z.string().describe("English message"),
              msg_zh: z.string().describe("Chinese message"),
              uri: z.string().url().describe("Announcement URI"),
              role: z.array(z.string()).describe("Target roles"),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Announcement created successfully",
        content: {
          "application/json": {
            schema: z.object({
              status: z.literal("OK"),
            }),
          },
        },
      },
    },
  } as OpenAPIRouteSchema;

  async handle(c: Context<{ Bindings: Env }>) {
    const data = await this.getValidatedData<typeof this.schema>();
    const body = data.body as unknown as {
      msg_en: string;
      msg_zh: string;
      uri: string;
      role: string[];
    };

    const announcementRepository = container.resolve<AnnouncementRepository>(
      AnnouncementRepositoryToken,
    );
    const datetimeService =
      container.resolve<IDatetimeService>(DatetimeServiceToken);

    const createAnnouncementCommand = new CreateAnnouncementCommand(
      announcementRepository,
      datetimeService,
    );

    await createAnnouncementCommand.execute(
      body.msg_en,
      body.msg_zh,
      body.uri,
      body.role,
    );

    return c.json({ status: "OK" });
  }
}
