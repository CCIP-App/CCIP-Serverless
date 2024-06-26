import { IRequest } from 'itty-router'
import { Env } from '@worker/environment'
import * as Projection from '@api/projection'
import * as Query from '@api/query'
import * as Repository from '@api/repository'

export const withQueries = (request: IRequest, env: Env) => {
  if (!env.DB) {
    throw new Error('DB is not available')
  }

  const attendeeRepository = new Repository.D1AttendeeRepository(env.DB)
  const puzzleStatusRepository = new Repository.D1PuzzleStatusRepository(env.DB)
  const getRulesetByEvent = new Projection.D1RulesetProjection(env.DB)
  const findBoothByToken = new Projection.D1FindBoothByToken(env.DB)

  const attendeeInfo = new Query.AttendeeInfo(attendeeRepository)
  const getPuzzleStatus = new Query.GetPuzzleStatus(puzzleStatusRepository)
  const allBoothProjection = new Projection.D1AllBoothProjection(env.DB)
  const listBooth = new Query.ListBooth(allBoothProjection)
  const getBoothByToken = new Query.GetBoothByToken(findBoothByToken)

  const getAttendeeScenario = new Query.GetAttendeeScenario(attendeeRepository, getRulesetByEvent)

  Object.assign(request, {
    getPuzzleStatus,
    listBooth,
    attendeeInfo,
    getAttendeeScenario,
    getBoothByToken,
  })
}
