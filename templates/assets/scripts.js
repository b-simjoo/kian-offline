let emessages = [
    'ثبت ناموفق',
    'شماره دانشجویی شما یافت نشد'
];

function request(action, params={}, callback, failed){
    url = '/api/v1/'+action+'?'+(new URLSearchParams(params)).toString();
    fetch(url,{method:'GET', redirect: 'follow',})
    .then((res) => {
        if (res.ok)
            return res.json();
        throw new Error('مشکلی پیش آمد، لطفا دوباره تلاش کنید.');
    }).then((res) => {
        if (!res.done){
            if (res.redirect)
                setTimeout(function () {window.location = res.redirect;},10000);
            throw new Error(emessages[res.error]);
        }
        return res
    }).then((res) => {
        if (callback) 
            callback(res);
    }).catch((error)=>{
        if (failed)
            failed(error);
    })
}

function show_msg(message,dlg_type){
    var msg_elem = document.createElement("div");
    msg_elem.appendChild(document.createTextNode(message));
    msg_elem.classList.add('msg', dlg_type);
    msg_elem.setAttribute('animation','fade in');
    hide(msg_elem);
    container = document.getElementById('msg-container');
    container.insertBefore(msg_elem,container.firstChild);
    animate(msg_elem,false);
    setTimeout(()=>{animate(msg_elem,false)},10000);
}

function attendence(){
    request('attendence',{},(res)=>{
        document.getElementById('loading').classList.replace('loading','done');
        setTimeout(() => {
            document.getElementById('hello-user').innerText = `${res.name} عزیز، حاضری شما با موفقیت ثبت شد.`;
            animate('hello-user');
            document.getElementById('table').innerHTML = res.content;
            animate('table');
        },2000);
    },(error)=>{
        document.getElementById('loading').classList.replace('loading','failed');
        show_msg(error.message,'error');
    });
}

function register(e) {
    if (e.preventDefault) e.preventDefault();
    form = document.getElementsByName('reg_form')[0];
    var std_num = form.std_num.value;
    request('register',{std_num:std_num},(res)=>{
        show_msg('شماره دانشجویی شما ثبت شد','success');
        animate('content-1');
        animate('content-2');
        attendence();
    },(error)=>{
        show_msg(error.message,'error');
    });
    return false;
}

function hide(element){
    if (typeof(element) === 'string')
    return hide(document.getElementById(element));
    element.style.display='None';
}

function show(element){
    if (typeof(element) === 'string')
        return show(document.getElementById(element));
    element.style.display='Block';
}

function animate(element,resize=true){
    if (typeof(element) === 'string')
        return animate(document.getElementById(element));
    
    [animation,direction] = element.getAttribute("animation").split(' ');
    if (animation){
        element.classList.add(animation+'-'+direction);
        duration = getComputedStyle(element).animationDuration;
        duration = parseFloat(duration.replace('s',''))*1000;
        if(direction === 'in'){
            show(element);
            element.setAttribute("animation",animation+' out');
            setTimeout(() => {
                element.classList.remove(animation+'-in');
            }, duration);
        } else {
            element.setAttribute("animation",animation+' in');
            setTimeout(() => {
                element.classList.remove(animation+'-out');
                hide(element);
            }, duration);
        }
        if(resize){
            container = document.getElementById('container');
            if (!element.classList.contains('content'))
                element = element.parentElement;
            container.style.height = (element.offsetHeight+10).toString()+'px';
        }
    }else{
        console.error('animation is not set for',element);
    }
}

window.onload = (e)=>{
    var all = document.getElementsByTagName("*");

    for (let e of all) {
        if (e.getAttribute("animation") && e.getAttribute("animation").split(' ')[1]==='in')
            hide(e);
    }

    content = document.getElementsByClassName('active')[0];
    content.parentElement.style.height = (content.offsetHeight+10).toString()+'px';
};