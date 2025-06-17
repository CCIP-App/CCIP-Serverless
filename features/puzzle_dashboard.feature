@wip
Feature: Puzzle Dashboard
  Scenario: Get the event "SITCON" puzzle dashboard show the puzzle stats
    When I make a GET request to "/event/puzzle/dashboard?event_id=SITCON"
		And the response json should be:
			"""
			[
        {
          "puzzle": "total", "quantity": 0, "currency": 0
        }
			]
			"""
    Then the response status should be 200

  Scenario: The event has some delivered event
    Given there have some puzzle stat events
      | id                                   | type                  | aggregate_id | version | payload               | occurred_at         |
      | b44845bd-8bd2-428d-ad65-f6a619bf8a96 | PuzzleStatIncremented | SITCON       | 0       | { "puzzleName": "=" } | 2023-09-10 20:48:00 |
    When I make a GET request to "/event/puzzle/dashboard?event_id=SITCON"
		And the response json should be:
			"""
			[
        {
          "puzzle": "=", "quantity": 1, "currency": 1
        },
        {
          "puzzle": "total", "quantity": 1, "currency": 1
        }
			]
			"""
    Then the response status should be 200

  Scenario: The event has some revoke event
    Given there have some puzzle stat events
      | id                                   | type                  | aggregate_id | version | payload               | occurred_at         |
      | b44845bd-8bd2-428d-ad65-f6a619bf8a96 | PuzzleStatIncremented | SITCON       | 0       | { "puzzleName": "=" } | 2023-09-10 20:48:00 |
      | 1a76df0e-7b36-48a3-b745-18a0e7f9df92 | PuzzleStatDecremented | SITCON       | 1       | { "puzzleName": "=" } | 2023-09-10 20:49:00 |
    When I make a GET request to "/event/puzzle/dashboard?event_id=SITCON"
    And the response json should be:
      """
      [
        {
          "puzzle": "=", "quantity": 1, "currency": 0
        },
        {
          "puzzle": "total", "quantity": 1, "currency": 0
        }
      ]
      """
    Then the response status should be 200
