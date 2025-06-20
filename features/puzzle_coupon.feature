@wip
Feature: Puzzle Coupon
  Scenario: PUT /event/puzzle/coupon to redeem a puzzle coupon
    Given there have some attendees
      | token                                | display_name |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | Aotoki       |
    And there have some puzzle activity events
      | id                                   | type                | aggregate_id                         | version | payload                                | occurred_at         |
      | b44845bd-8bd2-428d-ad65-f6a619bf8a96 | AttendeeInitialized | f185f505-d8c0-43ce-9e7b-bb9e8909072d | 0       | { "displayName": "Aotoki" }            | 2023-09-10 20:48:00 |
    When I make a PUT request to "/event/puzzle/coupon?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d":
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

  Scenario: PUT /event/puzzle/coupon to redeem a puzzle coupon and status is updated
    Given there have some attendees
      | token                                | display_name |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | Aotoki       |
    And there have some puzzle activity events
      | id                                   | type                | aggregate_id                         | version | payload                                | occurred_at         |
      | b44845bd-8bd2-428d-ad65-f6a619bf8a96 | AttendeeInitialized | f185f505-d8c0-43ce-9e7b-bb9e8909072d | 0       | { "displayName": "Aotoki" }            | 2023-09-10 20:48:00 |
    When I make a PUT request to "/event/puzzle/coupon?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d":
      """
      {}
      """
    And I make a GET request to "/event/puzzle?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
    Then the response json should be:
      """
      {
        "user_id": "Aotoki",
        "puzzles": [],
        "deliverers": [],
        "valid": null,
        "coupon": 1693065600
      }
      """
    And the response status should be 200
