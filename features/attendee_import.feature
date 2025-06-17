@wip
Feature: Attendee Importation
  Scenario: POST /admin/attendees with a CSV file that contains attendee information
    When I make a POST request to "/admin/attendees" with file:
    """
    token,display_name,
    "fccfc8bfa07643a1ca8015cbe74f5f17","Aotoki",
    "93dc46e553ac602b0d6c6d7307e523f1","Danny",
    """
    Then the response status should be 200
