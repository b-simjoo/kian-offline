let curtain_slide = 0;
function slide(slide) {
  let container = document.getElementById('container');
  let slides = container.children;
  if (curtain_slide<slide){
    return animate(slides[curtain_slide], 'fade-left', 'out')
    .then(()=>animate(slides[slide], 'fade', 'in'))
    .then(()=>{curtain_slide = slide});
  }else{
    return animate(slides[curtain_slide], 'fade', 'out')
    .then(()=>animate(slides[slide], 'fade-left', 'in'))
    .then(()=>{curtain_slide = slide});
  }
}

let curtain_view = null;
function loadView(viewId){
  let view = document.getElementById(viewId);
  if (curtain_view){
    return animate(curtain_view,'fade','out')
    .then(()=>animate(view,'fade','in'))
    .then(()=>{curtain_view = view});
  }
  return animate(view,'fade','in')
  .then(()=>{curtain_view = view});
}

function request(action, params = {}, method = 'GET', callback = null, error_handlers = {}) {
  let url = '/api/v1/' + action + '?' + (new URLSearchParams(params)).toString();
  fetch(url, { method: method, redirect: 'follow', })
    .then((res)=>{
      if (res.status===200)
        return res.json().then(callback);
      return res.json().then(error_handlers[res.status]);})
}

function show_msg(message_type, text, duration=10000){
  let msg_elem = document.createElement("div");
  msg_elem.innerHTML=text;
  msg_elem.classList.add('msg', message_type);
  msg_elem.onclick = (e) => {animate(msg_elem,'fade-left','out').then(()=>msg_elem.remove());}
  hide(msg_elem);
  let container = document.getElementById('msg-container');
  container.insertBefore(msg_elem,container.firstChild);
  animate(msg_elem,'fade-down','in')
  .then(()=>sleep(duration))
  .then(()=>{
    if (container.contains(msg_elem)) {
      animate(msg_elem,'fade-left','out')
      .then(()=>msg_elem.remove())
    }
  });
}

function validate(event) {
  if ((event.key.length === 1 && /\D/.test(event.key)) || event.currentTarget.textLength>10) {
    event.preventDefault();
  }
}

function type_text(html){ return kbd_type('loading-text', html) }

function pre(style,content){return `<span class="pre-${style}">${content}</span>`}

function createElement(tag, id=null, cls=null, ...contents){
  let elem = document.createElement(tag);
  if (id)
    elem.id=id;
  if (cls)
    if (typeof(cls)==='string')
      elem.classList.add(cls);
    else
      elem.classList.add(...cls);

  contents.forEach((content)=>{
    if (typeof(content) === 'string')
      elem.innerHTML += content;
    else if (typeof content[Symbol.iterator] === 'function')
      elem.append(...content);
    else if (content!==null)
      elem.append(content);
  })
  return elem
}

function table({id=null,cls=null}={},...content){
  return createElement('table',id,cls,...content)
}

function thead({id=null,cls=null}={},...content){
  return createElement('thead',id,cls,...content)
}

function tbody({id=null,cls=null}={},...content){
  return createElement('tbody',id,cls,...content)
}

function tr({id=null,cls=null}={},...content){
  return createElement('tr',id,cls,...content)
}

function td({id=null,cls=null}={},...content){
  return createElement('td',id,cls,...content)
}

function span({id=null,cls=null}={},...content){
  return createElement('span',id,cls,...content)
}