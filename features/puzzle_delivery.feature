@wip
Feature: Puzzle Delivery
  Scenario: POST /event/puzzle/deliver with permitted booth token and receiver token
    Given there have some booths
      | token                                | name   | event_id |
      | 1024914b-ee65-4728-b687-8341f5affa89 | COSCUP | SITCON   |
    And event "SITCON" have a puzzle config
    """
    {
      "pieces": {
        "=": 1
      }
    }
    """
    And there have some attendees
      | token                                | event_id | display_name |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | SITCON   | Aotoki       |
    When I make a POST request to "/event/puzzle/deliver?token=1024914b-ee65-4728-b687-8341f5affa89&event_id=SITCON":
      """
      {
        "receiver": "f185f505-d8c0-43ce-9e7b-bb9e8909072d"
      }
      """
    Then the response json should be:
      """
      {
        "status": "OK",
        "user_id": "Aotoki"
      }
      """
    And the response status should be 200
  Scenario: POST /event/puzzle/deliver will update puzzle stats
    Given there have some booths
      | token                                | name   | event_id |
      | 1024914b-ee65-4728-b687-8341f5affa89 | COSCUP | SITCON   |
    And event "SITCON" have a puzzle config
    """
    {
      "pieces": {
        "=": 1
      }
    }
    """
    And there have some attendees
      | token                                | event_id | display_name |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | SITCON   | Aotoki       |
    When I make a POST request to "/event/puzzle/deliver?token=1024914b-ee65-4728-b687-8341f5affa89&event_id=SITCON":
      """
      {
        "receiver": "f185f505-d8c0-43ce-9e7b-bb9e8909072d"
      }
      """
    And I make a GET request to "/event/puzzle/dashboard?event_id=SITCON"
    Then the response json should be:
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
    And the response status should be 200
  Scenario: POST /event/puzzle/deliver with attendee not in event
    Given there have some booths
      | token                                | name   | event_id |
      | 1024914b-ee65-4728-b687-8341f5affa89 | COSCUP | SITCON   |
    And there have some attendees
      | token                                | event_id | display_name |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | COSCUP   | Aotoki       |
    When I make a POST request to "/event/puzzle/deliver?token=1024914b-ee65-4728-b687-8341f5affa89&event_id=SITCON":
      """
      {
        "receiver": "f185f505-d8c0-43ce-9e7b-bb9e8909072d"
      }
      """
    Then the response json should be:
      """
      {
        "message": "Attendee not in event"
      }
      """
    And the response status should be 400
  Scenario: POST /event/puzzle/deliver with unpermitted booth token
    Given there have some attendees
      | token                                | event_id | display_name |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | SITCON   | Aotoki       |
    When I make a POST request to "/event/puzzle/deliver?token=d9d09032-cdae-4da2-9f41-680ca64f2d21&event_id=SITCON":
      """
      {
        "receiver": "f185f505-d8c0-43ce-9e7b-bb9e8909072d"
      }
      """
    Then the response status should be 400
    And the response json should be:
      """
      {
        "message": "invalid token"
      }
      """
  Scenario: POST /event/puzzle/deliver without booth token in querystring
    When I make a POST request to "/event/puzzle/deliver?event_id=SITCON":
      """
      {
        "receiver": "1cf41a53-4aea-452b-a204-6b0b52eee380"
      }
      """
    Then the response status should be 400
    And the response json should be:
      """
      {
        "message": "token and receiver required"
      }
      """
  Scenario: POST /event/puzzle/deliver without receiver token
    When I make a POST request to "/event/puzzle/deliver?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d&event_id=SITCON":
      """
      {}
      """
    Then the response status should be 400
    And the response json should be:
      """
      {
        "message": "token and receiver required"
      }
      """

  Scenario: POST /event/puzzle/deliver with non-exist receiver token
    Given there have some booths
      | token                                | name   | event_id |
      | 1024914b-ee65-4728-b687-8341f5affa89 | COSCUP | SITCON   |
    When I make a POST request to "/event/puzzle/deliver?token=1024914b-ee65-4728-b687-8341f5affa89&event_id=SITCON":
      """
      {
        "receiver": "1cf41a53-4aea-452b-a204-6b0b52eee380"
      }
      """
    Then the response json should be:
      """
      {
        "message": "invalid receiver token"
      }
      """
    And the response status should be 404

  Scenario: POST /event/puzzle/deliver with delivered receiver token
    Given there have some booths
      | token                                | name   | event_id |
      | 1024914b-ee65-4728-b687-8341f5affa89 | COSCUP | SITCON   |
    And there have some attendees
      | token                                | event_id | display_name |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | SITCON   | Aotoki       |
    And there have some puzzle activity events
      | id                                   | type                | aggregate_id                         | version | payload                                     | occurred_at         |
      | b44845bd-8bd2-428d-ad65-f6a619bf8a96 | AttendeeInitialized | f185f505-d8c0-43ce-9e7b-bb9e8909072d | 0       | { "displayName": "Aotoki" }                 | 2023-09-10 20:4:00  |
      | f41c7a07-d2f4-469a-ae16-4df251eddbf6 | PuzzleCollected     | f185f505-d8c0-43ce-9e7b-bb9e8909072d | 1       | { "pieceName": "=", "giverName": "COSCUP" } | 2023-09-10 20:50:00 |
    When I make a POST request to "/event/puzzle/deliver?token=1024914b-ee65-4728-b687-8341f5affa89&event_id=SITCON":
      """
      {
        "receiver": "f185f505-d8c0-43ce-9e7b-bb9e8909072d"
      }
      """
    Then the response json should be:
      """
      {
        "message": "Already take from this deliverer"
      }
      """
    And the response status should be 400
