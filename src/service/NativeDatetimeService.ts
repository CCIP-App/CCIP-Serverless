import { IDatetimeService } from "@/usecase/interface";
import { injectable } from "tsyringe";

@injectable()
export class NativeDatetimeService implements IDatetimeService {
  getCurrentTime(): Date {
    return new Date();
  }
}
