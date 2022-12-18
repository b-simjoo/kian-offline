function login(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const req = new XMLHttpRequest();
  req.open("POST", "login", true);
  req.responseType = 'json';
  req.onload = (p) => {
    if (req.status === 200) {
      show_msg('success', 'Welcome to admin panel')
      loadView('admin-panel');
      getTable();
    } else if (req.status === 401) {
      show_msg('error', 'Access denied, ' + req.response.tries_left + ' try left.');
    } else if (req.status === 403) {
      show_msg('error', 'You are banned, You can not login anymore');
    }
  }
  req.send(formData);
}

function getTable() {
  request('meetings', undefined, undefined, (meetings) => {
    request('students', undefined, undefined, (students) => {
      const studentsTable = createTable(meetings, students);
      document.getElementById('students-table').replaceChildren(studentsTable);
    })
  })
}

function createTable(meetings, students) {
  return table(undefined,
    thead(undefined,
      tr(undefined,
        td(undefined, 'Students'),
        meetings.map(meeting => {
          let meetingTime;
          if (!meeting.in_process) {
            let start_at = meeting.start_at.split(':').slice(0, 2).join(':');
            let end_at = meeting.end_at.split(':').slice(0, 2).join(':');
            meetingTime = small({ cls: 'meeting-time' }, start_at, '-', end_at);
          } else
            meetingTime = small({cls:'in-process'},'in-process');
          let meetingTd = td({ id: 'meet-' + meeting.id, cls: 'meeting' }, meeting.date, '<br>', meetingTime);
          meetingTd.setAttribute('colspan', 2);
          attachTooltip(meetingTd,()=>[
            p(undefined, span({ cls: 'secondary-text' }, 'Date: '), meeting.date),
            p(undefined, span({ cls: 'secondary-text' }, 'Count of attendance: '), meeting.count_of_attendances),
            p(undefined, span({ cls: 'secondary-text' }, 'Participation percentage: '), textNode(meeting.count_of_attendances/students.length*100+'%')),
            p(undefined, span({ cls: 'secondary-text' }, 'Started at: '), meeting.start_at),
            (meeting.in_process?
              p(undefined, span({ cls: 'in-process' }, 'Meeting is in-process')):
              p(undefined, span({ cls: 'secondary-text' }, 'Ended at: '), meeting.end_at)
            )
          ]);
          return meetingTd;
        }),
        td(undefined, 'Total scores')
      )
    ),
    tbody(undefined,
      students.map(student =>
        {
          let student_td = td({ id: 'stdname-' + student.id, cls: 'student-name' }, student.name);
          attachTooltip(student_td,()=>request('students/'+student.id,res=>res).then(student=>[
            p(undefined, span({ cls: 'secondary-text' }, 'Name: '), student.name),
            p(undefined, span({ cls: 'secondary-text' }, 'Number: '), student.number),
            p(undefined, span({ cls: 'secondary-text' }, 'Score: '), student.total_score.toString() + ' / ' + student.total_full_score.toString()),
            p(undefined, span({ cls: 'secondary-text' }, 'Participation percentage: '), textNode(student.attendances.length/meetings.length*100+'%')),
            p(undefined, span({ cls: 'secondary-text' }, 'Number of absences: '), textNode(meetings.length - student.attendances.length)),
            p(undefined, span({ cls: 'secondary-text' }, 'Count of devices: '), textNode(student.devices.length))
          ]))
          return tr({ id: 'std-' + student.id, cls: 'student' },
            student_td,
            ...meetings.map(meeting => {
              let attendance = student.attendances.find(a => a.meeting.id === meeting.id);
              let score = student.scores.find(s => s.meeting.id === meeting.id);
              let score_td = td({ cls: ['score', 'empty'] }, '-');
              let attendance_td = td({ cls: 'attendance' }, '<i class="absent fa-solid fa-circle-xmark"></i>');
              if (typeof (score) !== 'undefined') {
                score_td = td({ id: 'scr-' + score.id, cls: 'score' }, score.score.toString(), ' / ', score.full_score.toString());
                attachTooltip(score_td,()=>[
                  p(undefined, span({ cls: 'secondary-text' }, 'Name: '), student.name),
                  p(undefined, span({ cls: 'secondary-text' }, 'Number: '), student.number),
                  p(undefined, span({ cls: 'secondary-text' }, 'Score: '), score.score),
                  p(undefined, span({ cls: 'secondary-text' }, 'Full-score: '), score.full_score),
                  p(undefined, span({ cls: 'secondary-text' }, 'Reason: '), score.reason)
                ]);
              }
              if (typeof (attendance) !== 'undefined') {
                attendance_td = td({ id: 'att-' + attendance.id, cls: 'attendance' }, '<i class="present fa-solid fa-circle-check"></i>');
                attachTooltip(attendance_td,()=>{
                  return request('attendances/'+attendance.id,undefined,undefined,(res)=>res).then(res=>[
                      p(undefined, span({ cls: 'secondary-text' }, 'Name: '), res.student.name),
                      p(undefined, span({ cls: 'secondary-text' }, 'Device: '), res.device.mac),
                      p(undefined, span({ cls: 'secondary-text' }, 'Time: '), res.time)
                    ]
                  )
                })
              }
              return [attendance_td, score_td];
            }),
            td({ id: 'ttlscr-' + student.id, cls: 'student-score' }, student.total_score.toString() + ' / ' + student.total_full_score.toString())
          )
        }
      )
    )
  )
}

window.onload = (e) => {
  if (typeof (admin) !== 'undefined' && admin) {
    loadView('admin-panel');
    getTable();
  } else {
    loadView('login');
  }
}