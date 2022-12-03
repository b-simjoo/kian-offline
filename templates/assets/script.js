curtain_slide = 0
function slide(slide) {
  container = document.getElementById('container')
  slides = container.children
  if (curtain_slide<slide){
    animate(slides[curtain_slide], 'fade-left', 'out');
    animate(slides[slide], 'fade', 'in', 2000);
  }else{
    animate(slides[curtain_slide], 'fade', 'out');
    animate(slides[slide], 'fade-left', 'in', 2000);
  }
  curtain_slide = slide;
}

function request(action, params = {}, callback, failed) {
  url = '/api/v1/' + action + '?' + (new URLSearchParams(params)).toString();
  fetch(url, { method: 'GET', redirect: 'follow', })
    .then((res) => {
      if (res.ok)
        return res.json();
      throw new Error('Unknown error, please try again.');
    }).then((res) => {
      if (!res.done) {
        if (res.redirect)
          setTimeout(function () { window.location = res.redirect; }, 10000);
        throw new Error(emessages[res.error]);
      }
      return res
    }).then((res) => {
      if (callback)
        callback(res);
    }).catch((error) => {
      if (failed)
        failed(error);
    })
}

function validate(event) {
  if ((event.key.length === 1 && /\D/.test(event.key)) || event.currentTarget.textLength>10) {
    event.preventDefault();
  }
}

function register() {

}