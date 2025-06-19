import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class BaseController extends OpenAPIRoute {
  handleValidationError(errors: z.ZodIssue[]): Response {
    return Response.json({
      message: errors.length > 0 ? errors[0].message : "Validation failed"
    }, { status: 400 });
  }
}