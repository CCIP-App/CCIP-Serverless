import { DatabaseConnector } from "@/infra/DatabaseConnector";
import { DoAttendeeRepository } from "@/repository/DoAttendeeRepository";
import { AttendeeRepositoryToken } from "@/usecase/interface";
import { container } from "tsyringe";

export function configureContainer(env: Env) {
  // Create database connection
  const dbConnection = DatabaseConnector.build(
    env.EVENT_DATABASE,
    "ccip-serverless",
  );

  // Register repository implementation
  container.register(AttendeeRepositoryToken, {
    useValue: new DoAttendeeRepository(dbConnection),
  });
}
