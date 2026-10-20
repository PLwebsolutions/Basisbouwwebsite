/* =====================================================================
   PAS HIER JE GEGEVENS AAN
   ===================================================================== */
var CONFIG = {
  telefoon: '+31630937447',
  whatsapp: '31630937447',
  email: 'info@plwebsolutions.nl',
  waTekst: 'Hoi Pleun en Lars, ik heb een vraag over een website voor mijn bedrijf.'
};
var PRIJZEN = { Starter: 799, Business: 1199, Premium: 1999, Elite: 3500 };

(function () {
  var root = document.documentElement;
  var reduce = root.classList.contains('rm');
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var euro = function (n) { return '€\u00a0' + new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 }).format(n); };
  var wa = function (t) { return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(t || CONFIG.waTekst); };

  $$('[data-tel]').forEach(function (a) { a.href = 'tel:' + CONFIG.telefoon; });
  $$('[data-wa]').forEach(function (a) { a.href = wa(a.getAttribute('data-wa') || ''); });
  $$('[data-mail]').forEach(function (a) { a.href = 'mailto:' + CONFIG.email; });

  requestAnimationFrame(function () { root.classList.add('ready'); });

  /* menu */
  var menuBtn = $('#menuBtn');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    $$('#mmenu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });
  }

  /* reveals */
  var rvs = $$('.rv, .rv-img');
  if (reduce || !('IntersectionObserver' in window)) rvs.forEach(function (el) { el.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) { io.observe(el); });
  }

  /* scroll: nav, parallax, zwevende knoppen */
  var nav = $('#nav'), fab = $('#fab'), mbar = $('#mbar'), flow = $('#flow');
  var pxs = reduce ? [] : $$('[data-px]');
  var last = -1;
  function frame() {
    var y = scrollY;
    if (y !== last) {
      last = y;
      nav.classList.toggle('is-solid', y > 30);
      var vh = innerHeight;
      for (var i = 0; i < pxs.length; i++) {
        var el = pxs[i], r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        var k = +el.getAttribute('data-px');
        var lim = r.height * .07, off = clamp((r.top + r.height / 2 - vh / 2) * -k, -lim, lim);
        el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0) scale(1.04)';
      }
      var hideFor = flow ? flow.getBoundingClientRect() : null;
      var flowIn = hideFor && hideFor.top < vh * .8 && hideFor.bottom > vh * .2;
      var show = y > vh * .6 && !flowIn;
      if (fab) fab.classList.toggle('is-on', show);
      if (mbar) mbar.classList.toggle('is-on', show);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* telefoon kantelt mee met de muis */
  var phone = $('.phone');
  if (phone && fine && !reduce) {
    addEventListener('mousemove', function (e) {
      var x = e.clientX / innerWidth - .5, yy = e.clientY / innerHeight - .5;
      phone.style.transform = 'rotateY(' + (-14 + x * 10).toFixed(2) + 'deg) rotateX(' + (6 - yy * 8).toFixed(2) + 'deg) rotateZ(2deg)';
    }, { passive: true });
  }

  /* rekenvoorbeeld */
  var cK = $('#cKlus');
  if (cK) {
    var cM = $('#cMarge'), cE = $('#cExtra'), pick = $('#pkgPick'), gekozen = 'Business';
    pick.innerHTML = Object.keys(PRIJZEN).map(function (n) { return '<button type="button" aria-pressed="' + (n === gekozen) + '" data-n="' + n + '">' + n + ' ' + euro(PRIJZEN[n]) + '</button>'; }).join('');
    pick.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      gekozen = b.getAttribute('data-n');
      $$('button', pick).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      calc();
    });
    var fill = function (r) { r.style.setProperty('--fill', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); };
    var calc = function () {
      var klus = +cK.value, m = +cM.value, x = +cE.value, per = klus * m / 100, prijs = PRIJZEN[gekozen];
      $('#oKlus').textContent = euro(klus); $('#oMarge').textContent = m + '%'; $('#oExtra').textContent = x;
      $('#rWinst').textContent = euro(per * x);
      var n = prijs / per;
      $('#rTerug').textContent = n <= 1 ? '1 klus' : new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 }).format(n) + ' klussen';
      [cK, cM, cE].forEach(fill);
    };
    [cK, cM, cE].forEach(function (r) { r.addEventListener('input', calc); });
    calc();
  }

  /* aanvraag in stappen, eindigt in WhatsApp */
  if (flow) {
    var steps = $$('[data-step]', flow), bar = $('#flowBar'), step = 1;
    var VAKKEN = ['Schildersbedrijf', 'Aannemer of bouwbedrijf', 'Klusbedrijf', 'Installateur of elektricien', 'Hovenier', 'Ander vak'];
    var DOELEN = ['Een nieuwe website', 'Mijn site vernieuwen', 'Meer aanvragen', 'Personeel vinden', 'Beter gevonden in Google'];
    var PKGS = ['Starter', 'Business', 'Premium', 'Elite', 'Weet ik nog niet'];
    var opt = function (type, name, v) { return '<label class="opt"><input type="' + type + '" name="' + name + '" value="' + v + '"><span>' + v + '</span></label>'; };
    $('#tVak').innerHTML = VAKKEN.map(function (v) { return opt('radio', 'vak', v); }).join('');
    $('#tDoel').innerHTML = DOELEN.map(function (v) { return opt('checkbox', 'doel', v); }).join('');
    $('#tPkg').innerHTML = PKGS.map(function (v) { return opt('radio', 'pkg', v); }).join('');
    var pre = new URLSearchParams(location.search).get('pakket');
    if (pre) { var p = $('input[name=pkg][value="' + pre + '"]', flow); if (p) p.checked = true; }
    var val = function () {
      var g = function (n) { var c = $('input[name=' + n + ']:checked', flow); return c ? c.value : ''; };
      return { vak: g('vak'), pkg: g('pkg'), doel: $$('input[name=doel]:checked', flow).map(function (i) { return i.value; }),
        naam: $('#fNaam').value.trim(), bedrijf: $('#fBedrijf').value.trim(), plaats: $('#fPlaats').value.trim(), note: $('#fNote').value.trim() };
    };
    var bericht = function () {
      var v = val(), l = ['Hoi Pleun en Lars, ik wil graag een kennismaking plannen.', ''];
      l.push('Naam: ' + (v.naam || '-'));
      if (v.bedrijf) l.push('Bedrijf: ' + v.bedrijf);
      if (v.vak) l.push('Vak: ' + v.vak);
      if (v.plaats) l.push('Plaats: ' + v.plaats);
      if (v.doel.length) l.push('Waarmee: ' + v.doel.join(', ').toLowerCase());
      if (v.pkg) l.push('Pakket: ' + v.pkg);
      if (v.note) l.push('', v.note);
      return l.join('\n');
    };
    var show = function (n) {
      step = n;
      steps.forEach(function (s) { s.hidden = +s.getAttribute('data-step') !== n; });
      bar.style.width = (Math.min(n, 3) / 3 * 100) + '%';
      $('#fPrev').hidden = n === 1 || n === 4; $('#fNext').hidden = n >= 3; $('#fSend').hidden = n !== 3;
      $('#fNav').hidden = n === 4;
    };
    var err = function (n, t) { $('#err' + n).textContent = t || ''; };
    var refresh = function () {
      var m = bericht();
      $('#fSend').href = wa(m);
      $('#fMail').href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Kennismaking website') + '&body=' + encodeURIComponent(m);
    };
    flow.addEventListener('input', function () { refresh(); err(1); err(2); err(3); });
    flow.addEventListener('change', function (e) { if (e.target.name === 'vak' && fine) setTimeout(function () { show(2); }, 250); });
    $('#fNext').addEventListener('click', function () {
      var v = val();
      if (step === 1 && !v.vak) return err(1, 'Kies wat voor bedrijf je hebt.');
      if (step === 2 && !v.doel.length) return err(2, 'Kies minstens één onderwerp.');
      show(step + 1); refresh();
    });
    $('#fPrev').addEventListener('click', function () { show(step - 1); });
    $('#fSend').addEventListener('click', function (e) {
      if (!val().naam) { e.preventDefault(); err(3, 'Vul je naam in, dan weten we wie we spreken.'); $('#fNaam').focus(); return; }
      refresh(); setTimeout(function () { show(4); }, 400);
    });
    $('#fReset').addEventListener('click', function () {
      $$('input', flow).forEach(function (i) { if (i.type === 'radio' || i.type === 'checkbox') i.checked = false; else i.value = ''; });
      $('#fNote').value = ''; show(1); refresh();
    });
    show(1); refresh();
  }
})();
