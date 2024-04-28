/* eslint-disable func-names */
/* global io, my, Howl */

const socket = io();
const params = new URLSearchParams(window.location.toString().substring(window.location.toString().indexOf('?')));
const copyBtn = document.querySelector('#copy');
let language = 'English';

const pop = new Howl({ src: ['audio/pop.mp3'] });
const exit = new Howl({ src: ['audio/exit.mp3'] });

function animateCSS(e, t, n = !0) {
    return new Promise((r) => {
        const o = `animate__${t}`;
        const a = n ? document.querySelector(e) : e;
        a.classList.add('animate__animated', o);
        function i(e) {
            e.stopPropagation();
            a.classList.remove('animate__animated', o);
            r('Animation ended');
        }
        a.addEventListener('animationend', i, { once: !0 });
    });
}

function updateSettings(e) {
    e.preventDefault();
    socket.emit('settingsUpdate', {
        rounds: document.querySelector('#rounds').value,
        time: document.querySelector('#time').value,
        customWords: Array.from(new Set(document.querySelector('#customWords').value.split('\n').map((e) => e.trim()).filter((e) => e !== ''))),
        probability: document.querySelector('#probability').value,
        language: document.querySelector('#language').value,
    });
}

function putPlayer(e) {
    const t = document.createElement('div');
    const n = document.createElement('img');
    const r = document.createElement('p');
    const o = document.createTextNode(e.name);
    t.id = `skribblr-${e.id}`;
    r.appendChild(o);
    r.classList.add('text-center');
    n.src = e.avatar;
    n.alt = e.name;
    n.classList.add('img-fluid', 'rounded-circle');
    t.classList.add('col-4', 'col-sm-3', 'col-md-4', 'col-lg-3');
    n.onload = async () => {
        t.appendChild(n);
        t.appendChild(r);
        document.querySelector('#playersDiv').appendChild(t);
        pop.play();
        await animateCSS(t, 'fadeInDown', !1);
    };
}

function showCanvasArea() {
    const e = document.createElement('script');
    const t = document.createElement('script');
    e.src = 'https://cdn.jsdelivr.net/npm/responsive-sketchpad/dist/sketchpad.min.js';
    t.src = 'js/canvas.js';
    document.body.append(e);
    e.addEventListener('load', async () => {
        document.body.append(t);
        animateCSS('#settings>div', 'fadeOutLeft');
        animateCSS('#settings>div:nth-of-type(2)', 'fadeOutRight');
        document.querySelector('#gameZone').classList.remove('d-none');
        await animateCSS('#gameZone', 'fadeInDown');
        document.querySelector('#settings').remove();
    });
}

socket.on('joinRoom', putPlayer);
socket.on('otherPlayers', (e) => e.forEach((e) => putPlayer(e)));
socket.on('disconnection', async (e) => {
    if (document.querySelector(`#skribblr-${e.id}`)) {
        exit.play();
        await animateCSS(`#skribblr-${e.id}`, 'fadeOutUp');
        document.querySelector(`#skribblr-${e.id}`).remove();
    }
});
socket.on('startGame', showCanvasArea);

if (params.has('id')) {
    document.querySelector('#rounds').setAttribute('disabled', !0);
    document.querySelector('#time').setAttribute('disabled', !0);
    document.querySelector('#startGame').setAttribute('disabled', !0);
    document.querySelector('#language').setAttribute('disabled', !0);
    document.querySelector('#playGame').addEventListener('click', async () => {
        await animateCSS('#landing>div>div', 'hinge');
        document.querySelector('#landing').remove();
        document.querySelector('#settings').classList.remove('d-none');
        await animateCSS('#settings div', 'jackInTheBox');
        my.id = socket.id;
        if (params.has('id')) {
            document.querySelector('#gameLink').value = `${window.location.protocol}//${window.location.host}/?id=${params.get('id')}`;
            putPlayer(my);
        }
        socket.emit('joinRoom', { id: params.get('id'), player: my });
    });
} else {
    document.querySelector('#rounds').addEventListener('input', updateSettings);
    document.querySelector('#time').addEventListener('input', updateSettings);
    document.querySelector('#customWords').addEventListener('change', updateSettings);
    document.querySelector('#probability').addEventListener('change', updateSettings);
    document.querySelector('#language').addEventListener('change', updateSettings);
    document.querySelector('#createRoom').addEventListener('click', async () => {
        await animateCSS('#landing>div>div', 'hinge');
        document.querySelector('#landing').remove();
        document.querySelector('#settings').classList.remove('d-none');
        animateCSS('#settings div', 'jackInTheBox');
        await animateCSS('#settings>div:nth-of-type(2)', 'jackInTheBox');
        my.id = socket.id;
        socket.emit('newPrivateRoom', my);
        socket.on('newPrivateRoom', (e) => {
            document.querySelector('#gameLink').value = `${window.location.protocol}//${window.location.host}/?id=${e.gameID}`;
            putPlayer(my);
        });
    });
}

copyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#gameLink').select();
    document.execCommand('copy');
});

document.querySelector('#startGame').addEventListener('click', async () => {
    showCanvasArea();
    socket.emit('startGame');
    socket.emit('getPlayers');
});

document.querySelector('#language').addEventListener('input', function () {
    language = this.value;
    if (language === 'English') return;
    if (document.querySelector('#transliterate')) return;
    const e = document.createElement('script');
    e.id = 'transliterate';
    e.src = 'js/transliterate.js';
    document.body.append(e);
});
