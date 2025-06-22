import { Attendee } from "./Attendee";

/**
 * Evaluation context containing attendee state and environment
 */
export class EvaluationContext {
  constructor(
    public readonly attendee: Attendee,
    public readonly currentTime: Date,
    public readonly isStaffQuery: boolean = false,
  ) {}
}
