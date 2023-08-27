import { IRequest, StatusError } from 'itty-router'
import { json, error } from './helper'
import * as schema from './schema'
import { AttendeeInfo, AttendeeAccess } from '../usecase'
import { datetimeToUnix } from '../utils'

export type UseRequest = {
	attendeeInfo: AttendeeInfo
	attendeeAccess: AttendeeAccess
	scenarioId: string
} & IRequest

export type UseResponse = schema.Status

export const use = async ({ attendeeInfo, attendeeAccess, scenarioId, query }: UseRequest) => {
	if (!query.token) {
		throw new StatusError(400, 'token required')
	}

	const info = await attendeeInfo.getAttendee(query.token as string)
	if (!info) {
		throw new StatusError(400, 'invalid token')
	}

	let scenarios: Record<string, any>
	try {
		scenarios = await attendeeAccess.useScenario(query.token as string, scenarioId)
	} catch (e) {
		throw new StatusError(400, (e as Error).message)
	}

	return json<UseResponse>({
		event_id: info.eventId,
		user_id: info.displayName,
		first_use: datetimeToUnix(info.firstUsedAt),
		role: info.role,
		scenario: formatScenario(scenarios),
		attr: info.metadata ?? {},
	})
}

function formatScenario(scenario: Record<string, any>) {
	const result: Record<string, schema.Scenario> = {}
	for (const key in scenario) {
		const value = scenario[key]
		result[key] = {
			order: value.order,
			available_time: datetimeToUnix(value.availableTime.start),
			expire_time: datetimeToUnix(value.availableTime.end),
			display_text: value.displayText,
			used: datetimeToUnix(value.usedAt),
			disabled: value.locked ? value.lockReason : null,
			attr: value.metadata,
		}
	}
	return result
}
