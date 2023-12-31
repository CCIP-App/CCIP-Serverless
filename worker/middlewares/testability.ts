import { IRequest } from 'itty-router'
import { Env } from '@worker/environment'
import { setFixedDatetime } from '@/core'

export const withTestability = (request: IRequest, env: Env) => {
  if (env.MOCK_DATE) {
    setFixedDatetime(new Date(env.MOCK_DATE))
  }
}
