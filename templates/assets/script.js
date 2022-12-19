let curtain_slide = 0;
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

let curtain_view = null;
function loadView(viewId) {
    let view = document.getElementById(viewId);
    if (curtain_view) {
        return animate(curtain_view, 'fade', 'out')
            .then(() => animate(view, 'fade', 'in'))
            .then(() => { curtain_view = view });
    }
    return animate(view, 'fade', 'in')
        .then(() => { curtain_view = view });
}

function request(action, params = {}, method = 'GET', callback = null, error_handlers = {}) {
    let url = '/api/v1/' + action + '?' + (new URLSearchParams(params)).toString();
    return fetch(url, { method: method, redirect: 'follow', })
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

function validate(event) {
    if ((event.key.length === 1 && /\D/.test(event.key)) || event.currentTarget.textLength > 10) {
        event.preventDefault();
    }
}

function type_text(html) { return kbd_type('loading-text', html) }

function pre(style, content) { return `<span class="pre-${style}">${content}</span>` }

function createElement(tag, id = null, cls = null, ...contents) {
    let elem = document.createElement(tag);
    if (id)
        elem.id = id;
    if (cls)
        if (typeof (cls) === 'string')
            elem.classList.add(cls);
        else
            elem.classList.add(...cls);

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

function table({ id = null, cls = null } = {}, ...content) {
    return createElement('table', id, cls, ...content)
}

function thead({ id = null, cls = null } = {}, ...content) {
    return createElement('thead', id, cls, ...content)
}

function tbody({ id = null, cls = null } = {}, ...content) {
    return createElement('tbody', id, cls, ...content)
}

function tr({ id = null, cls = null } = {}, ...content) {
    return createElement('tr', id, cls, ...content)
}

function td({ id = null, cls = null } = {}, ...content) {
    return createElement('td', id, cls, ...content)
}

function span({ id = null, cls = null } = {}, ...content) {
    return createElement('span', id, cls, ...content)
}

function div({ id = null, cls = null } = {}, ...content) {
    return createElement('div', id, cls, ...content)
}

function p({ id = null, cls = null } = {}, ...content) {
    return createElement('p', id, cls, ...content)
}

function small({ id = null, cls = null } = {}, ...content) {
    return createElement('small', id, cls, ...content)
}

function textNode(...content) {
    return document.createTextNode(content.join(' '))
}

var mouseX;
var mouseY;
var mouseTarget = null;
function attachTooltip(element, tooltipContentGenerator) {
    if (typeof (element) === 'string')
        return attachTooltip(document.getElementById(element), tooltipContentGenerator);

    element.onmouseover = event => {
        if(event.target!==element || mouseTarget===element)
            return
        mouseTarget = element;
        let tooltipElement = div({ id: 'tooltip', cls: ['tooltip', 'hidden'] }, span({ 'cls': 'spinner' }));
        tooltipElement.onmouseover = () => {
            element.onmouseleave = () => { };
            tooltipElement.onmouseleave = () => {
                if(mouseTarget === element)
                    mouseTarget = null;
                animate(tooltipElement, 'fade', 'out').then(() => { tooltipElement.remove(); })
            }
        }
        let tooltipTimeout = setTimeout(() => {
            tooltipTimeout = null;
            tooltipElement.style.top = mouseY + 'px';
            tooltipElement.style.left = mouseX + 'px';
            document.body.append(tooltipElement);
            (new Promise((resolve) => resolve(tooltipContentGenerator()))).then(res=>{tooltipElement.replaceChildren(...res)})
            animate(tooltipElement, 'fade', 'in');
        }, 2000)
        element.onmouseleave = () => {
            if (tooltipTimeout !== null) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
            if (document.body.contains(tooltipElement))
                animate(tooltipElement,'fade','out').then(()=>{tooltipElement.remove()})
            if(mouseTarget === element)
                mouseTarget = null;
            element.onmouseleave = () => { };
        }
    }
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
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