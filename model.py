from json import load
from peewee import (
    SqliteDatabase,
    Model,
    TextField,
    FixedCharField,
    BooleanField,
    ForeignKeyField,
    DateTimeField,
    FloatField,
    DateField,
    TimeField,
)
from datetime import datetime
from playhouse.shortcuts import model_to_dict

config: dict = load(open("config.json", "r"))

db = SqliteDatabase(config["database"], pragmas={"foreign_keys": 1})


class BaseModel(Model):
    class Meta:
        database = db

    def to_dict(
        self, recurse=True, backrefs=True, only=None, exclude=..., extra_attrs=None, max_depth=None, update={}
    ) -> dict[str, object]:
        """
        Convert a model instance (and any related objects) to a dictionary.

        :param bool recurse: Whether foreign-keys should be recursed.
        :param bool backrefs: Whether lists of related objects should be recursed.
        :param only: A list (or set) of field instances indicating which fields
            should be included.
        :param exclude: A list (or set) of field instances that should be
            excluded from the dictionary.
        :param list extra_attrs: Names of model instance attributes or methods
            that should be included.
        :param int max_depth: Maximum depth to recurse, value <= 0 means no max.
        """
        if exclude is Ellipsis:
            exclude = [Meeting.scores]  # type: ignore
        res = model_to_dict(
            self,
            recurse=recurse,
            backrefs=backrefs,
            only=only,
            exclude=exclude,
            extra_attrs=extra_attrs,
            max_depth=max_depth,
        )
        res.update(**update)
        return res


class Meeting(BaseModel):  # Chosen meeting name because to prevent collide with flask session
    date = DateField(default=lambda: datetime.now().date())
    start_at = TimeField(default=lambda: datetime.now().time())
    end_at = TimeField(null=True)
    in_progress = BooleanField(default=True)
    # attendances
    # scores

    @property
    def count_of_attendances(self):
        return self.attendances.count()  # type:ignore

    def to_dict(
        self, recurse=True, backrefs=True, only=None, exclude=None, extra_attrs=None, max_depth=None, update={}
    ) -> dict[str, object]:
        update["count_of_attendances"] = self.count_of_attendances
        return super().to_dict(recurse, backrefs, only, exclude, extra_attrs, max_depth, update)


class Student(BaseModel):
    name = TextField(unique=True)
    number = FixedCharField(max_length=11, unique=True)
    # scores
    # attendances
    # devices

    @property
    def total_score(self):
        return sum(map(lambda score: score.score, self.scores))  # type: ignore

    @property
    def total_full_score(self):
        return sum(map(lambda score: score.full_score, self.scores))  # type: ignore

    def to_dict(
        self, recurse=True, backrefs=True, only=None, exclude=None, extra_attrs=None, max_depth=None, update={}
    ) -> dict[str, object]:
        update["total_score"] = self.total_score
        update["total_full_score"] = self.total_full_score
        return super().to_dict(recurse, backrefs, only, exclude, extra_attrs, max_depth, update)


class Device(BaseModel):  # type: ignore
    mac = TextField(unique=True)
    blocked = BooleanField(default=False)
    student = ForeignKeyField(Student, null=True, backref="devices")
    registration_time = DateTimeField(default=datetime.now)
    # login_history


class Attendance(BaseModel):  # type: ignore
    student = ForeignKeyField(Student, backref="attendances")
    device = ForeignKeyField(Device, backref="login_history")
    meeting = ForeignKeyField(Meeting, backref="attendances")
    time = TimeField(default=lambda: datetime.now().time())


class Score(BaseModel):
    student = ForeignKeyField(Student, backref="scores")
    score = FloatField()
    full_score = FloatField(default=0)
    meeting = ForeignKeyField(Meeting, null=True, backref="scores")
    reason = TextField(null=True)


_TABLES_ = (Meeting, Student, Attendance, Score)
