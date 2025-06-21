import { DatabaseConnectionToken } from "@/infra/DatabaseConnection";
import { DatabaseConnector } from "@/infra/DatabaseConnector";
import { DoAnnouncementRepository } from "@/repository/DoAnnouncementRepository";
import { DoAttendeeRepository } from "@/repository/DoAttendeeRepository";
import { NativeDatetimeService } from "@/service/NativeDatetimeService";
import {
  AnnouncementRepositoryToken,
  AttendeeRepositoryToken,
  DatetimeServiceToken,
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

// Register service implementations
container.register(DatetimeServiceToken, {
  useClass: NativeDatetimeService,
});
