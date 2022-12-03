function hide(element){
  if (typeof(element) === 'string')
    return hide(document.getElementById(element));
  element.classList.add('hidden');
}

function show(element){
  if (typeof(element)==='string')
    return show(document.getElementById(element));
  if(element.classList.contains('hidden'))
    element.classList.remove('hidden');
}

function animate(element, animation = null, direction = null,delay=0) {
  if (typeof (element) === 'string')
    return animate(document.getElementById(element),animation,direction,delay);

  if (animation && direction) {
    setTimeout(() => {
      element.classList.add(animation + '-' + direction);
      duration = getComputedStyle(element).animationDuration;
      duration = parseFloat(duration.replace('s', '')) * 1000;
      if (direction === 'in') {
        show(element);
        setTimeout(() => {
          element.classList.remove(animation + '-in');
        }, duration);
      } else {
        setTimeout(() => {
          element.classList.remove(animation + '-out');
          hide(element);
        }, duration);
      }
    }, delay);
  } else {
    console.error('animation is not set for', element);
  }
}

function kbd_clear(element){
  txt = element.innerText;
  element.classList.replace('typing-in','typing-out')
  return new Promise((res) => setTimeout(()=>{element.classList.remove('typing-out');res()}, 100 * txt.length));
}

var r = document.querySelector(':root');

function kbd_type(element,inner_html){
  if (typeof(element)==='string')
    return kbd_type(document.getElementById(element),inner_html)

  if (element.classList.contains('typing-in')){
    kbd_clear(element).then(()=>{kbd_type(element,inner_html)});
    return
  }
  
  element.innerHTML = inner_html;
  txt = element.innerText;
  r.style.setProperty('--text-len',txt.length.toString());
  element.classList.add('typing-in');
}