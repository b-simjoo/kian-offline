var meetingInProgress = false;
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
            request('current_meeting',undefined,undefined,res=>{
                let startBtn = document.getElementById('start-meeting-btn');
                startBtn.innerHTML = '<i class="fa-solid fa-stop"></i> End meeting';
                startBtn.classList.add('stop');
                startBtn.onclick=endMeeting;
                meetingInProgress = true;
            },
            {
                404:()=>{}
            });
            renderTable();
        } else if (req.status === 401) {
            show_msg('error', 'Access denied, ' + req.response.tries_left + ' try left.');
        } else if (req.status === 403) {
            show_msg('error', 'You are banned, You can not login anymore');
        }
    }
    req.send(formData);
}

var Meetings, Students;
function renderTable() {
    request('meetings', undefined, undefined, (meetings) => {
        Meetings = meetings;
        request('students', undefined, undefined, (students) => {
            if (students.length > 0) {
                Students = students;
                const studentsTable = createTable(meetings, students);
                document.getElementById('students-table').replaceChildren(div({id:"table-container", cls: ['block', 'center']},studentsTable));
            } else {
                document.getElementById('students-table').replaceChildren(div({ cls: ['middle', 'center', 'block'] },
                    p(undefined,'Your class is empty!'),
                    small(undefined, 'to add students shutdown server, go to app root and<br>run <code>python worksheetUtil.py load &lt;yourfile&gt;</code> and<br>then restart the server, <a href="https://github.com/bsimjoo-official/kian">more info</a>')      // TODO: add document for this
                ));
            }
        })
    })
}

function createTable(meetings, students) {
    let rowCounter=1;
    return table({id:'students-table',cls:'students-table'},
        thead(undefined,
            tr(undefined,
                td(undefined, 'No.'),
                td(undefined, 'Students'),
                meetings.length > 0 ?
                    meetings.map(meeting => {
                        let meetingTime;
                        if (!meeting.in_progress) {
                            let start_at = meeting.start_at.split(':').slice(0, 2).join(':');
                            let end_at = meeting.end_at!==null? meeting.end_at.split(':').slice(0, 2).join(':'):'N/A';
                            meetingTime = small({ cls: 'meeting-time' }, start_at, '-', end_at);
                        } else
                            meetingTime = small({ cls: 'in-process' }, 'in-process');
                        let meetingTd = td({ id: 'meet-' + meeting.id, cls: 'meeting' }, meeting.date, '<br>', meetingTime);
                        meetingTd.setAttribute('colspan', 2);
                        attachTooltip(meetingTd, () => [
                            p(undefined, span({ cls: 'secondary-text' }, 'Date: '), meeting.date),
                            p(undefined, span({ cls: 'secondary-text' }, 'Count of attendance: '), meeting.count_of_attendances),
                            p(undefined, span({ cls: 'secondary-text' }, 'Participation percentage: '), textNode(meeting.count_of_attendances / students.length * 100 + '%')),
                            p(undefined, span({ cls: 'secondary-text' }, 'Started at: '), meeting.start_at),
                            (meeting.in_process ?
                                p(undefined, span({ cls: 'in-process' }, 'Meeting is in-process')) :
                                p(undefined, span({ cls: 'secondary-text' }, 'Ended at: '), meeting.end_at)
                            )
                        ]);
                        return meetingTd;
                    }) :
                    td(undefined, 'No meeting, start a meeting to add here')
                ,
                td(undefined, 'Total scores')
            )
        ),
        tbody(undefined,
            students.map(student => {
                let student_td = td({ id: 'stdname-' + student.id, cls: 'student-name' }, student.name);
                attachTooltip(student_td, () => request('students/' + student.id, res => res).then(student => [
                    p(undefined, span({ cls: 'secondary-text' }, 'Name: '), student.name),
                    p(undefined, span({ cls: 'secondary-text' }, 'Number: '), student.number),
                    p(undefined, span({ cls: 'secondary-text' }, 'Score: '), student.total_score.toString() + ' / ' + student.total_full_score.toString()),
                    p(undefined, span({ cls: 'secondary-text' }, 'Participation percentage: '), textNode(student.attendances.length / meetings.length * 100 + '%')),
                    p(undefined, span({ cls: 'secondary-text' }, 'Number of absences: '), textNode(meetings.length - student.attendances.length)),
                    p(undefined, span({ cls: 'secondary-text' }, 'Count of devices: '), textNode(student.devices.length))
                ]))
                return tr({ id: 'std-' + student.id, cls: 'student' },
                    td(undefined,(rowCounter++).toString()),
                    student_td,
                    ...(meetings.length > 0 ? meetings.map(meeting => {
                        let attendance = student.attendances.find(a => a.meeting === meeting.id);
                        let score = student.scores.find(s => s.meeting === meeting.id);
                        let score_td = td({ cls: ['score', 'empty'] }, '-');
                        let attendance_td = td({ cls: 'attendance' }, '<i class="absent fa-solid fa-circle-xmark"></i>');
                        if (typeof (attendance) !== 'undefined') {
                            attendance_td = td({ id: 'att-' + attendance.id, cls: 'attendance' }, '<i class="present fa-solid fa-circle-check"></i>');
                            attachTooltip(attendance_td, () => {
                                return request('attendances/' + attendance.id, undefined, undefined, (res) => res).then(res => [
                                    p(undefined, span({ cls: 'secondary-text' }, 'Name: '), res.student.name),
                                    p(undefined, span({ cls: 'secondary-text' }, 'Device: '), res.device.mac),
                                    p(undefined, span({ cls: 'secondary-text' }, 'Time: '), res.time)
                                ]
                                )
                            })
                            if (typeof (score) !== 'undefined') {
                                score_td = td({ id: 'scr-' + score.id, cls: 'score' }, score.score.toString(), ' / ', score.full_score.toString());
                                attachTooltip(score_td, () => [
                                    p(undefined, span({ cls: 'secondary-text' }, 'Name: '), student.name),
                                    p(undefined, span({ cls: 'secondary-text' }, 'Number: '), student.number),
                                    p(undefined, span({ cls: 'secondary-text' }, 'Score: '), score.score),
                                    p(undefined, span({ cls: 'secondary-text' }, 'Full-score: '), score.full_score),
                                    p(undefined, span({ cls: 'secondary-text' }, 'Reason: '), score.reason)
                                ]);
                            }
                        }
                        return [attendance_td, score_td];
                    }) : [td(undefined, '')]),
                    td({ id: 'ttlscr-' + student.id, cls: 'student-score' }, student.total_score.toString() + ' / ' + student.total_full_score.toString())
                )
            }
            )
        )
    )
}

