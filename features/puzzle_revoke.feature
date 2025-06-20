@wip
Feature: Puzzle Revoke
  Scenario: PUT /event/puzzle/revoke to revoke attendee puzzle
    Given there have some booths
      | token                                | name   |
      | 1024914b-ee65-4728-b687-8341f5affa89 | COSCUP |
    And event "SITCON" have a puzzle config
    """
    {
      "pieces": {
        "=": 1
      }
    }
    """
    And there have some attendees
      | token                                | display_name |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | Aotoki       |
    When I make a POST request to "/event/puzzle/deliver?token=1024914b-ee65-4728-b687-8341f5affa89":
      """
      {
        "receiver": "f185f505-d8c0-43ce-9e7b-bb9e8909072d"
      }
      """
    And I make a PUT request to "/event/puzzle/revoke?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d":
      """
      {}
      """
    Then the response json should be:
      """
      {
        "status": "OK"
      }
      """
    And the response status should be 200

  Scenario: PUT /event/puzzle/revoke to revoke attendee can see revoked puzzle
    Given there have some booths
      | token                                | name   |
      | 1024914b-ee65-4728-b687-8341f5affa89 | COSCUP |
    And event "SITCON" have a puzzle config
    """
    {
      "pieces": {
        "=": 1
      }
    }
    """
    And there have some attendees
      | token                                | display_name |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | Aotoki       |
    When I make a POST request to "/event/puzzle/deliver?token=1024914b-ee65-4728-b687-8341f5affa89":
      """
      {
        "receiver": "f185f505-d8c0-43ce-9e7b-bb9e8909072d"
      }
      """
    And I make a PUT request to "/event/puzzle/revoke?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d":
      """
      {}
      """
    And I make a GET request to "/event/puzzle?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
    Then the response json should be:
      """
      {
        "user_id": "Aotoki",
        "puzzles": ["="],
        "deliverers": ["COSCUP"],
        "valid": 1693065600,
        "coupon": 0
      }
      """
    And the response status should be 200

  Scenario: PUT /event/puzzle/revoke to revoke attendee can see stats changed
    Given there have some booths
      | token                                | name   |
      | 1024914b-ee65-4728-b687-8341f5affa89 | COSCUP |
    And event "SITCON" have a puzzle config
    """
    {
      "pieces": {
        "=": 1
      }
    }
    """
    And there have some attendees
      | token                                | display_name |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | Aotoki       |
    When I make a POST request to "/event/puzzle/deliver?token=1024914b-ee65-4728-b687-8341f5affa89":
      """
      {
        "receiver": "f185f505-d8c0-43ce-9e7b-bb9e8909072d"
      }
      """
    And I make a PUT request to "/event/puzzle/revoke?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d":
      """
      {}
      """
    And I make a GET request to "/event/puzzle/dashboard"
    Then the response json should be:
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
    And the response status should be 200
