import pytest
from model import (  # noqa:F401
    database_proxy,
    Student,
    Device,
    Attendance,
    Score,
    Meeting,
    _TABLES_,
)
from peewee import Database, IntegrityError
from playhouse.db_url import connect
import json
from typing import Any
from datetime import date, time
from random import choices, randrange, choice
import os
from os.path import exists
from flask.testing import FlaskClient


def gen_mac():
    return ":".join((hex(randrange(256)).lstrip("0x").zfill(2) for _ in range(6)))


meetings = [
    {
        "date": date(2022, 10, 1),
        "start_at": time(14, 16, 3),
        "end_at": time(15, 50, 9),
        "in_progress": False,
    },
    {
        "date": date(2022, 10, 2),
        "start_at": time(14, 15, 3),
        "end_at": time(15, 45, 9),
        "in_progress": False,
    },
    {
        "date": date(2022, 10, 3),
        "start_at": time(14, 15, 3),
        "end_at": time(15, 45, 9),
        "in_progress": False,
    },
    {
        "date": date(2022, 10, 4),
        "start_at": time(14, 25, 3),
        "end_at": time(15, 55, 9),
        "in_progress": False,
    },
    {
        "date": date(2022, 12, 4),
        "start_at": time(14, 16, 3),
        "end_at": time(15, 47, 9),
        "in_progress": False,
    },
]

students: list[dict[str, Any]] = [
    # me & some random names!
    {
        "name": "BSimjoo",
        "number": "123456789",
    },
    {
        "name": "Evan Alexander",
        "number": "123456790",
    },
    {
        "name": "Adan Brady",
        "number": "1234567891",
    },
    {
        "name": "Quinn Wiggins",
        "number": "123456792",
    },
]

for student in students:
    student["devices"] = [{"mac": gen_mac()} for _ in range(randrange(10))]


scores = []
for student in students:
    student["attendances"] = []
    if student["devices"]:
        for meeting in choices(range(1, len(meetings)), k=randrange(len(meetings))):
            device = choice(student["devices"])
            student["attendances"].append({"device": device, "meeting": meeting})

    student["scores"] = []
    for meeting in choices(range(1, len(meetings)), k=randrange(len(meetings))):
        student["scores"].append(
            {
                "meeting": meeting,
                "score": randrange(-2, 11),
                "full_score": randrange(-2, 11),
                "reason": f'a score for {student["name"]}',
            }
        )


@pytest.fixture(scope="module")
def config() -> dict[str, Any]:
    return json.load(open("config.json", "r"))


@pytest.fixture(scope="session")
def mv_db():
    if exists("database_test.sqlite"):
        os.remove("database_test.sqlite")
    database_exists = exists("database.sqlite")
    if database_exists:
        os.rename("database.sqlite", "database.sqlite.bak")
    yield
    os.rename("database.sqlite", "database_test.sqlite")
    if database_exists:
        os.rename("database.sqlite.bak", "database.sqlite")


@pytest.fixture()
def db(mv_db, config):
    db_: Database = connect(config["database"])
    database_proxy.initialize(db_)
    db_.connect()
    db_.create_tables(_TABLES_)
    yield db_
    db_.close()


def test_save_data_to_database(db):
    for m in meetings:
        meeting = Meeting(
            date=m["date"],
            start_at=m["start_at"],
            end_at=m["end_at"],
            in_progress=m["in_progress"],
        )
        meeting.save()
        m["id"] = meeting.id  # type: ignore

    for s in students:
        student = Student(name=s["name"], number=s["number"])
        student.save()
        s["id"] = student.id  # type: ignore

        for d in s["devices"]:
            device = Device(mac=d["mac"], student=student)
            device.save()
            d["id"] = device.id  # type: ignore

        for a in s["attendances"]:
            attendance = Attendance(
                student=student,
                device=Device.get_by_id(a["device"]["id"]),
                meeting=Meeting.get_by_id(a["meeting"]),
            )
            attendance.save()
            a["id"] = attendance.id  # type: ignore

        for scr in s["scores"]:
            score = Score(
                student=student,
                score=scr["score"],
                full_score=scr["full_score"],
                meeting=Meeting.get_by_id(scr["meeting"]),
                reason="score for " + s["name"],
            )
            score.save()
            scr["id"] = score.id  # type: ignore


