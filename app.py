from flask import Flask, request, session, render_template, redirect, jsonify, g, url_for, abort
from flask_session import Session
from flask_mobility import Mobility
from datetime import timedelta
from customjsonencoder import CustomJSONEncoder
from openpyxl import load_workbook
from model import db, Student, Device, Attendance, Score, Meeting
from getmac import get_mac_address
from tempfile import NamedTemporaryFile
from os.path import exists
from os import remove
from datetime import date

import json
import functools

app = Flask(__name__,static_folder=r'templates\assets')
app.json_encoder = CustomJSONEncoder
app.config['DEBUG']= True,
app.config['SESSION_PERMANENT']= True
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_USE_SIGNER'] = False
app.config['TRAP_HTTP_EXCEPTIONS']= True
app.config['PERMANENT_SESSION_LIFETIME']= timedelta(hours=2)
app.config['meeting'] = None
Session(app)
Mobility(app)

config:dict = json.load(open('config.json','r'))

@app.before_first_request
def initialize():
    db.connect()
    db.create_tables([Student,Device,Attendance,Score,Meeting])
    if exists('.meeting'):
        try:
            meet_id = int(open('.meeting').read())
            if (meet:=Meeting.get_or_none(Meeting.id==meet_id)) is not None:  # type: ignore
                if meet.date == date.today():
                    return
        except:
            pass
        remove('.meeting')

@app.before_request
def _before_request():
    if 'db' not in g:
        g.db=db
    
    if not g.db.is_connection_usable():
        g.db.connect()
        
    if exists('.meeting'):
        meet_id = int(open('.meeting').read())
        g.meeting = Meeting.get_by_id(meet_id)
    
    if session.get('mac') is None:
        if request.remote_addr in ('localhost', '127.0.0.1'):
            session['local_user'] = True
            if app.debug:
                mac = 'local'
            else:
                return
        else:
            mac = get_mac_address(ip=request.remote_addr)
        device,created = Device.get_or_create(mac=mac)
        if created:
            device.save()
        session['mac'] = mac
        session['device'] = device

@app.teardown_request
def _db_close(exc):
   if not g.db.is_closed():
      g.db.close()

@app.route('/')
def index():
    return render_template('index.html')

EASTER_EGG = " EASTER EGG: I'm so happy that you are reading this! good luck and hack the planet! BSimjoo ;-)"      # An easter-egg for my students!

@app.route('/api/v1/register')
def register_device():
    device = session['device']
    if (student:=device.student) is None:   #device is not registered
        if (std_num:=request.args.get('std_num')) is not None:
            if (student:=Student.get_or_none(Student.number==std_num)) is not None:
                device.student = student
                device.save()
                session['student'] = student
                return jsonify(student_name=student.name)
            else:   # student not existed
                return jsonify( info='student not existed. check std_num.'+EASTER_EGG), 404
        else:   # std_num didn't send
            return jsonify( info="std_num didn't send."+EASTER_EGG), 400
    else:   # The student has already registered this device
        return jsonify( student_name=student.name, info="device is already register, new registration is forbidden."+EASTER_EGG), 403
    
@app.route('/api/v1/attendance')
def attendance():
    if 'meeting' in g:
        if (device:=session.get('device')) is not None:
            student = device.student
            query = (student.attendances
                     .select()
                     .join(Meeting, on=Attendance.meeting==Meeting.id)      # type: ignore
                     .where(Meeting.id==g.meeting.id)                          # type: ignore
                    )
            code = 200
            res={}
            if query.count()==0:
                Attendance(student = student, device = device, meeting = g.meeting).save()
                code = 203
                res['info']='Your presence is already registered.'+EASTER_EGG
            res={
                'name':student.name,
                'number': student.number,
                'attendances': list(student.attendances.dicts()),
                'scores': list(student.scores.dicts()),
                'meetings': list(Meeting.select().dicts()),
                'devices': list(d.to_dict(recurse=False) for d in student.devices),
                'current_meeting': g.meeting.id,
                'total_score': student.total_score
            }
            return jsonify(res), code
        else:   # user has not registered yet
            return jsonify(info="You must register first."+EASTER_EGG), 403
    else:
        return jsonify( info="session did not started yet."+EASTER_EGG), 404
    
