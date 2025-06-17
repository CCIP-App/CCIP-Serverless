Feature: Landing
	Scenario: GET /landing with exists token
		Given there have some attendees
			| token                                | event_id   | display_name |
			| f185f505-d8c0-43ce-9e7b-bb9e8909072d | COSCUP2023 | Aotoki       |
		When I make a GET request to "/landing?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
		Then the response status should be 200
		And the response json should be:
			"""
			{
				"nickname": "Aotoki"
			}
			"""
	@wip
	Scenario: GET /landing without token
		When I make a GET request to "/landing"
		Then the response status should be 400
		And the response json should be:
			"""
			{
				"message": "token required"
			}
			"""
	@wip
	Scenario: GET /landing with non exists token
		When I make a GET request to "/landing?token=79fd7131-f46e-4335-8d0c-ac1fa551288b"
		Then the response status should be 400
		And the response json should be:
			"""
			{
				"message": "invalid token"
			}
			"""

