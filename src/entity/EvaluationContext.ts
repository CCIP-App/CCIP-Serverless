/**
 * Evaluation context containing attendee state and environment
 */
export class EvaluationContext {
  constructor(
    public readonly attendee: {
      hasUsedRule(ruleId: string): boolean;
      getRuleUsedAt(ruleId: string): Date | null;
      getMetadata(key: string): unknown;
      role: string;
    }, // Minimal interface to avoid circular imports
    public readonly currentTime: Date,
    public readonly isStaffQuery: boolean = false,
  ) {}
}
