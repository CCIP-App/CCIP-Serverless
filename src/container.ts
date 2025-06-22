import { DEFAULT_DATABASE_NAME } from "@/constant";
import { DatabaseConnectionToken } from "@/infra/DatabaseConnection";
import { DatabaseConnector } from "@/infra/DatabaseConnector";
import { DoAnnouncementRepository } from "@/repository/DoAnnouncementRepository";
import { DoAttendeeRepository } from "@/repository/DoAttendeeRepository";
import { DoRulesetRepository } from "@/repository/DoRulesetRepository";
import { NativeDatetimeService } from "@/service/NativeDatetimeService";
import { RuleEvaluationService } from "@/service/RuleEvaluationService";
import { RuleFactory } from "@/service/RuleFactory";
import {
  AnnouncementRepositoryToken,
  AttendeeRepositoryToken,
  DatetimeServiceToken,
  RuleEvaluationServiceToken,
  RuleFactoryToken,
  RulesetRepositoryToken,
} from "@/usecase/interface";
import { env } from "cloudflare:workers";
import { container } from "tsyringe";

// Register database connection with factory that uses env directly
container.register(DatabaseConnectionToken, {
  useFactory: () => {
    return DatabaseConnector.build(env.EVENT_DATABASE, DEFAULT_DATABASE_NAME);
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

container.register(RuleFactoryToken, {
  useClass: RuleFactory,
});