def test_database_saving_collision(db):
    for s in students:
        with pytest.raises(IntegrityError):
            student = Student(name=s["name"], number=s["number"])
            assert student.save() == 0

    with pytest.raises(IntegrityError):
        student = Student(
            name="Evan Alexander", number="987654321"
        )  # name is repeated but number is different
        assert student.save() == 0
        students.append(
            {
                "id": student.id,
                "name": "Evan Alexander",
                "number": "987654321",
                "devices": [],
                "attendances": [],
                "scores": [],
            }
        )


def test_get_data_from_database(db):
    for meeting_id, meeting in enumerate(meetings, 1):
        assert Meeting.get_by_id(meeting_id).date == meeting["date"]

    for student_id, student in enumerate(students, 1):
        assert Student.get_by_id(student_id).number == student["number"]
        for device in student["devices"]:
            Device.get(Device.mac == device["mac"])


class TestLogin:
    @pytest.fixture(scope="class")
    def test_client(self, mv_db, config):
        import app

        app.app.config.update({"TESTING": True})

        with app.app.test_client() as test_client:
            with app.app.app_context():
                yield test_client

    @pytest.mark.parametrize(
        "username,password,tries_left,error_code",
        [
            ("admin", "admin", 4, 401),
            ("admin", "admin", 3, 401),
            ("admin", "admin", 2, 401),
            ("admin", "admin", 1, 401),
            ("admin", "admin", "banned", 403),
            ("admin", "admin", "banned", 403),
        ],
    )
    def test_login_ban(self, test_client, username, password, tries_left, error_code):
        res = test_client.post(
            "api/v1/login", json={"username": username, "password": password}
        )
        if tries_left != "banned":
            assert res.json["tries_left"] == tries_left
        assert res.status_code == error_code

    def test_can_login(self, test_client):
        res = test_client.get("/api/v1/can_login")
        assert res.status_code == 403


@pytest.fixture(name="common_vars", scope="class")
def sample_manager_fixture():
    class CommonVars:
        def __init__(self):
            self.current_meeting = None

    return CommonVars()


