function login(e){
    e.preventDefault();
    const formData = new FormData(e.target);
    const req = new XMLHttpRequest();
    req.open("POST", "login", true);
    req.responseType = 'json';
    req.onload = (p) => {
        if (req.status === 200){
            show_msg('success','Welcome to admin panel')
            loadView('admin-panel');
            getTable();
        }else if (req.status === 401){
            show_msg('error', 'Access denied, '+req.response.tries_left+' try left.');
        }else if (req.status === 403){
            show_msg('error', 'You are banned, You can not login anymore');
        }
    }
    req.send(formData);
}

function getTable(){
    request('meetings',undefined,undefined,(meetings)=>{
        request('students',undefined,undefined,(students)=>{
            const studentsTable = createTable(meetings, students);
            document.getElementById('students-table').replaceChildren(studentsTable);
        })
    })
}

function createTable(meetings,students){
    return table(undefined,
        thead(undefined,
            tr(undefined,
                td(undefined,'students'),
                meetings.map(meeting=>td({id: 'meet-'+meeting.id,cls:'meeting'},meeting.date))
            )
        ),
        tbody(undefined,
            students.map(student=>
                tr({id: 'std-'+student.id, cls:'student'},
                    td({cls:'student-name'},student.name),
                    meetings.map(meeting=>{
                        let attendance = student.attendances.find(a=>a.meeting.id === meeting.id);
                        let score = student.scores.find(s=>s.meeting.id === meet.id);
                        if (typeof(attendance)!=='undefined'){
                            let elem = td({id:'att-'+attendance.id},
                                '<i class="present fa-solid fa-circle-check"></i>',
                                typeof(score) !== 'undefined' ? span({id: 'scr-'+score.id, cls: ['score']},score.score.toString()) : ''
                            );
                            // TODO: add onhover and onclick actions to elem
                            return elem;
                        } else
                            return td(undefined,'<i class="absent fa-solid fa-circle-xmark"></i>');
                    })
                )
            )
        )
    )
}

window.onload = (e)=>{
    if (typeof(admin)!=='undefined' && admin){
        loadView('admin-panel');
        getTable();
    }else{
        loadView('login');
    }
}