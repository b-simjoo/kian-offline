from flask import (
    Flask,
    request,
    session,
    render_template,
    redirect,
    jsonify,
    g,
    url_for,
    abort,
)
from flask_session import Session
from flask_expects_json import expects_json
from datetime import timedelta, datetime
from getmac import get_mac_address
from peewee import DoesNotExist, Database
from jsonschema import ValidationError
from customjsonprovider import CustomJSONProvider
from playhouse.flask_utils import FlaskDB

from model import database_proxy, Student, Device, Attendance, Score, Meeting, _TABLES_
from schema import LOGIN_SCHEMA, SCORE_SCHEMA

import json
import functools


Flask.json_provider_class = CustomJSONProvider
app = Flask(__name__, static_folder=r"templates\assets")
config: dict = json.load(open("config.json", "r"))
app.config["DATABASE"] = config["database"]
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=2)
app.config["local admin"] = config.get("local admin", True)
app.config["admin username"] = config.get("admin username", "kian pirfalak")
app.config["admin password"] = config.get("admin password", "admin")
if (
    app.config["admin username"] == "kian pirfalak"
    or app.config["admin password"] == "admin"
):
    app.logger.warning("Using default username or password for admin.")
db_wrapper = FlaskDB(app)
Session(app)

db: Database = db_wrapper.database  # type: ignore
database_proxy.initialize(db)
with db:
    db.create_tables(_TABLES_)


@app.before_request
def _before_request():
    if "meeting" not in g:
        g.meeting = Meeting.get_or_none(Meeting.in_progress == True)  # noqa: E712

    if "mac" not in session:
        if request.remote_addr in ("localhost", "127.0.0.1") or app.testing:
            mac = "local"
        else:
            mac = get_mac_address(ip=request.remote_addr)
        device, created = Device.get_or_create(mac=mac)
        if created:
            device.save()
        session["mac"] = mac
        session["device"] = device


@app.errorhandler(400)
def bad_request(error):
    if isinstance(error.description, ValidationError):
        return jsonify(), 400
    return error


@app.route("/")
def index():
    if session["mac"] == "local" and not (app.testing or app.debug):
        return redirect("admin")
    return render_template(
        "students.html", registered=(session["device"].student is not None)
    )


# An easter-egg for my students!
EASTER_EGG = " EASTER EGG: I'm so happy that you are reading this! good luck and hack the planet! BSimjoo ;-)"


@app.route("/api/v1/register")
def register_device():
    device = session["device"]
    if (student := device.student) is None:  # device is not registered
        if not (std_num := request.args.get("std_num")) in (None, ""):
            if (student := Student.get_or_none(Student.number == std_num)) is not None:
                device.student = student
                device.save()
                session["student"] = student
                return jsonify(name=student.name)
            else:  # student not existed
                return (
                    jsonify(info="student not existed. check std_num." + EASTER_EGG),
                    404,
                )
        else:  # std_num didn't send
            return jsonify(info="std_num didn't send." + EASTER_EGG), 400
    else:  # The student has already registered this device
        return (
            jsonify(
                name=student.name,
                info="device is already register, new registration is forbidden."
                + EASTER_EGG,
            ),
            403,
        )


@app.route("/api/v1/whoami")
def whoami():
    device = session["device"]
    if (student := device.student) is not None:
        return jsonify(name=student.name, number=student.number)
    abort(400)


@app.route("/api/v1/attendance")
def attendance():
    if g.meeting is not None:
        device = session.get("device")
        if (student := device.student) is not None:  # type: ignore
            query = (
                g.meeting.attendances.select()
                .join(Student, on=Attendance.student == Student.id)  # type: ignore
                .where(Student.id == student.id)  # type: ignore
            )
            code = 200
            res = {}
            if query.count() != 0:
                code = 203
            else:
                Attendance.create(
                    student=student, device=device, meeting=g.meeting
                ).save()
            res = {
                "student": student.to_dict(max_depth=1),
                "meetings": list(Meeting.select().dicts()),
            }
            return jsonify(res), code
        else:  # user has not registered yet
            return jsonify(info="You must register first." + EASTER_EGG), 403
    else:
        return jsonify(info="session did not started yet." + EASTER_EGG), 404


@app.route("/admin")
def admin():
    if app.config.get("admin from localhost", True):
        if request.remote_addr not in ["localhost", "127.0.0.1"]:
            return redirect("/")
    return render_template("admin.html", admin=session.get("admin", False))


@app.route("/api/v1/login", methods=["POST"])
@expects_json(LOGIN_SCHEMA)
def login():
    if app.config.get("local admin", True):
        if request.remote_addr not in ["localhost", "127.0.0.1"]:
            return redirect("/")
    if session.get("admin"):
        return jsonify()
    if session.get("tries_left", 5) > 0:
        username = g.data["username"]
        password = g.data["password"]
        if username and password:
            if (app.config["admin username"], app.config["admin password"]) == (
                username,
                password,
            ):
                session["admin"] = True
                session["tries_left"] = 5
                return jsonify()
        session["tries_left"] = session.get("tries_left", 5) - 1
        if session["tries_left"] == 0:
            return jsonify(info="login failed, you got banned." + EASTER_EGG), 403
        return (
            jsonify(
                tries_left=session["tries_left"], info="login failed." + EASTER_EGG
            ),
            401,
        )
    else:
        return jsonify(info="you are banned." + EASTER_EGG), 403


