from json import load
from peewee import SqliteDatabase, Model, TextField, FixedCharField, BooleanField, ForeignKeyField, DateTimeField, IntegerField, DateField, TimeField
from datetime import datetime
from playhouse.shortcuts import model_to_dict

config:dict = load(open('config.json','r'))

db = SqliteDatabase(config['database'],pragmas={'foreign_keys': 1})

class BaseModel(Model):
    class Meta:
        database = db
        
    def to_dict(self,**kwargs)->dict:
        res = model_to_dict(self)
        res.update(**kwargs)
        return res
        
class Meeting(BaseModel):   # Chosen meeting name because to prevent collide with flask session
    date = DateField(default = lambda:datetime.now().date())
    # attendances
    # scores
    

class Student(BaseModel):
    name = TextField(unique=True)
    number = FixedCharField(max_length=11,unique=True)
    # scores
    # attendances
    # devices
    
    @property
    def total_score(self):
        return sum(map(lambda x:x.score,self.scores))           # type: ignore
    
    def to_dict(self, **kwargs) -> dict:
        return super().to_dict(total_score = self.total_score, **kwargs)
    

class Device(BaseModel):  # type: ignore
    mac = TextField(index=True,unique=True)
    blocked = BooleanField(default=False)
    student = ForeignKeyField(Student,null=True,backref='devices')
    # login_history
    
class Attendance(BaseModel):  # type: ignore
    student = ForeignKeyField(Student,backref = 'attendances')
    device = ForeignKeyField(Device,backref = 'login_history')
    meeting = ForeignKeyField(Meeting, backref= 'attendances')
    time = TimeField(default = lambda: datetime.now().time())
    
class Score(BaseModel):
    student = ForeignKeyField(Student,backref="scores")
    score = IntegerField()
    meeting = ForeignKeyField(Meeting, null=True, backref='scores')
    reason = TextField(null=True)
