import { JsonAttendeeStatusPresenter } from "@/presenter/JsonAttendeeStatusPresenter";
import { UseRuleCommand } from "@/usecase/UseRuleCommand";
import {
  AttendeeRepository,
  AttendeeRepositoryToken,
  DatetimeServiceToken,
  IDatetimeService,
  RuleEvaluationService,
  RuleEvaluationServiceToken,
  RulesetRepository,
  RulesetRepositoryToken,
} from "@/usecase/interface";
import { OpenAPIRoute } from "chanfana";
import { Context } from "hono";
import { container } from "tsyringe";
import { z } from "zod";

/**
 * Controller for using/executing a specific rule
 */
export class UseRuleController extends OpenAPIRoute {
  schema = {
    tags: ["Rules"],
    summary: "Use a rule",
    description: "Execute a rule action for an attendee",
    request: {
      params: z.object({
        ruleId: z.string().describe("The ID of the rule to use"),
      }),
      query: z.object({
        token: z.string().describe("Attendee token"),
      }),
    },
    responses: {
      200: {
        description: "Rule used successfully",
        content: {
          "application/json": {
            schema: z.object({
              public_token: z.string(),
              user_id: z.string(),
              first_use: z.number(),
              role: z.string(),
              scenario: z.record(z.any()),
              attr: z.record(z.any()),
            }),
          },
        },
      },
      400: {
        description: "Rule cannot be used",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context<{ Bindings: Env }>) {
    const { ruleId } = c.req.param();
    const { token } = c.req.query();

    if (!token) {
      return c.json({ message: "Token is required" }, 400);
    }

    try {
      // Create presenter
      const presenter = new JsonAttendeeStatusPresenter();

      // Resolve dependencies
      const attendeeRepository = container.resolve<AttendeeRepository>(
        AttendeeRepositoryToken,
      );
      const rulesetRepository = container.resolve<RulesetRepository>(
        RulesetRepositoryToken,
      );
      const evaluationService = container.resolve<RuleEvaluationService>(
        RuleEvaluationServiceToken,
      );
      const datetimeService =
        container.resolve<IDatetimeService>(DatetimeServiceToken);

      // Create use case with dependencies
      const useCase = new UseRuleCommand(
        attendeeRepository,
        rulesetRepository,
        evaluationService,
        datetimeService,
        presenter,
      );

      await useCase.execute(token, ruleId);
      return c.json(presenter.toJson());
    } catch (error) {
      return c.json({ message: (error as Error).message }, 400);
    }
  }
}
