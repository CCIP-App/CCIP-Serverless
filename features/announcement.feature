Feature: Announcement
  Scenario: GET /announcement without any announcements populated
    When I make a GET request to "/announcement"
    Then the response status should be 200
    And the response json should be:
      """
      []
      """
  Scenario: GET /announcement with token returns announcements based on token owner's role, ordered by time announced in descending order
    Given there have some attendees
      | token                                | role  | metadata                                            | display_name | first_used_at             |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | staff | {"_scenario_checkin": "2023-08-27 00:00:00 GMT+0" } | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
    Given there are some announcements
      | id                                   | announced_at              | message                                             | uri                                           | roles                 |
      | 40422d68-405d-4142-979e-bce8003dcb18 | 2023-08-29 00:00:00 GMT+0 | { "en-US": "hello world 1", "zh-TW": "世界你好 1" } | https://testability.opass.app/announcements/1 | ["audience"]          |
      | 04058f51-09ad-4008-b767-e72086c37561 | 2023-08-30 00:00:00 GMT+0 | { "en-US": "hello world 2", "zh-TW": "世界你好 2" } | https://testability.opass.app/announcements/2 | ["audience", "staff"] |
      | a163302b-32d9-4e80-a0b3-7b8ee8b1e932 | 2023-08-31 01:00:00 GMT+0 | { "en-US": "hello staff", "zh-TW": "工作人員你好" } | https://testability.opass.app/announcements/3 | ["staff"]             |
    When I make a GET request to "/announcement?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
    Then the response json should be:
      """
      [
        {
          "datetime": 1693443600,
          "msgEn": "hello staff",
          "msgZh": "工作人員你好",
          "uri": "https://testability.opass.app/announcements/3"
        },
        {
          "datetime": 1693353600,
          "msgEn": "hello world 2",
          "msgZh": "世界你好 2",
          "uri": "https://testability.opass.app/announcements/2"
        }
      ]
      """
    And the response status should be 200
  Scenario: GET /announcement with nonexistent token returns announcements for audiences, ordered by time announced in descending order
    Given there are some announcements
      | id                                   | announced_at              | message                                             | uri                                           | roles                 |
      | 40422d68-405d-4142-979e-bce8003dcb18 | 2023-08-29 00:00:00 GMT+0 | { "en-US": "hello world 1", "zh-TW": "世界你好 1" } | https://testability.opass.app/announcements/1 | ["audience"]          |
      | 04058f51-09ad-4008-b767-e72086c37561 | 2023-08-30 00:00:00 GMT+0 | { "en-US": "hello world 2", "zh-TW": "世界你好 2" } | https://testability.opass.app/announcements/2 | ["audience", "staff"] |
      | a163302b-32d9-4e80-a0b3-7b8ee8b1e932 | 2023-08-31 01:00:00 GMT+0 | { "en-US": "hello staff", "zh-TW": "工作人員你好" } | https://testability.opass.app/announcements/3 | ["staff"]             |
    When I make a GET request to "/announcement?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
    Then the response status should be 200
    And the response json should be:
      """
      [
        {
          "datetime": 1693353600,
          "msgEn": "hello world 2",
          "msgZh": "世界你好 2",
          "uri": "https://testability.opass.app/announcements/2"
        },
        {
          "datetime": 1693267200,
          "msgEn": "hello world 1",
          "msgZh": "世界你好 1",
          "uri": "https://testability.opass.app/announcements/1"
        }
      ]
      """
  Scenario: GET /announcement without token returns announcements for audience, ordered by time announced in descending order
    Given there are some announcements
      | id                                   | announced_at              | message                                             | uri                                           | roles        |
      | 40422d68-405d-4142-979e-bce8003dcb18 | 2023-08-29 00:00:00 GMT+0 | { "en-US": "hello world 1", "zh-TW": "世界你好 1" } | https://testability.opass.app/announcements/1 | ["audience"] |
      | 04058f51-09ad-4008-b767-e72086c37561 | 2023-08-30 00:00:00 GMT+0 | { "en-US": "hello world 2", "zh-TW": "世界你好 2" } | https://testability.opass.app/announcements/2 | ["audience"] |
      | a163302b-32d9-4e80-a0b3-7b8ee8b1e932 | 2023-08-31 01:00:00 GMT+0 | { "en-US": "hello staff", "zh-TW": "工作人員你好" } | https://testability.opass.app/announcements/3 | ["staff"]    |
    When I make a GET request to "/announcement"
    Then the response status should be 200
    And the response json should be:
      """
      [
        {
          "datetime": 1693353600,
          "msgEn": "hello world 2",
          "msgZh": "世界你好 2",
          "uri": "https://testability.opass.app/announcements/2"
        },
        {
          "datetime": 1693267200,
          "msgEn": "hello world 1",
          "msgZh": "世界你好 1",
          "uri": "https://testability.opass.app/announcements/1"
        }
      ]
      """
  Scenario: POST /announcement for audience
    When I make a POST request to "/announcement":
      """
      {
        "msg_en": "hello world",
        "msg_zh": "世界你好",
        "uri": "https://testability.opass.app/announcements/1",
        "role": ["audience"]
      }
      """
    Then the response json should be:
      """
      {
        "status": "OK"
      }
      """
    And the response status should be 200
    When I make a GET request to "/announcement"
    Then the response json should be:
      """
      [
        {
          "datetime": 1693065600,
          "msgEn": "hello world",
          "msgZh": "世界你好",
          "uri": "https://testability.opass.app/announcements/1"
        }
      ]
      """
    And the response status should be 200
