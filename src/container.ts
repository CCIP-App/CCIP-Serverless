import { DatabaseConnectionToken } from "@/infra/DatabaseConnection";
import { DatabaseConnector } from "@/infra/DatabaseConnector";
import { DoAnnouncementRepository } from "@/repository/DoAnnouncementRepository";
import { DoAttendeeRepository } from "@/repository/DoAttendeeRepository";
import { DoRulesetRepository } from "@/repository/DoRulesetRepository";
import { NativeDatetimeService } from "@/service/NativeDatetimeService";
import { RuleEvaluationService } from "@/service/RuleEvaluationService";
import {
  AnnouncementRepositoryToken,
  AttendeeRepositoryToken,
  DatetimeServiceToken,
  RuleEvaluationServiceToken,
  RulesetRepositoryToken,
} from "@/usecase/interface";
import { env } from "cloudflare:workers";
import { container } from "tsyringe";

// Register database connection with factory that uses env directly
container.register(DatabaseConnectionToken, {
  useFactory: () => {
    return DatabaseConnector.build(env.EVENT_DATABASE, "ccip-serverless");
  },
});

// Register repository implementations using useClass
container.register(AttendeeRepositoryToken, {
  useClass: DoAttendeeRepository,
});

container.register(AnnouncementRepositoryToken, {
  useClass: DoAnnouncementRepository,
});

container.register(RulesetRepositoryToken, {
  useClass: DoRulesetRepository,
});

// Register service implementations
container.register(DatetimeServiceToken, {
  useClass: NativeDatetimeService,
});

container.register(RuleEvaluationServiceToken, {
  useClass: RuleEvaluationService,
});
