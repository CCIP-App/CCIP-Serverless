import { IDatetimeService } from "@/usecase/interface";
import { env } from "cloudflare:workers";
import { injectable } from "tsyringe";

@injectable()
export class NativeDatetimeService implements IDatetimeService {
  getCurrentTime(): Date {
    // Check if we're in test mode and return mock datetime
    if (env.__TEST__ === "true" && env.__MOCK_DATETIME__) {
      return new Date(env.__MOCK_DATETIME__);
    }
    return new Date();
  }
}
