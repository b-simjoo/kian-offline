# this file contains json schema for objects that
# receive from client.

LOGIN_SCHEMA = {
    "type": "object",
    "properties": {"username": {"type": "string"}, "password": {"type": "string"}},
    "additionalProperties": False,
    "required": ["username", "password"],
}

SCORE_SCHEMA = {
    "type": "object",
    "properties": {
        "id": {
            "anyOf": [{"type": "integer", "minimum": 1}, {"type": "null"}]
        },  # score to edit or add
        "student": {"type": "integer", "minimum": 1},  # student id
        "score": {"type": "number"},
        "full_score": {
            "type": "number",
            "minimum": 0,
        },
        "meeting": {
            "anyOf": [{"type": "integer", "minimum": 1}, {"type": "null"}]
        },  # meeting id
        "reason": {"type": ["string", "null"]},
    },
    "additionalProperties": False,
    "required": ["student", "score"],
}
