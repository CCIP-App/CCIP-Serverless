@wip
Feature: Puzzle Status
  Scenario: When I open puzzle status, I can see the status of specify token
    Given there have some puzzle activity events
      | id                                   | type                | aggregate_id                         | version | payload                                | occurred_at         |
      | b44845bd-8bd2-428d-ad65-f6a619bf8a96 | AttendeeInitialized | f185f505-d8c0-43ce-9e7b-bb9e8909072d | 0       | { "displayName": "Aotoki" }            | 2023-09-10 20:48:00 |
      | f41c7a07-d2f4-469a-ae16-4df251eddbf6 | PuzzleCollected     | f185f505-d8c0-43ce-9e7b-bb9e8909072d | 1       | { "pieceName": "=", "giverName": "COSCUP" } | 2023-09-10 20:50:00 |
    When I make a GET request to "/event/puzzle?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
    Then the response json should be:
      """
      {
        "user_id": "Aotoki",
        "puzzles": ["="],
        "deliverers": ["COSCUP"],
        "valid": null,
        "coupon": null
      }
      """
    And the response status should be 200
