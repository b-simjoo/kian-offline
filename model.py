from json import load
from peewee import SqliteDatabase, Model, TextField, CharField, BooleanField, ForeignKeyField, DateTimeField, IntegerField, DateField
from datetime import datetime

config:dict = load(open('config.json','r'))

db = SqliteDatabase(config['database'],pragmas={'foreign_keys': 1})

class BaseModel(Model):
    class Meta:
        database = db
        
class Meeting(BaseModel):   # Chosen meeting because to prevent collide with flask session
    date = DateField(default = datetime.now)
    # attendances
    

class Student(BaseModel):
    name = TextField(unique=True)
    number = CharField(max_length=11,unique=True)
    # scores
    # attendances
    # devices
    
    @property
    def total_score(self):
        return sum(map(lambda x:x.score,self.scores))  # type: ignore
            

class Device(BaseModel):  # type: ignore
    mac = TextField(index=True,unique=True)
    blocked = BooleanField(default=False)
    student = ForeignKeyField(Student,null=True,backref='devices')
    # login_history
    
class Attendance(BaseModel):  # type: ignore
    student = ForeignKeyField(Student,backref = 'attendances')
    device = ForeignKeyField(Device,backref = 'login_history')
    meeting = ForeignKeyField(Meeting, backref= 'attendances')
    
class Score(BaseModel):
    student = ForeignKeyField(Student,backref="scores")
    score = IntegerField()
    date_time = DateTimeField(default = datetime.now)
    reason = TextField(null=True)
