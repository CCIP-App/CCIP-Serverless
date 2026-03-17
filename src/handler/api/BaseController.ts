import { MultiException, OpenAPIRoute } from "chanfana";
import { HTTPException } from "hono/http-exception";

export class BaseController extends OpenAPIRoute {
  protected handleError(error: unknown): unknown {
    if (error instanceof MultiException) {
      const responses = error.buildResponse();
      const message =
        responses.length > 0 ? responses[0].message : "Validation failed";
      throw new HTTPException(400, {
        res: Response.json({ message }, { status: 400 }),
      });
    }
    return error;
  }
}
