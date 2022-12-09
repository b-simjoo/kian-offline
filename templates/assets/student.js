let std_num;
function register (){
    std_num = document.getElementById('student-code').value
    request('register',{'std_num':std_num},undefined,(res)=>{
        show_msg('success', 'Your device registered.')
        console.log(res);
        slide(1)
        .then(()=>kbd_type('loading-text','<span class="pre-function">print</span>(<span class="pre-string">"Hello, '+res.student_name+'"</span>)'))
        .then(()=>sleep(3000))
        .then(()=>kbd_type('loading-text','<span class="pre-function">attendance</span>(<span class="pre-string">"'+std_num.toString()+'"</span>)'))
        .then(()=>sleep(3000))
        .then(()=>attendance());
    },
    {
        404:(res)=>{
            shake('student-code-group');
            show_msg('error','Error: Student does not exist, check the student number');
        },
        403:(res)=>{
            show_msg('warning', 'Your device is already registered');
            console.log(res);
            slide(1)
            .then(()=>kbd_type('loading-text','<span class="pre-function">print</span>(<span class="pre-string">"Hello, '+res.student_name+'"</span>)'))
            .then(()=>sleep(3000))
            .then(()=>attendance());
        }
    }
    )
}

function attendance(){
    kbd_type('loading-text','<span class="pre-function">attendance</span>(<span class="pre-string">"'+std_num.toString()+'"</span>)')
    .then(()=>sleep(3000))
    .then(()=>{
        request('attendance',undefined,undefined,
        (res)=>{
            kbd_type('loading-text', '<span class="pre-function">print</span>(<span class="pre-string">"Done"</span>)')
            .then(()=>{
                show_msg('success','Done')
                render_student_info(res);
            })
            .then(()=>kbd_type('loading-text','<span class="pre-function">next</span>()'))
            .then(()=>sleep(1000))
            .then(()=>slide(2));
        },{
            403:(res)=>{
                show_msg('error','Your device is not registered. enter your student number to continue');
                slide(0);
            },
            404:(res)=>{
                show_msg('error','session did not start, try again after teacher start new session');
                kbd_type('loading-text','<span class="pre-function">show_btn</span>(<span class="pre-string">"try agian"</span>)')
                .then(()=>animate('retry','fade', 'in'))
                .then(()=>{show_msg('info','click on <i class="fa-solid fa-rotate-right"></i> after session started')})
            },
            203:(res)=>{
                kbd_type('loading-text', '<span class="pre-function">print</span>(<span class="pre-string">"Done"</span>)')
                .then(()=>{
                    show_msg('success','Done')
                    render_student_info(res);
                })
                .then(()=>kbd_type('loading-text','<span class="pre-function">next</span>()'))
                .then(()=>sleep(1000))
                .then(()=>slide(2));
            }
        })
    })
}

function render_student_info(info){
    document.getElementById('student-name').innerText = info.name;
    document.getElementById('student-number').innerText = info.number;
    document.getElementById('total-score').innerText = info.total_score;
    table = document.createElement('table');
    thead = document.createElement('thead');
    thead_tr = document.createElement('tr');
    thead.append(thead_tr);
    table.append(thead);
    tbody = document.createElement('tbody');
    tbody_tr = document.createElement('tr');
    tbody.append(tbody_tr);
    table.append(tbody);
    info.meetings.forEach(meeting => {
        thead_td = document.createElement('td');
        thead_td.innerText=meeting.date;
        if (info.current_meeting==meeting.id)
            thead_td.innerText+='\n(today)'
        thead_td.setAttribute('colspan',2);
        thead_tr.prepend(thead_td);
        tbody_td = document.createElement('td');
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
        td = document.getElementById("meeting-"+attendance.meeting.toString());
        td.innerHTML = '<i class="present fa-solid fa-circle-check"></i>';
    });
    info.scores.forEach(score => {
        td = document.getElementById("score-"+score.meeting.toString());
        td.innerText = score.score;
    });
}