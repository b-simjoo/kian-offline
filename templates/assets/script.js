var curtain_slide = 0;
function slide(slide) {
    let container = document.getElementById('container');
    let slides = container.children;
    if (curtain_slide < slide) {
        return animate(slides[curtain_slide], 'fade-left', 'out')
            .then(() => animate(slides[slide], 'fade', 'in'))
            .then(() => { curtain_slide = slide });
    } else {
        return animate(slides[curtain_slide], 'fade', 'out')
            .then(() => animate(slides[slide], 'fade-left', 'in'))
            .then(() => { curtain_slide = slide });
    }
}

var curtainView = null;
function loadView(viewId) {
    let view = document.getElementById(viewId);
    if (curtainView) {
        return animate(curtainView, 'fade', 'out')
            .then(() => animate(view, 'fade', 'in'))
            .then(() => { curtainView = viewId });
    }
    return animate(view, 'fade', 'in')
        .then(() => { curtainView = viewId });
}

function request(action, params = {}, method = 'GET', callback = null, error_handlers = {}, data = null) {
    let url = '/api/v1/' + action + '?' + (new URLSearchParams(params)).toString();
    options = { method: method, redirect: 'follow', };
    if (data){
        options.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        options.body = JSON.stringify(data);
    }
    return fetch(url, options)
        .then((res) => {
            if (res.status === 200)
                return res.json().then(callback);
            return res.json().then(error_handlers[res.status]);
        })
}

function show_msg(message_type, text, duration = 10000) {
    let msg_elem = document.createElement("div");
    msg_elem.innerHTML = text;
    msg_elem.classList.add('msg', message_type);
    msg_elem.onclick = (e) => { animate(msg_elem, 'fade-left', 'out').then(() => msg_elem.remove()); }
    hide(msg_elem);
    let container = document.getElementById('msg-container');
    container.insertBefore(msg_elem, container.firstChild);
    animate(msg_elem, 'fade-down', 'in')
        .then(() => sleep(duration))
        .then(() => {
            if (container.contains(msg_elem)) {
                animate(msg_elem, 'fade-left', 'out')
                    .then(() => msg_elem.remove())
            }
        });
}

function type_text(html) { return kbd_type('loading-text', html) }

function pre(style, content) { return `<span class="pre-${style}">${content}</span>` }

function createElement(tag, attrs = {}, ...contents) {
    let elem = document.createElement(tag);
    if (typeof attrs.cls !== 'undefined')
        if (typeof (attrs.cls) === 'string')
            elem.classList.add(attrs.cls);
        else
            elem.classList.add(...attrs.cls);
        delete attrs.cls;

    Object.entries(attrs).forEach(([key,value])=>{elem.setAttribute(key,value)})
    
    contents.forEach((content) => {
        if (typeof (content) === 'string')
            elem.innerHTML += content;
        else if (typeof content[Symbol.iterator] === 'function')
            elem.append(...content);
        else if (content !== null)
            elem.append(content);
    })
    return elem
}

function validateSFloat(e,nullable=false){
    if((e.currentTarget.value=="" && nullable) || /^[+-]?\d+(.\d+)?$/.test(e.currentTarget.value))
        e.currentTarget.dataset.error=false;
    else
        e.currentTarget.dataset.error=true;
}

function validateFloat(e,nullable=false){
    if((e.currentTarget.value=="" && nullable) || /^\d+(.\d+)?$/.test(e.currentTarget.value))
        e.currentTarget.dataset.error=false;
    else
        e.currentTarget.dataset.error=true;
}

function filter (e,reg=/\d/){
    if(!reg.test(e.key)){
        e.preventDefault();
        return false;
    }
}

function table(attrs={}, ...content) {
    return createElement('table', attrs, ...content)
}

function thead(attrs={}, ...content) {
    return createElement('thead', attrs, ...content)
}

function tbody(attrs={}, ...content) {
    return createElement('tbody', attrs, ...content)
}

function tr(attrs={}, ...content) {
    return createElement('tr', attrs, ...content)
}

function td(attrs={}, ...content) {
    return createElement('td', attrs, ...content)
}

function span(attrs={}, ...content) {
    return createElement('span', attrs, ...content)
}

function div(attrs={}, ...content) {
    return createElement('div', attrs, ...content)
}

function p(attrs={}, ...content) {
    return createElement('p', attrs, ...content)
}

function small(attrs={}, ...content) {
    return createElement('small', attrs, ...content)
}

function textNode(...content) {
    return document.createTextNode(content.join(' '))
}

var mouseX;
var mouseY;
var tooltipHideTimeout, tooltipShowTimeout, tooltipFor;
function attachTooltip(element, tooltipContentGenerator) {
    if (typeof (element) === 'string')
        element = document.getElementById(element);

    element.onmouseover = event => {
        if(event.currentTarget===tooltipFor)        // to prevent showing tooltip for same element
            return
        tooltipFor = element;
        let theTooltip = div({ id: 'tooltip', cls: ['tooltip', 'hidden'] }, span({ 'cls': 'spinner' }));
        theTooltip.onmouseover = () => {
            if (tooltipFor===element && tooltipHideTimeout)
                clearTimeout(tooltipHideTimeout);     // mouse leaves the element, so this prevent the parent to hide tooltip
        }
        theTooltip.onmouseleave = () => {
            animate(theTooltip, 'fade', 'out').then(() => { theTooltip.remove(); if (tooltipFor===element) tooltipFor = null;});
        }
        tooltipShowTimeout && clearTimeout(tooltipShowTimeout)      // force clear time out before set a new one
        tooltipShowTimeout = setTimeout(() => {
            tooltipShowTimeout = null;
            theTooltip.style.top = mouseY + 'px';
            theTooltip.style.left = mouseX + 'px';
            document.body.append(theTooltip);
            (new Promise((resolve) => resolve(tooltipContentGenerator()))).then(res=>{theTooltip.replaceChildren(...res)});
            animate(theTooltip, 'fade', 'in');
        }, 2000)

        element.onmouseleave = () => {
            tooltipHideTimeout = setTimeout(()=>{
                tooltipHideTimeout = null;
                if (tooltipFor===element && tooltipShowTimeout !== null) {
                    clearTimeout(tooltipShowTimeout);
                    tooltipShowTimeout = null;
                } else
                    animate(theTooltip, 'fade', 'out').then(() => { theTooltip.remove(); });
                if (tooltipFor===element) tooltipFor = null;
            },20);
        }
    }
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function show_dialog(dlg){
    if (typeof(dlg)==='string')
        dlg = document.getElementById(dlg);
    animate('dialog-container','fade','in');
    animate(dlg,'fade','in',500);
}

function hide_dialog(dlg){
    if (typeof(dlg)==='string')
        dlg = document.getElementById(dlg);
    animate(dlg,'fade','out');
    animate('dialog-container','fade','out',500);
}

document.onmousemove = (event) => {
    let eventDoc, doc, body;
    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
            (doc && doc.scrollTop || body && body.scrollTop || 0) -
            (doc && doc.clientTop || body && body.clientTop || 0);
    }
    mouseX = event.pageX;
    mouseY = event.pageY;
}