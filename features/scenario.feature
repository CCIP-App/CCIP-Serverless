@wip
Feature: Scenario
  Scenario: A scenario configured for role then display it
    Given there have some attendees
      | token                                | role     | display_name | first_used_at             |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | audience | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
    And there have a ruleset for "SITCON2023" with name "audience" and scenarios:
      """
      {
        "day1checkin": {
          "order": 0,
          "available_time": {
            "start": "2023-08-26 00:00:00 GMT+0",
            "end": "2023-09-26 00:00:00 GMT+0"
          },
          "display_text": {
            "en-US": "Day 1 Check-in",
            "zh-TW": "第一天報到"
          }
        }
      }
      """
    When I make a GET request to "/status?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
    Then the response status should be 200
    And the response json should be:
      """
      {
        "public_token": "041656f614f3b624ad8c7409c25db3b7e9a512ce",
        "user_id": "Aotoki",
        "first_use": 1692489600,
        "role": "audience",
        "scenario": {
          "day1checkin": {
            "order": 0,
            "available_time": 1693008000,
            "expire_time": 1695686400,
            "display_text": {
              "en-US": "Day 1 Check-in",
              "zh-TW": "第一天報到"
            },
            "used": null,
            "disabled": null,
            "attr": {}
          }
        },
        "attr": {}
      }
      """
  Scenario: A scenario configured but not matched attendee attribute
    Given there have some attendees
      | token                                | role     | metadata        | display_name | first_used_at             |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | audience | {"講師票": "N"} | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
    And there have a ruleset for "SITCON2023" with name "audience" and scenarios:
      """
        {
           "speakerCheckin":{
              "order":0,
                "available_time": {
                  "start": "2023-08-26 00:00:00 GMT+0",
                  "end": "2023-09-26 00:00:00 GMT+0"
                },
                "display_text":{
                 "en-US":"Speaker Check-in",
                 "zh-TW":"講師報到"
              },
              "conditions":{
                 "show":{
                    "type":"Attribute",
                    "args":[
                       "講師票",
                       "Y"
                    ]
                }
              }
           },
           "normalCheckin":{
              "order":1,
              "available_time": {
                "start": "2023-08-26 00:00:00 GMT+0",
                "end": "2023-09-26 00:00:00 GMT+0"
              },
              "display_text":{
                 "en-US":"Normal Check-in",
                 "zh-TW":"一般報到"
              },
              "conditions":{
                 "show": {
                    "type":"Attribute",
                    "args":[
                       "講師票",
                       "N"
                    ]
                 }
              }
           }
        }
      """
    When I make a GET request to "/status?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
    Then the response status should be 200
    And the response json should be:
      """
      {
        "public_token": "041656f614f3b624ad8c7409c25db3b7e9a512ce",
        "user_id": "Aotoki",
        "first_use": 1692489600,
        "role": "audience",
        "scenario": {
          "normalCheckin": {
            "order": 1,
            "available_time": 1693008000,
            "expire_time": 1695686400,
            "display_text": {
              "en-US": "Normal Check-in",
              "zh-TW": "一般報到"
            },
            "used": null,
            "disabled": null,
            "attr": {}
          }
        },
        "attr": {
          "講師票": "N"
        }
      }
      """
  Scenario: A scenario configured with extra metadata attached
  	Given there have some attendees
			| token                                | role     | metadata                      | display_name | first_used_at             |
			| f185f505-d8c0-43ce-9e7b-bb9e8909072d | audience | {"飲食": "葷"} | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
		And there have a ruleset for "SITCON2023" with name "audience" and scenarios:
			"""
				{
					 "lunch":{
							"order":0,
              "available_time": {
                "start": "2023-08-26 00:00:00 GMT+0",
                "end": "2023-09-26 00:00:00 GMT+0"
              },
							"display_text":{
								 "en-US":"Lunch",
								 "zh-TW":"午餐"
							},
							"conditions":{},
							"metadata": {
								"diet": { "key": "飲食" }
							}
					 }
				}
			"""
		When I make a GET request to "/status?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
		Then the response status should be 200
		And the response json should be:
			"""
			{
        "public_token": "041656f614f3b624ad8c7409c25db3b7e9a512ce",
				"user_id": "Aotoki",
				"first_use": 1692489600,
				"role": "audience",
				"scenario": {
					"lunch": {
						"order": 0,
            "available_time": 1693008000,
            "expire_time": 1695686400,
						"display_text": {
							"en-US": "Lunch",
							"zh-TW": "午餐"
						},
            "used": null,
						"disabled": null,
						"attr": {
							"diet": "葷"
						}
					}
				},
				"attr": {
				  "飲食": "葷"
				}
			}
			"""
