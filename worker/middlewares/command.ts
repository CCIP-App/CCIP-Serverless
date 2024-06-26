import { IRequest } from 'itty-router'
import { Env } from '@worker/environment'
import * as Repository from '@api/repository'
import * as Projection from '@api/projection'
import * as Command from '@api/command'

export const withCommands = (request: IRequest, env: Env) => {
  if (!env.DB) {
    throw new Error('DB is not available')
  }

  const attendeeRepository = new Repository.D1AttendeeRepository(env.DB)
  const puzzleConfigRepository = new Repository.D1PuzzleConfigRepository(env.DB)
  const puzzleStatusRepository = new Repository.D1PuzzleStatusRepository(env.DB)
  const puzzleStatsRepository = new Repository.D1PuzzleStatsRepository(env.DB)
  const getBoothByToken = new Projection.D1FindBoothByToken(env.DB)
  const getRulesetByEvent = new Projection.D1RulesetProjection(env.DB)

  const runAttendeeScenario = new Command.RunAttendeeScenario(attendeeRepository, getRulesetByEvent)
  const initializeAttendeeCommand = new Command.InitializeAttendeeCommand(attendeeRepository)
  const deliverPuzzle = new Command.DeliverPuzzleCommand(
    attendeeRepository,
    puzzleStatusRepository,
    getBoothByToken,
    puzzleConfigRepository,
    puzzleStatsRepository
  )
  const revokePuzzle = new Command.RevokePuzzleCommand(
    puzzleStatusRepository,
    puzzleStatsRepository
  )
  const useCoupon = new Command.UseCouponCommand(puzzleStatusRepository)

  Object.assign(request, {
    runAttendeeScenario,
    initializeAttendeeCommand,
    deliverPuzzle,
    revokePuzzle,
    useCoupon,
  })
}
