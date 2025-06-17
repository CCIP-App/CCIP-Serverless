import { OpenAPIRoute, OpenAPIRouteSchema } from 'chanfana'
import { Context, Env } from 'hono';
import { z } from 'zod';

export class LandingController extends OpenAPIRoute {
  schema = {
    summary: 'Get attendee display name',
    tags: ['Attendee'],
    request: z.object({
      token: z.string().describe('The attendee token'),
    }),
    responses: {
      '200': {
        description: 'Returns the attendee display name',
        content: {
          'application/json': {
            schema: z.object({
              nickname: z.string().describe('The attendee display name'),
            }),
          },
        },
      },
      '400': {
        description: 'Missing or invalid token',
      },
    }
  } as OpenAPIRouteSchema

  async handle(c: Context<Env>) {
    return c.json({
      nickname: 'TODO'
    })
  }
}
