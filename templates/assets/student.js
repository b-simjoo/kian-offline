function register (){
    let stdNum = document.getElementById('student-code').value
    request('register',{'std_num':stdNum},undefined,(res)=>{
        show_msg('success', 'Your device registered.')
        document.getElementById('student-code').classList.remove('error');
        console.log(res);
        slide(1)
        .then(()=>type_text(pre('function','print')+'('+pre('string',`"Hello, ${res.name}"`)+')'))
        .then(()=>sleep(2000))
        .then(()=>attendance(stdNum));
    },
    {
        400:(res)=>{
            shake('student-code-group');
            document.getElementById('student-code').classList.add('error');
            show_msg('error','Error: Please enter your number');
        },
        404:(res)=>{
            shake('student-code-group');
            document.getElementById('student-code').classList.add('error');
            show_msg('error','Error: Student does not exist, check the student number');
        },
        403:(res)=>{
            show_msg('warning', 'Your device is already registered');
            console.log(res);
            slide(1)
            .then(()=>type_text(pre('function','print')+'('+pre('string',`"Hello, ${res.name}"`)+')'))
            .then(()=>sleep(3000))
            .then(()=>attendance(stdNum));
        }
    }
    )
}

function attendance(stdNum, retry=false){
    if (retry)
        animate('retry', 'fade', 'out');
    type_text(pre('function','attendance')+'('+pre('string','"'+stdNum+'"')+')')
    .then(()=>sleep(2000))
    .then(()=>{
        request('attendance',undefined,undefined,
        (res)=>{
            type_text(pre('function','print')+'('+pre('string','"done"')+')')
            .then(()=>{
                show_msg('success','Done')
                render_student_info(res);
            })
            .then(()=>type_text(pre('function','next')+'()'))
            .then(()=>sleep(1000))
            .then(()=>slide(2));
        },{
            403:(res)=>{
                show_msg('error','Your device is not registered. enter your student number to continue');
                type_text(pre('keyword','raise ')+pre('class','AssertionError')+'('+pre('string','"403 ERROR"')+')')
                .then(()=>sleep(1000))
                .then(slide(0));
            },
            404:(res)=>{
                show_msg('error','session did not start, try again after teacher start new session',20000);
                type_text(pre('keyword','raise ')+pre('class','AssertionError')+'('+pre('string','"404 ERROR"')+')')
                .then(()=>animate('retry','fade', 'in'))
                .then(()=>{show_msg('info','click on <i class="fa-solid fa-rotate-right"></i> after session started',30000)})
            },
            203:(res)=>{
                type_text(pre('function','print')+'('+pre('string','"done"')+')')
                .then(()=>{
                    show_msg('success','Done')
                    render_student_info(res);
                })
                .then(()=>type_text(pre('function','next')+'()'))
                .then(()=>sleep(1000))
                .then(()=>slide(2));
            }
        })
    })
}

function check_login(e){
    e.preventDefault()
    request('can_login',undefined,undefined,
    (res)=>{
        window.location.href=e.target.href;
    },
    {
        403:()=>{show_msg('error','You can not login as teacher')}
    })
}

function render_student_info(info){
    document.getElementById('student-name').innerText = info.name;
    document.getElementById('student-number').innerText = info.number;
    document.getElementById('total-score').innerText = info.total_score;
    document.getElementById("table-container").replaceChildren(createTable(info))
}

function createTable(info){
    return table(undefined,
        thead(undefined,
            tr(undefined,
                info.meetings.map(meeting=>{
                    let meetingTime;
                    if (!meeting.in_progress) {
                        let start_at = meeting.start_at.split(':').slice(0, 2).join(':');
                        let end_at = meeting.end_at!==null? meeting.end_at.split(':').slice(0, 2).join(':'):'N/A';
                        meetingTime = small({ cls: 'meeting-time' }, start_at, '-', end_at);
                    } else
                        meetingTime = small({ cls: 'in-process' }, 'in-process');
                    let meetingTd = td({ id: 'meet-' + meeting.id, cls: 'meeting' }, meeting.date, '<br>', meetingTime);
                    meetingTd.setAttribute('colspan', 2);
                    return meetingTd;
                })
            )
        ),
        tbody(undefined,
            tr(undefined,
                ...info.meetings.map(meeting=>{
                    let attendance = info.attendances.find(a=>a.meeting === meeting.id);
                    let score = info.scores.find(s=>s.meeting === meeting.id);
                    let score_td = td({ cls: ['score', 'empty'] }, '-');
                    let attendance_td = td({ cls: 'attendance' }, '<i class="absent fa-solid fa-circle-xmark"></i>');
                    if (typeof (attendance) !== 'undefined') {
                        attendance_td = td({ id: 'att-' + attendance.id, cls: 'attendance' }, '<i class="present fa-solid fa-circle-check"></i>');
                        if (typeof (score) !== 'undefined')
                            score_td = td({ id: 'scr-' + score.id, cls: 'score' }, score.score.toString(), ' / ', score.full_score.toString());
                    }
                    return [attendance_td, score_td];
                })
            )    
        )
    )
}

window.onload = ()=>{
    if (typeof(registered)!=='undefined' && registered){
        request('whoami',undefined,undefined,
        (res)=>{
            let stdNum = res.number;
            curtain_slide = 1;
            type_text(pre('function','print')+'('+pre('string',`"Hello, ${res.name}"`)+')')
            .then(()=>sleep(2000))
            .then(()=>attendance(stdNum));
        },
        {400:()=>{}})
    }
}