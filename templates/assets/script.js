curtain_slide = 0
function slide(slide) {
  container = document.getElementById('container')
  slides = container.children
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

function request(action, params = {}, method = 'GET', callback = null, error_handlers = {}) {
  url = '/api/v1/' + action + '?' + (new URLSearchParams(params)).toString();
  fetch(url, { method: method, redirect: 'follow', })
    .then((res)=>{
      if (res.status===200)
        return res.json().then(callback);
      return res.json().then(error_handlers[res.status]);})
}

function show_msg(message_type, text, duration=10000){
  var msg_elem = document.createElement("div");
  msg_elem.innerHTML=text;
  msg_elem.classList.add('msg', message_type);
  hide(msg_elem);
  container = document.getElementById('msg-container');
  container.insertBefore(msg_elem,container.firstChild);
  animate(msg_elem,'fade-down','in')
  animate(msg_elem,'fade-left','out',duration);
}

function validate(event) {
  if ((event.key.length === 1 && /\D/.test(event.key)) || event.currentTarget.textLength>10) {
    event.preventDefault();
  }
}

function type_text(html){ return kbd_type('loading-text', html) }

function pre(style,content){return `<span class="pre-${style}">${content}</span>`}