class TestAPI:
    @pytest.fixture(scope="class")
    def test_client(self, mv_db, config):
        import app

        app.app.config.update({"TESTING": True})

        with app.app.test_client() as test_client:
            with app.app.app_context():
                yield test_client

    def test_whoami_before_register(self, test_client):
        res = test_client.get("/api/v1/whoami")
        assert res.status_code == 400

    def test_attendance_before_start_meeting(self, test_client):
        res = test_client.get("/api/v1/attendance")
        assert res.status_code == 404

    def test_create_meeting_before_login(self, test_client):
        res = test_client.post("/api/v1/current_meeting")
        assert res.status_code == 302

    def test_can_login(self, test_client):
        res = test_client.get("/api/v1/can_login")
        assert res.status_code == 200

    def test_login(self, test_client):
        res = test_client.post(
            "api/v1/login", json={"username": "blabla", "password": "foobar"}
        )
        assert res.status_code == 401
        assert res.is_json
        assert res.json["tries_left"] == 4  # type: ignore

        res = test_client.post(
            "api/v1/login", json={"username": "kian pirfalak", "password": "foobar"}
        )
        assert res.status_code == 401
        assert res.is_json
        assert res.json["tries_left"] == 3  # type: ignore

        res = test_client.post(
            "api/v1/login", json={"username": "kian pirfalak", "password": "admin"}
        )
        assert res.status_code == 200

    def test_login_again(self, test_client):
        res = test_client.post(
            "api/v1/login", json={"username": "kian pirfalak", "password": "admin"}
        )
        assert res.status_code == 200

    def test_create_meeting_after_login(self, test_client, common_vars):
        res = test_client.post("/api/v1/current_meeting")
        assert res.status_code == 200
        common_vars.current_meeting = res.json

    def test_create_meeting_again(self, test_client):
        res = test_client.post("/api/v1/current_meeting")
        assert res.status_code == 202

    def test_attendance_before_registration(self, test_client):
        res = test_client.get("/api/v1/attendance")
        assert res.status_code == 403

    def test_register(self, test_client):
        # student not found
        res = test_client.get("/api/v1/register?std_num=546789123")
        assert res.status_code == 404

        # std_num didn't sent
        res = test_client.get("/api/v1/register")
        assert res.status_code == 400

        # normal register
        res = test_client.get("/api/v1/register?std_num=123456789")
        assert res.status_code == 200
        assert res.is_json
        assert res.json["name"] == "BSimjoo"  # type: ignore #noqa

        # already registered
        res = test_client.get("api/v1/register?stud_num=123456789")
        assert res.status_code == 403
        res = test_client.get("api/v1/register?stud_num=987654321")
        assert res.status_code == 403

    def test_whoami_after_register(self, test_client):
        res = test_client.get("/api/v1/whoami")
        assert res.status_code == 200
        assert res.is_json
        assert (
            res.json["name"] == "BSimjoo"  # type:ignore # noqa
            and res.json["number"] == "123456789"  # type:ignore # noqa
        )

    def test_attendance_after_registration(self, test_client):
        res = test_client.get("/api/v1/attendance")
        assert res.status_code == 200
        assert res.is_json
        assert "student" in res.json and "meetings" in res.json
        res_student = res.json["student"]
        res_meetings = res.json["meetings"]
        student = students[0]

        # ----Checking student basic info----
        assert all(
            [
                student["id"] == res_student["id"],
                student["name"] == res_student["name"],
                student["number"] == res_student["number"],
            ]
        )

        # ----Checking meeting properties name----
        assert all(
            [
                all(
                    [
                        p in meeting
                        for p in ("id", "date", "start_at", "end_at", "in_progress")
                    ]
                )
                for meeting in res_meetings
            ]
        )

        # ----'scores' and 'attendances' should not exists here!----
        assert all(
            [
                ("scores" not in meeting and "attendances" not in meeting)
                for meeting in res_meetings
            ]
        )

        # ----Checking meeting match----
        assert all(
            [
                all(
                    [
                        meeting["id"] == res_meeting["id"],
                        meeting["date"].isoformat() == res_meeting["date"],
                    ]
                )
                for res_meeting, meeting in zip(res_meetings, meetings)
                if not res_meeting["in_progress"]
            ]
        )

        # ----There should be a meeting in progress----
        current_meeting = {}
        for meeting in res_meetings:
            if meeting["in_progress"]:
                current_meeting = meeting
                break
        else:
            assert False, "No in progress meeting found"

        # ----Checking attendance for this meeting is registered----
        assert current_meeting["id"] in [
            a["meeting"] for a in res_student["attendances"]
        ]

        # ----Checking scores----
        scores, res_scores = student["scores"], res_student["scores"]

        # ----Checking scores properties name----
        assert all(
            [
                all(
                    [
                        p in res_score
                        for p in ("id", "score", "full_score", "meeting", "reason")
                    ]
                )
                for res_score in res_scores
            ]
        )

        # ----'meeting' should be int here----
        assert all([isinstance(res_score["meeting"], int) for res_score in res_scores])

        # ----Checking scores match----
        assert all(
            [
                all(
                    [
                        score["id"] == res_score["id"],
                        score["score"] == res_score["score"],
                    ]
                )
                for score, res_score in zip(scores, res_scores)
            ]
        )

        # ----Checking attendances----
        res_attendances = res_student["attendances"]
        attendances = student["attendances"]

        # ----Checking scores properties name----
        assert all(
            [
                all([p in attendance for p in ("id", "device", "meeting", "time")])
                for attendance in res_attendances
            ]
        )

        # ----Checking attendance match----
        assert all(
            [
                all(
                    [
                        res_attendance["id"] == attendance["id"],
                        res_attendance["meeting"] == attendance["meeting"],
                    ]
                )
                for res_attendance, attendance in zip(res_attendances, attendances)
            ]
        )

        # ----'meeting' should be int here----
        assert all([isinstance(a["meeting"], int) for a in res_attendances])

    def test_attendance_again(self, test_client: FlaskClient):
        res = test_client.get("/api/v1/attendance")
        assert res.status_code == 203
        assert res.is_json
        assert "student" in res.json and "meetings" in res.json

    def test_get_students(self, test_client: FlaskClient):
        res = test_client.get("api/v1/students")
        assert res.status_code == 200
        assert res.is_json
        assert len(res.json) == len(students)

        assert all(
            [
                all(
                    [
                        p in student
                        for p in (
                            "id",
                            "name",
                            "number",
                            "attendances",
                            "scores",
                            "devices",
                            "total_score",
                            "total_full_score",
                        )
                    ]
                )
                for student in res.json
            ]
        )

    def test_get_meetings(self, test_client: FlaskClient):
        res = test_client.get("api/v1/meetings")
        assert res.status_code == 200
        assert res.is_json
        assert len(res.json) == len(meetings) + 1

        assert all(
            [
                all(
                    [
                        p in meeting
                        for p in (
                            "id",
                            "date",
                            "start_at",
                            "end_at",
                            "in_progress",
                            "count_of_attendances",
                            "attendances",
                            "scores",
                        )
                    ]
                )
                for meeting in res.json
            ]
        )

    def test_get_meeting(self, test_client: FlaskClient, common_vars):
        res = test_client.get(f"api/v1/meetings/{common_vars.current_meeting['id']}")
        assert res.status_code == 200
        assert res.is_json
        res_json = res.json  # assigning for log
        assert all(
            [
                (p in res_json)
                for p in (
                    "id",
                    "date",
                    "start_at",
                    "end_at",
                    "in_progress",
                    "attendances",
                    "scores",
                    "count_of_attendances",
                )
            ]
        )
        assert res_json["id"] == common_vars.current_meeting["id"]
        common_vars.current_meeting = res_json

    def test_get_current_meeting(self, test_client: FlaskClient, common_vars):
        res = test_client.get("api/v1/current_meeting")
        assert res.status_code == 200
        assert res.is_json
        res_json = res.json  # assigning for log
        assert all(
            [
                (p in res_json)
                for p in (
                    "id",
                    "date",
                    "start_at",
                    "end_at",
                    "in_progress",
                    "attendances",
                    "scores",
                    "count_of_attendances",
                )
            ]
        )
        assert all(
            [
                (common_vars.current_meeting[p] == res_json[p])
                for p in (
                    "id",
                    "date",
                    "start_at",
                    "end_at",
                    "in_progress",
                    "attendances",
                    "scores",
                    "count_of_attendances",
                )
            ]
        )

    def test_end_current_meeting(self, test_client: FlaskClient, common_vars):
        res = test_client.delete("/api/v1/current_meeting")
        assert res.status_code == 200
        assert res.is_json
        res_json = res.json  # assigning for log
        assert all(
            [
                (p in res_json)
                for p in (
                    "id",
                    "date",
                    "start_at",
                    "end_at",
                    "in_progress",
                    "attendances",
                    "scores",
                    "count_of_attendances",
                )
            ]
        )
        common_vars.current_meeting["in_progress"] = False
        assert all(
            [
                (common_vars.current_meeting[p] == res_json[p])
                for p in (
                    "id",
                    "date",
                    "start_at",
                    "in_progress",
                    "attendances",
                    "scores",
                    "count_of_attendances",
                )
            ]
        )

    def test_end_current_meeting_again(self, test_client: FlaskClient):
        res = test_client.delete("/api/v1/current_meeting")
        assert res.status_code == 404

    def test_get_current_meeting_again(self, test_client: FlaskClient):
        res = test_client.get("/api/v1/current_meeting")
        assert res.status_code == 404
