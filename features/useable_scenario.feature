Feature: Useable Scenario
  Scenario: When scenario is used get status can see used time
    Given there have some attendees
      | token                                | role     | metadata                                            | display_name | first_used_at             |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | audience | {"_rule_checkin": "1693094400" } | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
    And the ruleset is:
      """
      {
         "checkin":{
            "version": "1.0",
            "order":0,
            "messages": {
              "display": {
                "en-US":"Check-in",
                "zh-TW":"報到"
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
            "actions": [{ "type": "MarkUsed", "ruleId": "checkin" }],
            "metadata": {}
         }
      }
      """
    When I make a GET request to "/status?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
    Then the response json should be:
      """
      {
        "public_token": "041656f614f3b624ad8c7409c25db3b7e9a512ce",
        "user_id": "Aotoki",
        "first_use": 1692489600,
        "role": "audience",
        "scenario": {
          "checkin": {
            "order": 0,
            "available_time": 1693008000,
            "expire_time": 1695686400,
            "display_text": {
              "en-US": "Check-in",
              "zh-TW": "報到"
            },
            "used": 1693094400,
            "disabled": null,
            "attr": {}
          }
        },
        "attr": {}
      }
      """
      And the response status should be 200
	Scenario: When attendee try to use a unused scenario
		Given there have some attendees
      | token                                | role     | metadata | display_name | first_used_at             |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | audience |          | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
    And the ruleset is:
      """
      {
         "checkin":{
            "version": "1.0",
            "order":0,
            "messages": {
              "display": {
                "en-US":"Check-in",
                "zh-TW":"報到"
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
            "actions": [{ "type": "MarkUsed", "ruleId": "checkin" }],
            "metadata": {}
         }
      }
      """
		When I make a GET request to "/use/checkin?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
		Then the response status should be 200
		And the response json should have property "scenario.checkin.used" is not null
	Scenario: When attendee use checkin scenario and unlock welcom kit
    Given there have some attendees
      | token                                | role     | metadata | display_name | first_used_at             |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | audience |          | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
    And the ruleset is:
      """
			{
			  "checkin":{
						"version": "1.0",
						"order":0,
						"messages": {
						  "display": {
							  "en-US":"Check-in",
							  "zh-TW":"報到"
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
						"actions": [{ "type": "MarkUsed", "ruleId": "checkin" }],
						"metadata": {}
        },
        "welcomkit": {
          "version": "1.0",
          "order": 1,
          "messages": {
            "display": {
              "en-US": "Welcom Kit",
              "zh-TW": "迎賓袋"
            }
          },
          "timeWindow": {
            "start": "2023-08-26T00:00:00Z",
            "end": "2023-09-26T00:00:00Z"
          },
          "conditions": {
            "show": { "type": "AlwaysTrue" },
            "unlock": {
              "type": "UsedRule",
              "ruleId": "checkin"
            }
          },
          "actions": [{ "type": "MarkUsed", "ruleId": "welcomkit" }],
          "metadata": {}
        }
			}
			"""
		When I make a GET request to "/use/checkin?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
    Then the response status should be 200
    And the response json should be:
      """
      {
        "public_token": "041656f614f3b624ad8c7409c25db3b7e9a512ce",
        "user_id": "Aotoki",
        "first_use": 1692489600,
        "role": "audience",
        "scenario": {
          "checkin": {
            "order": 0,
            "available_time": 1693008000,
            "expire_time": 1695686400,
            "display_text": {
              "en-US": "Check-in",
              "zh-TW": "報到"
            },
            "used": 1693065600,
            "disabled": null,
            "attr": {}
          },
          "welcomkit": {
            "order": 1,
            "available_time": 1693008000,
            "expire_time": 1695686400,
            "display_text": {
              "en-US": "Welcom Kit",
              "zh-TW": "迎賓袋"
            },
            "used": null,
            "disabled": null,
            "attr": {}
          }
        },
        "attr": {}
      }
      """
	Scenario: When attendee try to use a invisible scenario
		Given there have some attendees
			| token                                | role     | metadata | display_name | first_used_at             |
			| f185f505-d8c0-43ce-9e7b-bb9e8909072d | audience |          | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
		And the ruleset is:
			"""
			{
				 "vipkit":{
						"version": "1.0",
						"order":0,
						"messages": {
						  "display": {
							  "en-US":"Special Kit",
							  "zh-TW":"獨家紀念品"
						  }
						},
						"timeWindow": {
              "start": "2023-08-26T00:00:00Z",
              "end": "2023-09-26T00:00:00Z"
            },
						"conditions": {
							"show": {
								"type": "Attribute",
								"key": "個人贊助",
								"value": "Y"
							},
							"unlock": { "type": "AlwaysTrue" }
						},
						"actions": [{ "type": "MarkUsed", "ruleId": "vipkit" }],
						"metadata": {}
				 }
			}
			"""
		When I make a GET request to "/use/vipkit?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
		Then the response status should be 400
		And the response json should be:
			"""
			{
				"message": "invalid scenario"
			}
			"""
	Scenario: When attendee try to use a used scenario
    Given there have some attendees
      | token                                | role     | metadata                                            | display_name | first_used_at             |
      | f185f505-d8c0-43ce-9e7b-bb9e8909072d | audience | {"_rule_checkin": "1693094400" } | Aotoki       | 2023-08-20 00:00:00 GMT+0 |
    And the ruleset is:
      """
      {
         "checkin":{
            "version": "1.0",
            "order":0,
            "messages": {
              "display": {
                "en-US":"Check-in",
                "zh-TW":"報到"
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
            "actions": [{ "type": "MarkUsed", "ruleId": "checkin" }],
            "metadata": {}
         }
      }
      """
    When I make a GET request to "/use/checkin?token=f185f505-d8c0-43ce-9e7b-bb9e8909072d"
    Then the response json should be:
      """
      {
        "message": "has been used"
      }
      """
    And the response status should be 400