@app.route('/login', methods=['GET', 'POST'])
def login():
    if session.get('admin') and not app.debug:
        return redirect(url_for('admin'))
    if request.method == 'POST':
        if (not session.get('banned')):
            username = request.form.get('username',type=str)
            password = request.form.get('password',type=str)
            if username and password:
                if (config['admin username'],config['admin password']) == (username, password):
                    session['admin'] = True
                    return redirect(url_for('admin'))
            session['failed tries'] = session.get('failed tries',0) + 1
            if session['failed tries'] == 5:
                session['banned'] = True
                return jsonify( banned=True, info="login failed, you got banned."+EASTER_EGG), 401
            return jsonify( banned=False, failed_tries=session['failed tries'], info="login failed."+EASTER_EGG), 401
        else:
            return jsonify( info="you are banned."+EASTER_EGG), 403
    return render_template('login.html')
    
def login_required(func):
    @functools.wraps(func)
    def wrapper(*args, **kw):
        if app.debug or session.get('admin'):
            return func(*args,**kw)
        return redirect(url_for('login'))
    return wrapper
        
@app.route('/admin')
@login_required
def admin():
    return render_template('admin')

@app.route('/api/v1/students',methods = ['POST'])
@login_required
def set_students():
    if (file:=request.files.get('file')):
        if file.filename:
            if file.filename.rsplit('.',1)[1]=='xlsx':
                with NamedTemporaryFile('r+b') as tmp:
                    file.save(tmp)
                    tmp.seek(0)
                    wb = load_workbook(tmp.name)
                    ws = wb.active
                    for row in ws.iter_rows(max_col=2):
                        std = Student(number = row[0].value, name = row[1].value)
                        std.save()
                    return redirect(url_for('admin'))
            else:
                return jsonify( info="bad file format")
    abort(400)              

@app.route('/api/v1/students')
@login_required
def get_students():
    return jsonify([std.to_dict() for std in Student.select()])
    
@app.route('/api/v1/students/<int:number>')
def get_student(number):
    if session.get('admin') or ((std:=session.get('student')) and std.id==number):
        if (student:=Student.get_or_none(Student.id==number)) is not None:   # type: ignore
            return jsonify(student.to_dict())       # type: ignore
        abort(404)
    abort(401)
      
@app.route('/api/v1/attendances')
@login_required
def get_attendances():
    return jsonify([a.to_dict() for a in Attendance.select()])

@app.route('/api/v1/attendances/<int:attendance_id>')
def get_attendance(attendance_id):
    if session.get('admin') or ((std:=session.get('student')) and std.attendances.select(Attendance.id==attendance_id).count() == 1):   #type: ignore
        if (a:=Attendance.get_or_none(Attendance.id==attendance_id)) is not None:   #type: ignore
            return jsonify(a.to_dict())
        abort(404)
    abort(401)
    
@app.route('/api/v1/devices')
@login_required
def get_devices():
    return jsonify([ device.to_dict(backrefs=True)for device in Device.select() ])

@app.route('/api/v1/devices/<int:device_id>')
def get_device(device_id):
    if session.get('admin') or ((std:=session.get('student')) and std.devices.select(Device.id==device_id).count() == 1):               #type: ignore
        if (device:=Device.get_or_none(Device.id==device_id)) is not None:      # type: ignore
            return jsonify(device.to_dict(backrefs=True))
        abort(404)
    abort(401)
    
@app.route('/api/v1/meetings')
@login_required
def set_meetings():
    if 'meeting' not in g:
        g.meeting = Meeting()
        if g.meeting.save() == 1:
            open('.meeting','w').write(str(g.meeting.id))    # type: ignore
            return jsonify(g.meeting.to_dict())
        else:
            return jsonify(done=False,  info="Unknown error while creating database record"), 500
    else:
        return jsonify(done=True,  info="meeting is already created"), 202
        
            
@app.route('/api/v1/meetings/<int:meeting_id>')
@login_required
def get_meetings(meeting_id:int|None=None):
    if meeting_id is None:
        return jsonify(list(Meeting.select().dicts()))
    if (meet:=Meeting.get_or_none(Meeting.id==meeting_id)) is not None: #type: ignore
        return jsonify(meet.to_dict(backrefs=True))
    abort(404)
    
app.route('api/v1/meetings/<int:meeting_id>',methods=['DEL'])
@login_required
def del_meetings(meeting_id:int):
    if (meet:=Meeting.get_or_none(Meeting.id==meeting_id)) is not None: #type: ignore
        if (rows:=meet.delete_instance(True)) >0:
            return jsonify(rows=rows)
        return jsonify(info="didn't deleted any row")
    abort(404)