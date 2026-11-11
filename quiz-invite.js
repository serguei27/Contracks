/* Delivery Score page: situation picker with an animated example result. The examples are illustrative,
   with reachable values (each C is 0, 33, 67 or 100; the score is Yes answers out of 15). The picked
   situation stays in the page and goes into the lead data only, never the address. */
(function () {
  var S = {
    start: { label: 'About to start delivery', score: 47, work: 7, level: 'Level 3 · Controlled', cs: [33, 33, 67, 67, 33], fixes: [
      ['See which decisions have no owner yet', 'Give every open decision an owner and a deadline before mobilisation.', 'A free 45-minute call on your result.'],
      ['Know if your dates match what suppliers committed', 'Check each key date against the supplier’s confirmed capacity.', 'The Start Programme.'],
      ['Set the weekly rhythm before day one', 'Fix one weekly control meeting, with one agenda.', 'The five-line checklist in your free report.']] },
    resolve: { label: 'Programme drifting', score: 33, work: 5, level: 'Level 2 · Managed', cs: [33, 33, 33, 33, 33], fixes: [
      ['See where the plan and the site have split', 'Compare the baseline with what the site is actually building.', 'A Delivery Control Reset, in 10 business days.'],
      ['Know which open decisions are costing time', 'List every decision older than two weeks, with its owner.', 'The three first actions in your free report.'],
      ['Know what to fix first', 'Rank your top risks by cost and by date.', 'A free 45-minute call on your result.']] },
    reshape: { label: 'Change not sticking', score: 53, work: 8, level: 'Level 3 · Controlled', cs: [67, 33, 67, 67, 33], fixes: [
      ['See where change gets in without a gate', 'Log every scope change with its time and cost impact before approval.', 'A Programme Turnaround, in 6 weeks.'],
      ['Know who decides what', 'Write down who decides, and by when, for the ten biggest decisions.', 'The five-line checklist in your free report.'],
      ['Make the new rhythm hold without you', 'Hand the weekly cadence to a named owner.', 'The Programme Turnaround handover.']] },
    grow: { label: 'Scaling the portfolio', score: 73, work: 11, level: 'Level 4 · Operational', cs: [67, 67, 67, 100, 67], fixes: [
      ['See which controls only work because of key people', 'List the decisions that still need you in the room.', 'The CONTROL Tower Programme.'],
      ['Know if supplier dates hold across projects', 'Check lead times against capacity before a date enters any baseline.', 'The three first actions in your free report.'],
      ['Keep one story for the board', 'One weekly view across every project.', 'The CONTROL Tower Programme.']] }
  };
  var ORDER = ['start', 'resolve', 'reshape', 'grow'], NAMES = ['CONTAIN', 'COMMAND', 'CLOSE', 'CONFIRM', 'CONTROL'];
  var WRENCH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/></svg>';
  var PERSON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>';
  var $ = function (id) { return document.getElementById(id); };
  var chips = $('invChips'); if (!chips) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var picked = null, shown = 'resolve', timer = null, stopped = false, visible = false, countT = null;
  var track = function (ev) { if (window.cksTrack) cksTrack(ev, { brand: 'Contracks Global' }); };

  ORDER.forEach(function (k) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = S[k].label; b.setAttribute('data-key', k); b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { stop(); picked = k; show(k); track('quiz_invite_situation_' + k); });
    chips.appendChild(b);
  });
  $('exBars').innerHTML = NAMES.map(function (n) { return '<div><span>' + n + '</span><s><u></u></s><em></em></div>'; }).join('');

  function color(v) { return v < 40 ? 'var(--red)' : v < 70 ? 'var(--gold)' : '#2D6A4F'; }
  function show(k) {
    var d = S[k]; shown = k;
    [].forEach.call(chips.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-key') === (picked || k) && !!picked)); });
    $('exTitle').textContent = 'Your result · ' + d.label;
    $('exGauge').setAttribute('aria-label', 'Example score: ' + d.score + ' out of 100');
    $('exArc').style.strokeDashoffset = String(198 * (1 - d.score / 100));
    $('exWork').textContent = d.work + ' of 15'; $('exLevel').textContent = d.level;
    [].forEach.call($('exBars').children, function (row, i) {
      var u = row.querySelector('u'); u.style.width = d.cs[i] + '%'; u.style.backgroundColor = color(d.cs[i]);
      row.querySelector('em').textContent = d.cs[i] + '%';
    });
    count(d.score);
    var f = $('exFixes');
    f.innerHTML = d.fixes.map(function (x) {
      return '<div class="fix' + (reduce ? '' : ' pre') + '"><b>' + x[0] + '</b><span class="self">' + WRENCH + 'Fix it yourself:</span> ' + x[1] +
        '<br><span class="help">' + PERSON + 'Or with help:</span> ' + x[2] + '</div>';
    }).join('');
    if (!reduce) [].forEach.call(f.children, function (c, i) { setTimeout(function () { c.classList.remove('pre'); }, 250 + i * 220); });
  }
  function count(to) {
    var el = $('exScore'); clearInterval(countT);
    if (reduce) { el.textContent = to; return; }
    var t0 = Date.now();
    countT = setInterval(function () { var p = Math.min(1, (Date.now() - t0) / 900); el.textContent = Math.round(to * p); if (p === 1) clearInterval(countT); }, 30);
  }
  function stop() { stopped = true; clearInterval(timer); timer = null; }
  function cycle() {
    clearInterval(timer); timer = null;
    if (stopped || reduce || !visible) return;
    timer = setInterval(function () { show(ORDER[(ORDER.indexOf(shown) + 1) % ORDER.length]); }, 5200);
  }
  var sec = $('invite');
  sec.addEventListener('mouseenter', stop); sec.addEventListener('focusin', stop);
  if ('IntersectionObserver' in window) {
    var seen = false;
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && es[0].intersectionRatio >= .5 && !seen) { seen = true; track('quiz_invite_viewed'); }
      cycle();
    }, { threshold: [0, .5] }).observe(sec);
  } else { visible = true; cycle(); }
  show('resolve');

  // The picked situation goes with the score into both forms, and is echoed at the start of the quiz.
  $('invStart').addEventListener('click', function () {
    track('quiz_invite_cta_' + (picked || 'none'));
    [].forEach.call(document.querySelectorAll('input[name="situation_picked"]'), function (i) { i.value = picked ? S[picked].label : ''; });
    var q = $('quiz'); if (!q || !picked) return;
    var told = $('invTold');
    if (!told) { told = document.createElement('p'); told.id = 'invTold'; told.className = 'inv-told'; q.insertBefore(told, q.firstChild); }
    told.textContent = 'You told us: ' + S[picked].label.toLowerCase() + '. Let’s see where you stand.';
    window.scrollTo(0, 0);
  });
})();
