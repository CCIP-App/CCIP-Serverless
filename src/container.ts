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
import { container } from "tsyringe";

export function configureContainer(env: Env) {
  // Create and register database connection
  const dbConnection = DatabaseConnector.build(
    env.EVENT_DATABASE,
    "ccip-serverless",
  );
  container.register(DatabaseConnectionToken, { useValue: dbConnection });

  // Register repository implementations
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
}
