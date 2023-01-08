from flask.json.provider import DefaultJSONProvider
from datetime import date, time


class CustomJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        try:
            if isinstance(obj, date):
                return obj.isoformat()
            elif isinstance(obj, time):
                return obj.isoformat()
            iterable = iter(obj)
        except TypeError:
            pass
        else:
            return list(iterable)
        return DefaultJSONProvider.default(self, obj)  # type: ignore
