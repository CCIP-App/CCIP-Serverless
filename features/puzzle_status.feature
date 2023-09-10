Feature: Puzzle Status
  Scenario: When I open puzzle status, I can see the status of specify token
    Given there have some puzzle activity events
      | id                                   | type                | aggregate_id                         | version | payload    | occurred_at         |
      | b44845bd-8bd2-428d-ad65-f6a619bf8a96 | AttendeeInitialized | f185f505-d8c0-43ce-9e7b-bb9e8909072d | 0       | ["Aotoki"] | 2023-09-10 20:48:00 |
    When I make a GET request to "/event/puzzle?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
    Then the response status should be 200
    And the response json should be:
      """
      {
        "user_id": "Aotoki",
        "puzzles": [],
        "deliverers": [],
        "valid": null,
        "coupon": null
      }
      """
