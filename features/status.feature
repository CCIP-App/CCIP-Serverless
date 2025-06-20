Feature: Status
	Scenario: When attendee is first use then set current time to first_used_at
		Given there have some attendees
			| token                                | display_name | first_used_at |
			| f185f505-d8c0-43ce-9e7b-bb9e8909072d | Aotoki       |               |
		When I make a GET request to "/status?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
		Then the response status should be 200
		And the response json should have property "first_use" is not null
	@wip
	Scenario: When staff query attendee status and not update first_used_at
		Given there have some attendees
			| token                                | display_name | first_used_at |
			| f185f505-d8c0-43ce-9e7b-bb9e8909072d | Aotoki       |               |
		When I make a GET request to "/status?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d&StaffQuery=true"
		Then the response status should be 200
		And the response json should have property "first_use" is null
	@wip
	Scenario: When attendee is used then return first_used_at
		Given there have some attendees
			| token                                | display_name | first_used_at             |
			| f185f505-d8c0-43ce-9e7b-bb9e8909072d | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
		When I make a GET request to "/status?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
		Then the response status should be 200
		And the response json should be:
			"""
			{
        "public_token": "041656f614f3b624ad8c7409c25db3b7e9a512ce",
				"user_id": "Aotoki",
				"first_use": 1692489600,
				"role": "audience",
				"scenario": {},
				"attr": {}
			}
			"""
	@wip
	Scenario: When attendee is staff then role is staff
		Given there have some attendees
			| token                                | display_name | role  | first_used_at             |
			| f185f505-d8c0-43ce-9e7b-bb9e8909072d | Aotoki       | staff | 2023-08-20 00:00:00 GMT+0 |
		When I make a GET request to "/status?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
		Then the response status should be 200
		And the response json should be:
			"""
			{
        "public_token": "041656f614f3b624ad8c7409c25db3b7e9a512ce",
				"user_id": "Aotoki",
				"first_use": 1692489600,
				"role": "staff",
				"scenario": {},
				"attr": {}
			}
			"""
	@wip
	Scenario: When attendee metadata is configured then display it
		Given there have some attendees
			| token                                | metadata                | display_name | role  | first_used_at             |
			| f185f505-d8c0-43ce-9e7b-bb9e8909072d | {"title": "文創組組長"} | Aotoki       | staff | 2023-08-20 00:00:00 GMT+0 |
		When I make a GET request to "/status?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
		Then the response status should be 200
		And the response json should be:
			"""
			{
        "public_token": "041656f614f3b624ad8c7409c25db3b7e9a512ce",
				"user_id": "Aotoki",
				"first_use": 1692489600,
				"role": "staff",
				"scenario": {},
				"attr": {
					"title": "文創組組長"
				}
			}
			"""
