(() => {
  const ID = 'abl-panel';
  const st = { a: null, b: null, on: true, vid: null };

  const fmt = (t) => {
    if (t == null) return '--:--';
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = (t % 60).toFixed(1).padStart(4, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
  };

  const player = () => document.getElementById('movie_player');
  const video = () =>
    document.querySelector('#movie_player video.html5-main-video') ||
    document.querySelector('#movie_player video');
  const inAd = () => player()?.classList.contains('ad-showing');
  const videoId = () => new URLSearchParams(location.search).get('v');

  const panel = document.createElement('div');
  panel.id = ID;
  panel.className = 'abl-panel';

  const mk = (label, title, fn) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.title = title;
    b.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); fn(); });
    return b;
  };

  const btnA = mk('Set A', 'Set loop start to current time', () => {
    const v = video(); if (!v || inAd()) return;
    st.a = v.currentTime;
    if (st.b != null && st.a >= st.b) st.b = null;
    render();
  });

  const btnB = mk('Set B', 'Set loop end to current time', () => {
    const v = video(); if (!v || inAd()) return;
    st.b = v.currentTime;
    if (st.a != null) {
      if (st.b < st.a) [st.a, st.b] = [st.b, st.a];
      else if (st.b === st.a) st.b = null;
    }
    if (st.a != null && st.b != null && st.on) v.currentTime = st.a;
    render();
  });

  const times = document.createElement('span');
  times.className = 'abl-times';

  const btnLoop = mk('Loop', 'Enable/disable loop', () => { st.on = !st.on; render(); });
  const btnReset = mk('Reset', 'Clear A and B', () => { st.a = st.b = null; render(); });

  ['mousedown', 'mouseup', 'dblclick', 'keydown', 'keyup'].forEach((ev) =>
    panel.addEventListener(ev, (e) => e.stopPropagation())
  );

  panel.append(btnA, times, btnB, btnLoop, btnReset);

  function render() {
    times.textContent = `A ${fmt(st.a)}  |  B ${fmt(st.b)}`;
    btnA.classList.toggle('abl-set', st.a != null);
    btnB.classList.toggle('abl-set', st.b != null);
    btnLoop.textContent = st.on ? 'Loop: ON' : 'Loop: OFF';
    btnLoop.classList.toggle('abl-on', st.on);
  }

  // Loop engine
  setInterval(() => {
    const v = video();
    if (!v || !st.on || st.a == null || st.b == null || inAd()) return;
    if (v.ended) {
      v.currentTime = st.a;
      v.play();
    } else if (!v.paused && v.currentTime >= st.b) {
      v.currentTime = st.a;
    }
  }, 40);

  // Keep panel mounted; reset on video change (YouTube is an SPA)
  setInterval(() => {
    const vid = videoId();
    if (vid !== st.vid) {
      st.vid = vid;
      st.a = st.b = null;
      render();
    }
    const p = player();
    if (p && panel.parentNode !== p) p.appendChild(panel);
  }, 500);

  render();
})();