function endMeeting(){
    request('current_meeting',undefined,'DEL',()=>{
        show_msg('success','Meeting ended');
        let startBtn = document.getElementById('start-meeting-btn');
        startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start meeting';
        startBtn.classList.remove('stop')
        startBtn.onclick=startMeeting;
        renderTable();
        meetingInProgress = false;
    },
    {
        404:()=>{
            show_msg('warning','There is no meeting in progress')
            let startBtn = document.getElementById('start-meeting-btn');
            startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start meeting';
            startBtn.classList.remove('stop')
            startBtn.onclick=startMeeting;
            renderTable();
            meetingInProgress = false;
        }
    })
}

function startMeeting(){
    request('current_meeting',undefined,'POST',()=>{
        show_msg('success','Meeting started')
        let startBtn = document.getElementById('start-meeting-btn');
        startBtn.innerHTML = '<i class="fa-solid fa-stop"></i> End meeting';
        startBtn.classList.add('stop');
        startBtn.onclick=endMeeting;
        renderTable();
        meetingInProgress = true;
    },
    {
        202:()=>{show_msg('error','A meeting is already on going.')},
        500:()=>{show_msg('error','Unknown server error')}
    })
}

function chooseRandom(){
    if (document.getElementsByClassName('randomly-chosen').length==1)
        document.getElementsByClassName('randomly-chosen')[0].classList.remove('randomly-chosen');
    let rndBtn = document.getElementById('choose-random-btn');
    let students = document.getElementById('students-table').getElementsByTagName('tbody')[0].children;
    let rnd = getRndInteger(0,students.length-1);
    students[rnd].classList.add('randomly-chosen');
    students[rnd].scrollIntoView();
    show_msg('info',`chosen student number ${rnd+1} -> ${Students[rnd].name}`)
}

window.onbeforeunload = function (e) {
    if (!meetingInProgress) return;
    e.preventDefault();
    return e.returnValue = "Are you sure you want to exit without ending the meeting?";
}

window.onload = (e) => {
    if (typeof (admin) !== 'undefined' && admin) {
        loadView('admin-panel');
        request('current_meeting',undefined,undefined,res=>{
            let startBtn = document.getElementById('start-meeting-btn');
            startBtn.innerHTML = '<i class="fa-solid fa-stop"></i> End meeting';
            startBtn.classList.add('stop');
            startBtn.onclick=endMeeting;
            meetingInProgress = true;
        },
        {
            404:()=>{}
        });
        renderTable();
    } else {
        loadView('login');
    }
}