function register (){
    let stdNum = document.getElementById('student-code').value
    request('register',{'std_num':std_num},undefined,(res)=>{
        show_msg('success', 'Your device registered.')
        document.getElementById('student-code').classList.remove('error');
        console.log(res);
        slide(1)
        .then(()=>type_text(pre('function','print')+'('+pre('string','"Hello, '+res.name+'"')+')'))
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
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let thead_tr = document.createElement('tr');
    thead.append(thead_tr);
    table.append(thead);
    let tbody = document.createElement('tbody');
    let tbody_tr = document.createElement('tr');
    tbody.append(tbody_tr);
    table.append(tbody);
    info.meetings.forEach(meeting => {
        let thead_td = document.createElement('td');
        thead_td.innerText=meeting.date;
        if (info.current_meeting==meeting.id)
            thead_td.innerText+='\n(today)'
        thead_td.setAttribute('colspan',2);
        thead_tr.prepend(thead_td);
        let tbody_td = document.createElement('td');
        tbody_td.id = 'meeting-'+meeting.id.toString();
        tbody_td.innerHTML='<i class="absent fa-solid fa-circle-xmark"></i>';
        tbody_tr.prepend(tbody_td);
        tbody_td = document.createElement('td');
        tbody_td.id = 'score-'+meeting.id.toString();
        tbody_td.innerText='-';
        tbody_tr.prepend(tbody_td);
    });
    document.getElementById("student-attendance").append(table);
    info.attendances.forEach(attendance => {
        let td = document.getElementById("meeting-"+attendance.meeting.toString());
        td.innerHTML = '<i class="present fa-solid fa-circle-check"></i>';
    });
    info.scores.forEach(score => {
        let td = document.getElementById("score-"+score.meeting.toString());
        td.innerText = score.score;
    });
}

window.onload = ()=>{
    if (typeof(registered)!=='undefined' && registered){
        request('whoami',undefined,undefined,
        (res)=>{
            let stdNum = res.number;
            type_text(pre('function','print')+'('+pre('string','"Hello, '+res.name+'"')+')')
            .then(()=>sleep(2000))
            .then(()=>attendance(stdNum));
        },
        {400:()=>{}})
    }
}