@app.route("/api/v1/can_login")
def can_login():
    if app.config.get("local admin", True):
        if request.remote_addr not in ["localhost", "127.0.0.1"]:
            abort(403)
    if session.get("tries_left", 5) <= 0:
        abort(403)
    return jsonify()


def login_required(func):
    @functools.wraps(func)
    def wrapper(*args, **kw):
        if app.config.get("local admin", True):
            if request.remote_addr not in ["localhost", "127.0.0.1"]:
                return redirect("/")
        if session.get("admin"):
            return func(*args, **kw)
        return redirect(url_for("login"))

    return wrapper


@app.route("/api/v1/students")
@login_required
def get_students():
    return jsonify([std.to_dict(max_depth=1) for std in Student.select()])


@app.route("/api/v1/students/<int:student_id>")
def get_student(student_id):
    if session.get("admin") or (
        (std := session.get("student")) and std.id == student_id
    ):
        if (student := Student.get_or_none(Student.id == student_id)) is not None:  # type: ignore
            return jsonify(student.to_dict(max_depth=1))  # type: ignore
        abort(404)
    return (
        jsonify(
            info="You're not authorized, get your info or login as admin!" + EASTER_EGG
        ),
        401,
    )


@app.route("/api/v1/attendances")
@login_required
def get_attendances():
    return jsonify([a.to_dict(max_depth=1) for a in Attendance.select()])


@app.route("/api/v1/attendances/<int:attendance_id>")
def get_attendance(attendance_id):
    if session.get("admin") or (
        (std := session.get("student"))
        and std.attendances.select(
            Attendance.id == attendance_id  # type:ignore
        ).count()
        == 1
    ):
        if (a := Attendance.get_or_none(Attendance.id == attendance_id)) is not None:  # type: ignore
            return jsonify(a.to_dict(max_depth=1))
        abort(404)
    return (
        jsonify(
            info="You're not authorized, get your attendance info or login as admin!"
            + EASTER_EGG
        ),
        401,
    )


@app.route("/api/v1/devices")
@login_required
def get_devices():
    return jsonify([device.to_dict(max_depth=1) for device in Device.select()])


@app.route("/api/v1/devices/<int:device_id>")
def get_device(device_id):
    if session.get("admin") or (
        (std := session.get("student")) and std.devices.select(Device.id == device_id).count() == 1  # type: ignore
    ):
        if (device := Device.get_or_none(Device.id == device_id)) is not None:  # type: ignore
            return jsonify(device.to_dict(max_depth=1))
        abort(404)
    return (
        jsonify(
            info="You're not authorized, get your device or login as admin!"
            + EASTER_EGG
        ),
        401,
    )


@app.route("/api/v1/current_meeting")
@login_required
def get_current_meeting():
    if g.meeting is not None and g.meeting.in_progress:
        return jsonify(g.meeting.to_dict(max_depth=1))
    return jsonify(info="no in progress meeting"), 404


@app.route("/api/v1/current_meeting", methods=["POST"])
@login_required
def start_meeting():
    if g.meeting is None or not g.meeting.in_progress:
        g.meeting = Meeting.create()
    else:
        return jsonify(info="a meeting is already in progress"), 202
    if g.meeting.save() == 1:
        return jsonify(g.meeting.to_dict(max_depth=1))
    return jsonify(info="Unknown error while creating database record"), 500


@app.route("/api/v1/current_meeting", methods=["DEL"])
@login_required
def end_current_meeting():
    if g.meeting is not None and g.meeting.in_progress:
        g.meeting.in_progress = False
        g.meeting.end_at = datetime.now().time()
        if g.meeting.save():
            return jsonify(g.meeting.to_dict(max_depth=1))
        return jsonify(info="Unknown error while saving database record"), 500
    return jsonify(info="no in progress meeting"), 404


@app.route("/api/v1/meetings")
@login_required
def get_meetings():
    return jsonify([meeting.to_dict(max_depth=1) for meeting in Meeting.select()])


@app.route("/api/v1/meetings/<int:meeting_id>")
@login_required
def get_meeting(meeting_id: int):
    if (meet := Meeting.get_or_none(Meeting.id == meeting_id)) is not None:  # type: ignore
        return jsonify(meet.to_dict(max_depth=1))
    abort(404)


# TODO: add delete meeting feature. this method didn't used in front-end
# @app.route("/api/v1/meetings/<int:meeting_id>", methods=["DEL"])
# @login_required
# def del_meetings(meeting_id: int):
#     if (meet := Meeting.get_or_none(Meeting.id == meeting_id)) is not None:  # type: ignore
#         if (rows := meet.delete_instance(True)) > 0:
#             if meet == g.meeting:
#                 g.meeting = None
#             return jsonify(rows=rows)
#         return jsonify(info="didn't deleted any row"), 500
#     abort(404)


@app.route("/api/v1/score", methods=["POST"])
@login_required
@expects_json(SCORE_SCHEMA)
def add_edit_score():
    try:
        student = Student.get_by_id(g.data["student"])
        meeting = g.data.get("meeting") and Meeting.get_by_id(g.data["meeting"])
        score = g.data.get("id") and Score.get_by_id(g.data["id"])
    except DoesNotExist:
        abort(404)
    if score:
        score.score = g.data["score"]
        score.full_score = g.data.get("full_score", 0)
        score.reason = g.data.get("reason")
    else:
        score = Score.create(
            student=student,
            score=g.data["score"],
            full_score=g.data.get("full_score", 0),
            meeting=meeting,
            reason=g.data.get("reason"),
        )
    res = score.save()
    return jsonify(score.to_dict()), 200 if res == 1 else 500
