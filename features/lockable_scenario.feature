@wip
Feature: Lockable Scenario
  Scenario: A scenario can unlock by attendee metadata
    Given there have some attendees
      | token                                | role     | metadata         | display_name | first_used_at             |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | audience | {"個人贊助":"Y"} | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
    And the ruleset is:
      """
      {
         "vipkit":{
            "version": "1.0",
            "order":0,
            "messages": {
              "display": {
                "en-US":"Special Gift",
                "zh-TW":"獨家紀念品"
              }
            },
            "timeWindow": {
              "start": "2023-08-26T00:00:00Z",
              "end": "2023-09-26T00:00:00Z"
            },
            "conditions": {
               "show": { "type": "AlwaysTrue" },
               "unlock": {
                  "type":"Attribute",
                  "key": "個人贊助",
                  "value": "Y"
               }
            },
            "actions": [{ "type": "MarkUsed", "ruleId": "vipkit" }],
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
          "vipkit": {
            "order": 0,
            "available_time": 1693008000,
            "expire_time": 1695686400,
            "display_text": {
              "en-US": "Special Gift",
              "zh-TW": "獨家紀念品"
            },
            "used": null,
            "disabled": null,
            "attr": {}
          }
        },
        "attr": {
          "個人贊助": "Y"
        }
      }
      """
	Scenario: Unlock by and condition
		Given there have some attendees
			| token                                | role     | metadata                         | display_name | first_used_at             |
			| f185f505-d8c0-43ce-9e7b-bb9e8909072d | audience | {"個人贊助":"Y", "_sponsor":"Y"} | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
		And there have a ruleset for "SITCON2023" with name "audience" and scenarios:
			"""
			{
				"vipkit":{
					"version": "1.0",
					"order":0,
					"messages": {
					  "display": {
						  "en-US":"Special Gift",
						  "zh-TW":"獨家紀念品"
					  }
					},
					"timeWindow": {
            "start": "2023-08-26T00:00:00Z",
            "end": "2023-09-26T00:00:00Z"
          },
					"conditions": {
						"show": { "type": "AlwaysTrue" },
						"unlock": {
							"type":"And",
							"children":[
								{
									"type":"Attribute",
									"key": "個人贊助",
									"value": "Y"
								},
								{
									"type":"Attribute",
									"key": "_sponsor",
									"value": "Y"
								}
							]
						}
					},
					"actions": [{ "type": "MarkUsed", "ruleId": "vipkit" }],
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
					"vipkit": {
						"order": 0,
            "available_time": 1693008000,
            "expire_time": 1695686400,
						"display_text": {
							"en-US": "Special Gift",
							"zh-TW": "獨家紀念品"
						},
            "used": null,
            "disabled": null,
            "attr": {}
					}
				},
				"attr": {
					"個人贊助": "Y"
				}
			}
			"""
	Scenario: Unlock by or condition
		Given there have some attendees
			| token                                | role     | metadata                         | display_name | first_used_at             |
			| f185f505-d8c0-43ce-9e7b-bb9e8909072d | audience | {"個人贊助":"Y", "_sponsor":"N"} | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
		And there have a ruleset for "SITCON2023" with name "audience" and scenarios:
			"""
			{
				"vipkit":{
					"version": "1.0",
					"order":0,
					"messages": {
					  "display": {
						  "en-US":"Special Gift",
						  "zh-TW":"獨家紀念品"
					  }
					},
					"timeWindow": {
            "start": "2023-08-26T00:00:00Z",
            "end": "2023-09-26T00:00:00Z"
          },
					"conditions": {
						"show": { "type": "AlwaysTrue" },
						"unlock": {
							"type":"Or",
							"children":[
								{
									"type":"Attribute",
									"key": "個人贊助",
									"value": "Y"
								},
								{
									"type":"Attribute",
									"key": "_sponsor",
									"value": "Y"
								}
							]
						}
					},
					"actions": [{ "type": "MarkUsed", "ruleId": "vipkit" }],
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
					"vipkit": {
						"order": 0,
						"available_time": 1693008000,
            "expire_time": 1695686400,
						"display_text": {
							"en-US": "Special Gift",
							"zh-TW": "獨家紀念品"
						},
            "used": null,
            "disabled": null,
            "attr": {}
					}
				},
				"attr": {
					"個人贊助": "Y"
				}
			}
			"""
