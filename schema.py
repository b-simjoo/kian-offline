# this file contains json schema for objects that
# receive from client.

LOGIN_SCHEMA = {
    "type": "object",
    "properties": {
        "username": {
            "type": "string"
        },
        "password": {
            "type": "string"
        }
    },
    "additionalProperties": False,
    "required": [
        "username",
        "password"
    ]
}

SCORE_SCHEMA = {
    "type": "object",
    "properties": {
        "id": {    # score to edit or add
            "anyOf":[
                {
                    "type":"integer",
                    "minimum":1
                },
                {
                    "type": "null"
                }
            ]
        },
        "student": {    # student id
            "type": "integer",
            "minimum": 1
        },
        "score": {
            "type": "number"
        },
        "full_score": {
            "type": "number",
            "minimum": 0,
        },
        "meeting": {    # meeting id
            "anyOf":[
                {
                    "type":"integer",
                    "minimum":1
                },
                {
                    "type": "null"
                }
            ]
        },
        "reason": {
            "type": ["string","null"]
        }
    },
    "additionalProperties": False,
    "required": [
        "student",
        "score",
        "full_score",
        "meeting",
        "reason"
    ]
}

