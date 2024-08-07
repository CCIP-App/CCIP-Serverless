import { IRequest } from 'itty-router'
import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { container } from 'tsyringe'
import { json } from '@worker/utils'
import * as schema from '@api/schema'
import * as Command from '@api/command'
import { ListAnnouncementsByToken } from '@api/query'
import { datetimeToUnix } from '@api/utils'
import { Get, Post } from '@worker/router'

export type AnnouncementRequest = {
  query: Record<string, string | undefined>
} & IRequest

export type AnnouncementData = z.infer<typeof announcementDataSchema>

export const announcementDataSchema = z.object({
  datetime: z.number().default(1600000000),
  msgEn: z.string().nullable().default('english'),
  msgZh: z.string().nullable().default('中文'),
  uri: z.string().default('https://example.com/'),
})

const toCreateAnnouncementParams = (
  data: schema.CreateAnnouncementPayload
): Command.CreateAnnouncementInput => {
  return {
    message: {
      ...(typeof data.msg_en === 'string' && { [schema.Languages.enUS]: data.msg_en }),
      ...(typeof data.msg_zh === 'string' && { [schema.Languages.zhTW]: data.msg_zh }),
    },
    uri: typeof data.uri === 'string' ? data.uri : '',
    roles: Array.isArray(data.role) ? data.role : [],
  }
}

export type AnnouncementResponse = z.infer<typeof announcementResponseSchema>
export const announcementResponseSchema = z.array(announcementDataSchema)

const toFormattedAnnouncement = (data: schema.Announcement): AnnouncementData => ({
  datetime: datetimeToUnix(data.announcedAt),
  msgEn: data.message[schema.Languages.enUS],
  msgZh: data.message[schema.Languages.zhTW],
  uri: data.uri,
})

@Get('/announcement')
export class ListAnnouncement extends OpenAPIRoute {
  schema = {
    summary: 'List announcements',
    tags: ['Announcement'],
    request: {
      query: z.object({
        token: schema.OptionalAttendeeTokenQuery,
      }),
    },
    responses: {
      '200': {
        description: 'Returns list of announcements',
        content: {
          'application/json': {
            schema: announcementResponseSchema,
          },
        },
      },
    },
  }

  async handle(request: AnnouncementRequest) {
    const query = container.resolve(ListAnnouncementsByToken)
    const results = await query.execute({
      token: String(request.query.token),
    })
    return json<AnnouncementResponse>(results.map(toFormattedAnnouncement))
  }
}

@Post('/announcement')
export class CreateAnnouncement extends OpenAPIRoute {
  schema = {
    summary: 'Create an announcement',
    tags: ['Announcement'],
    responses: {
      '200': {
        description: 'Created an announcement',
        content: {
          'application/json': {
            schema: z.object({
              status: z.literal('OK'),
            }),
          },
        },
      },
    },
  }

  async handle(request: AnnouncementRequest) {
    const command = container.resolve(Command.CreateAnnouncement)
    const params = await request.json<schema.CreateAnnouncementPayload>()
    await command.execute(toCreateAnnouncementParams(params))

    return json({ status: 'OK' })
  }
}
