Feature: Scenario
  Scenario: A scenario configured for role then display it
    Given there have some attendees
      | token                                | role     | display_name | first_used_at             |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | audience | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
    And the ruleset is:
      """
      {
        "day1checkin": {
          "version": "1.0",
          "order": 0,
          "messages": {
            "display": {
              "en-US": "Day 1 Check-in",
              "zh-TW": "第一天報到"
            }
          },
          "timeWindow": {
            "start": "2023-08-26T00:00:00Z",
            "end": "2023-09-26T00:00:00Z"
          },
          "conditions": {
            "show": { "type": "AlwaysTrue" },
            "unlock": { "type": "AlwaysTrue" }
          },
          "actions": [{ "type": "MarkUsed", "ruleId": "day1checkin" }],
          "metadata": {}
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
    And the ruleset is:
      """
        {
           "speakerCheckin":{
              "version": "1.0",
              "order":0,
              "messages": {
                "display": {
                  "en-US":"Speaker Check-in",
                  "zh-TW":"講師報到"
                }
              },
              "timeWindow": {
                "start": "2023-08-26T00:00:00Z",
                "end": "2023-09-26T00:00:00Z"
              },
              "conditions":{
                 "show":{
                    "type":"Attribute",
                    "key": "講師票",
                    "value": "Y"
                },
                "unlock": { "type": "AlwaysTrue" }
              },
              "actions": [{ "type": "MarkUsed", "ruleId": "speakerCheckin" }],
              "metadata": {}
           },
           "normalCheckin":{
              "version": "1.0",
              "order":1,
              "messages": {
                "display": {
                  "en-US":"Normal Check-in",
                  "zh-TW":"一般報到"
                }
              },
              "timeWindow": {
                "start": "2023-08-26T00:00:00Z",
                "end": "2023-09-26T00:00:00Z"
              },
              "conditions":{
                 "show": {
                    "type":"Attribute",
                    "key": "講師票",
                    "value": "N"
                 },
                 "unlock": { "type": "AlwaysTrue" }
              },
              "actions": [{ "type": "MarkUsed", "ruleId": "normalCheckin" }],
              "metadata": {}
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
		And the ruleset is:
			"""
				{
					 "lunch":{
							"version": "1.0",
							"order":0,
							"messages": {
								"display": {
									"en-US": "Lunch",
									"zh-TW": "午餐"
								}
							},
							"timeWindow": {
								"start": "2023-08-26T00:00:00Z",
								"end": "2023-09-26T00:00:00Z"
							},
							"conditions": {
								"show": { "type": "AlwaysTrue" },
								"unlock": { "type": "AlwaysTrue" }
							},
							"actions": [{ "type": "MarkUsed", "ruleId": "lunch" }],
							"metadata": {}
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
						"attr": {}
					}
				},
				"attr": {
				  "飲食": "葷"
				}
			}
			"""
