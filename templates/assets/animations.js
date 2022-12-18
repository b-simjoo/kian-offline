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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function animate(element, animation = null, direction = null,delay=0) {
  if (typeof (element) === 'string')
    return animate(document.getElementById(element),animation,direction,delay);

  if (animation && direction) {
    return sleep(delay)
    .then(()=>{
      element.classList.add(animation + '-' + direction);
      duration = getComputedStyle(element).animationDuration;
      duration = parseFloat(duration.replace('s', '')) * 1000;
      if (direction==='in')
        show(element);
      return sleep(duration);})
    .then(()=>{
      element.classList.remove(animation + '-' + direction);
      if (direction === 'out')
        hide(element);
    });
  } else {
    console.error('animation is not set for', element);
  }
}

function shake(element) {
  if (typeof (element) === 'string')
    return shake(document.getElementById(element));

    element.classList.add('earthquake');
    setTimeout(() => {
      element.classList.remove('earthquake');
    }, 1000);
}

function kbd_clear(element){
  let txt = element.innerText;
  element.classList.replace('typing-in','typing-out')
  return sleep(100 * txt.length).then(()=>element.classList.remove('typing-out'));
}

var r = document.querySelector(':root');

function kbd_type(element,inner_html){
  if (typeof(element)==='string')
    return kbd_type(document.getElementById(element),inner_html)

  if (element.classList.contains('typing-in')){
    return kbd_clear(element).then(()=>kbd_type(element,inner_html));
  }
  
  element.innerHTML = inner_html;
  let txt = element.innerText;
  r.style.setProperty('--text-len',txt.length.toString());
  element.classList.add('typing-in');
  return sleep(100 * txt.length);
}