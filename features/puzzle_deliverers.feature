@wip
Feature: Puzzle Deliverers
  Background:
    Given there have some booths
      | token                                | name   |
      | 30b546a6-4710-43c1-9556-421906f2afe1 | COSCUP |
      | f05e5898-10e7-4e75-b64f-61d2d062e4f9 | SITCON |

  Scenario: When I ask for deliverers I can see a list of booths
    When I make a GET request to "/event/puzzle/deliverers"
    Then the response json should be:
      """
      [
        "COSCUP",
        "SITCON"
      ]
      """
    And the response status should be 200

  Scenario: When I ask for deliverer but without token
    When I make a GET request to "/event/puzzle/deliverer"
    Then the response json should be:
      """
      { "message": "token required" }
      """
    And the response status should be 400

  Scenario: When I ask for deliverer but token is invalid
    When I make a GET request to "/event/puzzle/deliverer?token=invalid-token"
    Then the response json should be:
      """
      { "message": "invalid deliverer token" }
      """
    And the response status should be 400


  Scenario: When I ask for deliverer which I owned and I can see the slug
    When I make a GET request to "/event/puzzle/deliverer?token=30b546a6-4710-43c1-9556-421906f2afe1"
    Then the response json should be:
      """
      { "slug": "COSCUP" }
      """
    And the response status should be 200
